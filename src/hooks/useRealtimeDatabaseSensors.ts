// src/hooks/useRealtimeDatabaseSensors.ts

import { useEffect, useState } from 'react';
import { listenSensorRealtimeDatabase } from '../services/realtimeSensorService';
import type { RumahSensor } from '../types';

export const useRealtimeDatabaseSensors = () => {
  const [sensorList, setSensorList] = useState<RumahSensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenSensorRealtimeDatabase(
      (data) => {
        setSensorList(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return {
    sensorList,
    loading,
  };
};