// src/components/SensorCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import type { StatusSensor } from '../types';

interface Props {
  icon:   string;
  label:  string;
  value:  number | null;
  unit:   string;
  status: StatusSensor;
}

export default function SensorCard({ icon, label, value, unit, status }: Props): React.JSX.Element {
  const color = status === 'bahaya' ? COLORS.danger
              : status === 'waspada' ? COLORS.warning
              : COLORS.safe;
  const bg    = status === 'bahaya' ? COLORS.danger_dim
              : status === 'waspada' ? COLORS.warning_dim
              : COLORS.safe_dim;

  return (
    <View style={[styles.card, { borderColor: color + '40' }]}>
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <Text style={styles.iconTxt}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>
        {value != null ? value.toFixed(1) : '--'}
        <Text style={styles.unit}> {unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: COLORS.bg_card, borderRadius: 12,
    padding: 12, alignItems: 'center', borderWidth: 0.5, margin: 4,
  },
  iconBox: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  iconTxt: { fontSize: 18 },
  label:   { fontSize: 11, color: COLORS.text_muted, marginBottom: 3, textAlign: 'center' },
  value:   { fontSize: 19, fontWeight: '600' },
  unit:    { fontSize: 11, fontWeight: '400', color: COLORS.text_secondary },
});
