// src/types/index.ts — Type definitions seluruh aplikasi mapFIRE

export type StatusSensor = 'aman' | 'waspada' | 'bahaya';

export type BrokerStatus =
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

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
  notifikasiTerbaru: NotifikasiItem[];
}

// Data user/petugas dari Firestore
export type UserRole = 'admin' | 'petugas' | 'user';

export type UserStatus = 'active' | 'inactive' | 'blocked';

export interface PetugasUser {
  uid: string;
  nama: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  canAccess: boolean;
  jabatan?: string;
  username?: string;
  createdAt?: unknown;
  lastLoginAt?: unknown;
}

// Input create account
export interface RegisterUserInput {
  nama: string;
  email: string;
  password: string;
}

// Data login sederhana yang bisa dikirim ke MainTabs
export interface MainTabsParams {
  petugas?: {
    uid?: string;
    username?: string;
    nama: string;
    email?: string;
    jabatan?: string;
    role?: UserRole;
  };
}

// Navigation params
export type RootStackParamList = {
  Login: undefined;

  // Dibuat optional supaya navigation.replace('MainTabs') tidak error
  // dan tetap bisa menerima data petugas kalau ingin dikirim.
  MainTabs: MainTabsParams | undefined;

  Detail: {
    rumah: RumahSensor;
  };

  Notifikasi: {
    notifikasi: NotifikasiItem[];
  };
};