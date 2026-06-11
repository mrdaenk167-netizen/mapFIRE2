// src/hooks/useMQTT.ts — SDK 54, typed

import { useState, useEffect, useRef } from 'react';
import mqttService from '../services/mqttService';
import { TOPICS, RUMAH_DATA } from '../constants/mqttConfig';
import { getStatus } from '../constants/colors';
import type {
  BrokerStatus, RumahSensor, NotifikasiItem,
  Summary, UseMQTTReturn, MQTTPayload,
} from '../types';

function buildInitialState(): Record<string, RumahSensor> {
  const state: Record<string, RumahSensor> = {};
  RUMAH_DATA.forEach(r => {
    state[r.id] = {
      ...r,
      suhu: null,
      asap: null,
      co: null,
      status: 'aman',
      lastUpdate: null,
      online: false,
    };
  });
  return state;
}

export function useMQTT(): UseMQTTReturn {
  const [brokerStatus, setBrokerStatus] = useState<BrokerStatus>('disconnected');
  const [sensorData, setSensorData]     = useState<Record<string, RumahSensor>>(buildInitialState);
  const [notifikasi, setNotifikasi]     = useState<NotifikasiItem[]>([]);
  const prevStatus = useRef<Record<string, string>>({});

  useEffect(() => {
    mqttService.connect((s) => setBrokerStatus(s));

    const unsub = mqttService.subscribe(
      TOPICS.allSensors,
      (topic: string, data: MQTTPayload) => {
        const rumahId = data.id ?? topic.split('/')[2] ?? '';
        const newStatus = getStatus(data.suhu, data.asap, data.co);
        const lama = prevStatus.current[rumahId];

        if (lama && lama !== newStatus && (newStatus === 'bahaya' || newStatus === 'waspada')) {
          const rumah = RUMAH_DATA.find(r => r.id === rumahId);
          const notif: NotifikasiItem = {
            id:      Date.now().toString(),
            rumahId,
            nama:    rumah?.nama   ?? rumahId,
            alamat:  rumah?.alamat ?? '-',
            status:  newStatus,
            suhu:    data.suhu,
            asap:    data.asap,
            co:      data.co,
            waktu:   new Date(),
          };
          setNotifikasi(prev => [notif, ...prev].slice(0, 50));
        }

        prevStatus.current[rumahId] = newStatus;

        setSensorData(prev => ({
          ...prev,
          [rumahId]: {
            ...prev[rumahId]!,
            suhu:       data.suhu,
            asap:       data.asap,
            co:         data.co,
            status:     newStatus,
            lastUpdate: new Date(),
            online:     true,
          },
        }));
      },
    );

    return () => {
      unsub();
      mqttService.disconnect();
    };
  }, []);

  const summary: Summary = Object.values(sensorData).reduce<Summary>(
    (acc, r) => {
      acc[r.status] += 1;
      acc.total     += 1;
      return acc;
    },
    { aman: 0, waspada: 0, bahaya: 0, total: 0 },
  );

  return {
    brokerStatus,
    sensorData,
    sensorList: Object.values(sensorData),
    summary,
    notifikasi,
  };
}
