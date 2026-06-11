// src/components/StatusBadge.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import type { StatusSensor } from '../types';

interface Props {
  status: StatusSensor;
  size?:  'sm' | 'md';
}

const CONFIG: Record<StatusSensor, { label: string; color: string; bg: string }> = {
  aman:    { label: '✔ AMAN',    color: COLORS.safe,    bg: COLORS.safe_dim },
  waspada: { label: '⚠ WASPADA', color: COLORS.warning,  bg: COLORS.warning_dim },
  bahaya:  { label: '🔥 BAHAYA', color: COLORS.danger,   bg: COLORS.danger_dim },
};

export default function StatusBadge({ status, size = 'md' }: Props): React.JSX.Element {
  const c       = CONFIG[status] ?? CONFIG.aman;
  const isSmall = size === 'sm';
  return (
    <View style={[
      styles.badge,
      { backgroundColor: c.bg, borderColor: c.color + '50' },
      isSmall && styles.small,
    ]}>
      <Text style={[styles.txt, { color: c.color }, isSmall && styles.txtSm]}>
        {c.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge:  { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 0.5, alignSelf: 'flex-start' },
  small:  { paddingHorizontal: 8, paddingVertical: 3 },
  txt:    { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  txtSm:  { fontSize: 10 },
});
