// src/constants/mqttConfig.ts
// ⚠️ Ganti nilai di bawah dengan kredensial HiveMQ Cloud kamu

import type { RumahConfig } from '../types';

export const MQTT_CONFIG = {
  host:            'eb4e1d970eb448f99b741a9ba4d6eacc.s1.eu.hivemq.cloud',
  port:            8884,
  username:        'mapFIRE',
  password:        'mapFire48',
  clientId:        `mapfire_${Math.random().toString(16).slice(2, 8)}`,
  reconnectPeriod: 3000,
  connectTimeout:  10_000,
  keepalive:       60,
  clean:           true,
} as const;

export const TOPICS = {
  allSensors:  'mapfire/sensor/+', //data setelah +/
  singleRumah: (id: string) => `mapfire/sensor/${id}`, //data setelah +/
} as const;

export const RUMAH_DATA: RumahConfig[] = [
  { id: 'rumah_001', nama: 'Pak Budi Santoso',  alamat: 'Jl. Anggrek No.12, Gubeng',       lat: -7.2658, lng: 112.7524 },
  { id: 'rumah_002', nama: 'Bu Sari Rahayu',     alamat: 'Jl. Mawar No.5, Tambaksari',      lat: -7.2612, lng: 112.7489 },
  { id: 'rumah_003', nama: 'Pak Dodi Pratama',   alamat: 'Jl. Melati No.8, Wonokromo',      lat: -7.2701, lng: 112.7556 },
  { id: 'rumah_004', nama: 'Bu Tini Lestari',    alamat: 'Jl. Flamboyan No.3, Genteng',     lat: -7.2580, lng: 112.7601 },
  { id: 'rumah_005', nama: 'Pak Irwan Setiawan', alamat: 'Jl. Sudirman No.22, Tegalsari',   lat: -7.2635, lng: 112.7470 },
  { id: 'rumah_006', nama: 'Bu Wati Kurniawati', alamat: 'Jl. Ahmad Yani No.5, Wonocolo',   lat: -7.2720, lng: 112.7510 },
  { id: 'rumah_007', nama: 'Pak Hendra Kusuma',  alamat: 'Jl. Gubeng No.3, Gubeng',         lat: -7.2648, lng: 112.7535 },
  { id: 'rumah_008', nama: 'Bu Sumiati',         alamat: 'Jl. Ngagel No.17, Wonokromo',     lat: -7.2690, lng: 112.7560 },
  { id: 'rumah_009', nama: 'Pak Eko Wahyudi',    alamat: 'Jl. Cemara No.7, Tegalsari',      lat: -7.2605, lng: 112.7450 },
  { id: 'rumah_010', nama: 'Bu Rina Handayani',  alamat: 'Jl. Kenanga No.2, Genteng',       lat: -7.2570, lng: 112.7585 },
  { id: 'rumah_011', nama: 'Pak Slamet Riyadi',  alamat: 'Jl. Gajah Mada No.14, Bubutan',   lat: -7.2555, lng: 112.7430 },
  { id: 'rumah_012', nama: 'Bu Nanik Sulistyo',  alamat: 'Jl. Raya Darmo No.8, Wonokromo',  lat: -7.2740, lng: 112.7478 },
];
