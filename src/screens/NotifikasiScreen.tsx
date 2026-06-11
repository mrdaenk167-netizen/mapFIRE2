// src/screens/NotifikasiScreen.tsx — SDK 54

import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, type ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import StatusBadge from '../components/StatusBadge';
import type { RootStackParamList, NotifikasiItem } from '../types';

type Nav   = StackNavigationProp<RootStackParamList, 'Notifikasi'>;
type Route = RouteProp<RootStackParamList, 'Notifikasi'>;

function formatWaktu(date: Date): string {
  return new Date(date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
}

function NotifCard({
  item,
  onPress,
}: {
  item: NotifikasiItem;
  onPress: () => void;
}): React.JSX.Element {
  const borderColor = item.status === 'bahaya' ? COLORS.danger : COLORS.warning;
  return (
    <TouchableOpacity style={[styles.item, { borderLeftColor: borderColor }]} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName} numberOfLines={1}>{item.nama}</Text>
        <StatusBadge status={item.status} size="sm" />
      </View>
      <Text style={styles.itemAddr}>{item.alamat}</Text>
      <View style={styles.itemSensors}>
        <Text style={styles.sensorTxt}>🌡️ {item.suhu.toFixed(1)}°C</Text>
        <Text style={styles.sensorTxt}>💨 {item.asap.toFixed(1)}%</Text>
        <Text style={styles.sensorTxt}>☁️ {item.co.toFixed(2)} ppm</Text>
      </View>
      <Text style={styles.itemTime}>🕐 {formatWaktu(item.waktu)}</Text>
    </TouchableOpacity>
  );
}

export default function NotifikasiScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route:      Route;
}): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const notifikasi = route.params?.notifikasi ?? [];

  const renderItem: ListRenderItem<NotifikasiItem> = ({ item }) => (
    <NotifCard
      item={item}
      onPress={() =>
        navigation.navigate('Detail', {
          rumah: {
            id:         item.rumahId,
            nama:       item.nama,
            alamat:     item.alamat,
            lat:        0,
            lng:        0,
            suhu:       item.suhu,
            asap:       item.asap,
            co:         item.co,
            status:     item.status,
            lastUpdate: item.waktu,
            online:     false,
          },
        })
      }
    />
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 24, color: COLORS.text_secondary }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat Notifikasi</Text>
        {notifikasi.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countTxt}>{notifikasi.length}</Text>
          </View>
        )}
      </View>

      {notifikasi.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 52 }}>✅</Text>
          <Text style={styles.emptyTitle}>Tidak ada notifikasi</Text>
          <Text style={styles.emptySub}>Semua titik pantau dalam kondisi aman</Text>
        </View>
      ) : (
        <FlatList
          data={notifikasi}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.bg_primary },
  header:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg_secondary, paddingHorizontal: 14, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 10 },
  backBtn:     { padding: 4 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#fff' },
  countBadge:  { backgroundColor: COLORS.brand, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  countTxt:    { color: '#fff', fontSize: 12, fontWeight: '700' },
  item:        { backgroundColor: COLORS.bg_secondary, borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: COLORS.border, borderLeftWidth: 3 },
  itemHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemName:    { fontSize: 14, fontWeight: '600', color: '#fff', flex: 1, marginRight: 8 },
  itemAddr:    { fontSize: 12, color: COLORS.text_muted, marginBottom: 8 },
  itemSensors: { flexDirection: 'row', gap: 14, marginBottom: 6 },
  sensorTxt:   { fontSize: 12, color: COLORS.text_secondary },
  itemTime:    { fontSize: 11, color: COLORS.text_hint },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle:  { fontSize: 18, fontWeight: '600', color: COLORS.text_secondary },
  emptySub:    { fontSize: 13, color: COLORS.text_muted },
});
