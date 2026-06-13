import {
  collection,
  doc,
  setDoc,
  writeBatch,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { RumahSensor } from '../types';

type SensorManualData = {
  namaSensor: string;
  lokasi: string;
  latitude: number;
  longitude: number;
  suhu: number;
  asap: number;
  status: 'aman' | 'waspada' | 'bahaya';
};

const ubahIdRumahKeDocumentId = (id: string) => {
  return id.replace(/_/g, '');
};

export const simpanSensorDenganId = async (
  documentId: string,
  data: SensorManualData
) => {
  await setDoc(
    doc(db, 'sensors', documentId),
    {
      ...data,
      updatedAt: serverTimestamp(),
      sumber: 'manual-test',
    },
    { merge: true }
  );

  return documentId;
};

export const simpanBanyakSensorMQTTKeFirestore = async (
  sensorList: RumahSensor[]
) => {
  const dataValid = sensorList.filter((rumah) => {
    return rumah.suhu !== null || rumah.asap !== null || rumah.co !== null;
  });

  if (dataValid.length === 0) {
    return 0;
  }

  const batch = writeBatch(db);

  dataValid.forEach((rumah) => {
    const documentId = ubahIdRumahKeDocumentId(rumah.id);
    const docRef = doc(db, 'sensors', documentId);

    batch.set(
      docRef,
      {
        id: documentId,
        idAsli: rumah.id,
        nama: rumah.nama,
        alamat: rumah.alamat,
        latitude: rumah.latitude,
        longitude: rumah.longitude,
        suhu: rumah.suhu ?? null,
        asap: rumah.asap ?? null,
        co: rumah.co ?? null,
        status: rumah.status,
        online: rumah.online,
        lastUpdate: rumah.lastUpdate ?? null,
        updatedAt: serverTimestamp(),
        sumber: 'mqtt',
      },
      { merge: true }
    );
  });

  await batch.commit();

  return dataValid.length;
};

export const listenSensorRealtime = (callback: (data: any[]) => void) => {
  const sensorRef = collection(db, 'sensors');

  return onSnapshot(sensorRef, (snapshot) => {
    const data = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    callback(data);
  });
};