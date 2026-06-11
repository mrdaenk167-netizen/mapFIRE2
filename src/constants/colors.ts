// src/constants/colors.ts
import type { StatusSensor } from '../types';

export const COLORS = {
  bg_primary:   '#0f1117',
  bg_secondary: '#161921',
  bg_card:      '#1e2130',

  brand:     '#E24B4A',
  brand_dim: 'rgba(226,75,74,0.12)',

  safe:        '#1D9E75',
  safe_dim:    'rgba(29,158,117,0.12)',
  safe_ring:   'rgba(29,158,117,0.3)',

  warning:      '#EF9F27',
  warning_dim:  'rgba(239,159,39,0.12)',
  warning_ring: 'rgba(239,159,39,0.3)',

  danger:      '#E24B4A',
  danger_dim:  'rgba(226,75,74,0.12)',
  danger_ring: 'rgba(226,75,74,0.3)',

  text_primary:   '#FFFFFF',
  text_secondary: 'rgba(255,255,255,0.6)',
  text_muted:     'rgba(255,255,255,0.35)',
  text_hint:      'rgba(255,255,255,0.2)',

  border:       'rgba(255,255,255,0.08)',
  border_brand: 'rgba(226,75,74,0.2)',
} as const;

export const THRESHOLDS = {
  suhu: { aman: 45, waspada: 65 },
  asap: { aman: 40, waspada: 70 },
  co:   { aman: 1.0, waspada: 5.0 },
} as const;

export function getStatus(
  suhu: number,
  asap: number,
  co: number,
): StatusSensor {
  if (suhu > THRESHOLDS.suhu.waspada || asap > THRESHOLDS.asap.waspada || co > THRESHOLDS.co.waspada)
    return 'bahaya';
  if (suhu > THRESHOLDS.suhu.aman || asap > THRESHOLDS.asap.aman || co > THRESHOLDS.co.aman)
    return 'waspada';
  return 'aman';
}

export function getStatusColor(status: StatusSensor): string {
  switch (status) {
    case 'bahaya':  return COLORS.danger;
    case 'waspada': return COLORS.warning;
    default:        return COLORS.safe;
  }
}
