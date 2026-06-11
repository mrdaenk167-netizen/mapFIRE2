// src/screens/DashboardScreen.tsx — SDK 54
// Peta utama menggunakan LeafletMap (OpenStreetMap, tanpa Google Maps API)

import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useMQTT } from '../hooks/useMQTT';
import LeafletMap from '../components/LeafletMap';
import SensorCard from '../components/SensorCard';
import StatusBadge from '../components/StatusBadge';
import type { RootStackParamList, RumahSensor, StatusSensor } from '../types';

type Nav   = StackNavigationProp<RootStackParamList, 'MainTabs'>;
type Route = RouteProp<RootStackParamList, 'MainTabs'>;

type FilterOption = 'semua' | StatusSensor;

const FILTERS: FilterOption[] = ['semua', 'aman', 'waspada', 'bahaya'];

export default function DashboardScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route: Route;
}): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { brokerStatus, sensorList, summary, notifikasi } = useMQTT();

  const [selectedRumah, setSelectedRumah]   = useState<RumahSensor | null>(null);
  const [filterStatus, setFilterStatus]     = useState<FilterOption>('semua');
  const slideAnim = useRef(new Animated.Value(320)).current;

  const openPanel = useCallback((rumah: RumahSensor) => {
    setSelectedRumah(rumah);
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true, tension: 65, friction: 11,
    }).start();
  }, [slideAnim]);

  const closePanel = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 320, duration: 220, useNativeDriver: true,
    }).start(() => setSelectedRumah(null));
  }, [slideAnim]);

  const filteredList: RumahSensor[] = filterStatus === 'semua'
    ? sensorList
    : sensorList.filter(r => r.status === filterStatus);

  const brokerColor =
    brokerStatus === 'connected'    ? COLORS.safe    :
    brokerStatus === 'reconnecting' ? COLORS.warning :
    COLORS.danger;

  const topPad = Math.max(insets.top, 12);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── Top bar ── */}
      <View style={[styles.topbar, { paddingTop: topPad }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}><Text style={{ fontSize: 13 }}>🔥</Text></View>
          <Text style={styles.appName}>map<Text style={{ color: COLORS.brand }}>FIRE</Text></Text>
        </View>

        <View style={styles.statsRow}>
          {([
            [COLORS.safe,    `${summary.aman} Aman`],
            [COLORS.warning, `${summary.waspada} Waspada`],
            [COLORS.danger,  `${summary.bahaya} Bahaya`],
          ] as [string, string][]).map(([color, label]) => (
            <View key={label} style={styles.statItem}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={styles.statTxt}>{label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.navigate('Notifikasi', { notifikasi })}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 20 }}>🔔</Text>
          {notifikasi.length > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeTxt}>{Math.min(notifikasi.length, 99)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Filter chips ── */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filterStatus === f && styles.chipActive]}
            onPress={() => setFilterStatus(f)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipTxt, filterStatus === f && styles.chipTxtActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}{' '}
              ({f === 'semua' ? summary.total : (summary[f as StatusSensor] ?? 0)})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Peta OpenStreetMap Leaflet ── */}
      <View style={styles.mapContainer}>
        <LeafletMap
          markers={filteredList}
          selectedId={selectedRumah?.id ?? null}
          onMarkerPress={openPanel}
          onMapPress={closePanel}
        />

        {/* Badge broker */}
        <View style={styles.liveBadge}>
          <View style={[styles.liveDot, { backgroundColor: brokerColor }]} />
          <Text style={styles.liveTxt}>
            {brokerStatus === 'connected'    ? 'Live · HiveMQ Connected' :
             brokerStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline'}
          </Text>
        </View>

        {/* Legend */}
        <View style={[styles.legend, { bottom: insets.bottom + 16 }]}>
          <Text style={styles.legendTitle}>STATUS SENSOR</Text>
          {([
            ['safe',    'Aman'],
            ['warning', 'Waspada'],
            ['danger',  'Bahaya'],
          ] as [keyof typeof COLORS, string][]).map(([k, lbl]) => (
            <View key={k} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS[k] as string }]} />
              <Text style={styles.legendTxt}>{lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Slide-up panel ── */}
      {selectedRumah != null && (
        <Animated.View style={[
          styles.detailPanel,
          { paddingBottom: insets.bottom + 14 },
          { transform: [{ translateY: slideAnim }] },
        ]}>
          <View style={styles.panelHandle} />

          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <Text style={{ fontSize: 22 }}>🏠</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.panelName}>{selectedRumah.nama}</Text>
              <Text style={styles.panelAddr}>{selectedRumah.alamat}</Text>
            </View>
            <StatusBadge status={selectedRumah.status} size="sm" />
            <TouchableOpacity style={styles.closeBtn} onPress={closePanel}>
              <Text style={{ color: COLORS.text_muted, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sensorGrid}>
            <SensorCard icon="🌡️" label="Suhu"   value={selectedRumah.suhu} unit="°C"  status={selectedRumah.status} />
            <SensorCard icon="💨" label="Asap"   value={selectedRumah.asap} unit="%"   status={selectedRumah.status} />
            <SensorCard icon="☁️" label="CO Gas" value={selectedRumah.co}   unit="ppm" status={selectedRumah.status} />
          </View>

          <TouchableOpacity
            style={styles.detailBtn}
            activeOpacity={0.8}
            onPress={() => {
              closePanel();
              navigation.navigate('Detail', { rumah: selectedRumah });
            }}
          >
            <Text style={styles.detailBtnTxt}>Lihat Detail Lengkap  →</Text>
          </TouchableOpacity>

          {selectedRumah.lastUpdate != null && (
            <Text style={styles.updateTxt}>
              Update: {selectedRumah.lastUpdate.toLocaleTimeString('id-ID')}
            </Text>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.bg_primary },
  topbar:      { backgroundColor: COLORS.bg_secondary, paddingHorizontal: 14, paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border_brand, flexDirection: 'row', alignItems: 'center' },
  logoRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle:  { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.brand, alignItems: 'center', justifyContent: 'center' },
  appName:     { fontSize: 16, fontWeight: '700', color: '#fff' },
  statsRow:    { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 10 },
  statItem:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot:         { width: 7, height: 7, borderRadius: 4 },
  statTxt:     { fontSize: 10, color: COLORS.text_secondary },
  notifBtn:    { position: 'relative', padding: 4 },
  notifBadge:    { position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.brand, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  notifBadgeTxt: { fontSize: 9, color: '#fff', fontWeight: '700' },

  filterRow:     { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.bg_secondary, gap: 7 },
  chip:          { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: COLORS.bg_primary, borderWidth: 0.5, borderColor: COLORS.border },
  chipActive:    { backgroundColor: COLORS.brand_dim, borderColor: COLORS.brand + '60' },
  chipTxt:       { fontSize: 11, color: COLORS.text_muted },
  chipTxtActive: { color: COLORS.brand, fontWeight: '600' },

  mapContainer: { flex: 1, position: 'relative' },

  liveBadge:  { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(22,25,33,0.88)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: COLORS.border },
  liveDot:    { width: 7, height: 7, borderRadius: 4 },
  liveTxt:    { fontSize: 11, color: COLORS.text_secondary },

  legend:      { position: 'absolute', right: 10, backgroundColor: 'rgba(22,25,33,0.9)', borderRadius: 10, padding: 10, borderWidth: 0.5, borderColor: COLORS.border },
  legendTitle: { fontSize: 9, color: COLORS.text_hint, marginBottom: 6, letterSpacing: 0.8 },
  legendRow:   { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 3 },
  legendDot:   { width: 8, height: 8, borderRadius: 4 },
  legendTxt:   { fontSize: 11, color: COLORS.text_secondary },

  detailPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.bg_secondary, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, borderTopWidth: 0.5, borderTopColor: COLORS.border },
  panelHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 14 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  panelIcon:   { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.brand_dim, alignItems: 'center', justifyContent: 'center' },
  panelName:   { fontSize: 15, fontWeight: '600', color: '#fff' },
  panelAddr:   { fontSize: 12, color: COLORS.text_muted },
  closeBtn:    { padding: 6 },
  sensorGrid:  { flexDirection: 'row', marginBottom: 12 },
  detailBtn:     { backgroundColor: COLORS.brand_dim, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.brand + '50' },
  detailBtnTxt:  { color: COLORS.brand, fontWeight: '600', fontSize: 14 },
  updateTxt:     { textAlign: 'center', fontSize: 11, color: COLORS.text_hint, marginTop: 8 },
});
