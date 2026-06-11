// src/types/index.ts — Type definitions seluruh aplikasi mapFIRE

export type StatusSensor = 'aman' | 'waspada' | 'bahaya';

export type BrokerStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';

// Data satu rumah warga dari config
export interface RumahConfig {
  id: string;
  nama: string;
  alamat: string;
  lat: number;
  lng: number;
}

// State sensor real-time digabung dengan data rumah
export interface RumahSensor extends RumahConfig {
  suhu: number | null;
  asap: number | null;
  co: number | null;
  status: StatusSensor;
  lastUpdate: Date | null;
  online: boolean;
}

// Payload MQTT dari ESP32
export interface MQTTPayload {
  id: string;
  suhu: number;
  asap: number;
  co: number;
  status?: StatusSensor;
  timestamp?: number;
}

// Notifikasi alert
export interface NotifikasiItem {
  id: string;
  rumahId: string;
  nama: string;
  alamat: string;
  status: StatusSensor;
  suhu: number;
  asap: number;
  co: number;
  waktu: Date;
}

// Summary ringkasan dashboard
export interface Summary {
  aman: number;
  waspada: number;
  bahaya: number;
  total: number;
}

// Return value useMQTT hook
export interface UseMQTTReturn {
  brokerStatus: BrokerStatus;
  sensorData: Record<string, RumahSensor>;
  sensorList: RumahSensor[];
  summary: Summary;
  notifikasi: NotifikasiItem[];
}

// Navigation params
export type RootStackParamList = {
  Login: undefined;
  MainTabs: { petugas: { username: string; nama: string; jabatan: string } };
  Detail: { rumah: RumahSensor };
  Notifikasi: { notifikasi: NotifikasiItem[] };
};
