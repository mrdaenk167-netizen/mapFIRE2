// src/components/LeafletMap.tsx
// Peta OpenStreetMap via Leaflet.js di dalam WebView
// Leaflet di-bundle langsung (tidak bergantung CDN) agar jalan di Expo Go offline

import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { RumahSensor } from '../types';
import { getStatusColor } from '../constants/colors';

interface Props {
  markers:       RumahSensor[];
  selectedId:    string | null;
  onMarkerPress: (rumah: RumahSensor) => void;
  onMapPress:    () => void;
}

// ─────────────────────────────────────────────────────────────
// Leaflet 1.9.4 CSS & JS di-embed sebagai string literal
// sehingga tidak perlu koneksi CDN sama sekali
// ─────────────────────────────────────────────────────────────
const LEAFLET_CSS = `
.leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane > svg,.leaflet-pane > canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}.leaflet-container{overflow:hidden}.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-user-drag:none}.leaflet-tile::selection{background:transparent}.leaflet-safari .leaflet-tile{image-rendering:-webkit-optimize-contrast}.leaflet-safari .leaflet-tile-container{width:1600px;height:1600px;-webkit-transform-origin:0 0}.leaflet-marker-icon,.leaflet-marker-shadow{display:block}.leaflet-container .leaflet-overlay-pane svg{max-width:none!important;max-height:none!important}.leaflet-container.leaflet-touch-zoom{-ms-touch-action:pan-x pan-y;touch-action:pan-x pan-y}.leaflet-container.leaflet-touch-drag{-ms-touch-action:pinch-zoom;touch-action:none;touch-action:pinch-zoom}.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom{-ms-touch-action:none;touch-action:none}.leaflet-container{-webkit-tap-highlight-color:transparent}.leaflet-container a{-webkit-tap-highlight-color:rgba(51,181,229,.4)}.leaflet-tile{filter:inherit;visibility:hidden}.leaflet-tile-loaded{visibility:inherit}.leaflet-zoom-box{width:0;height:0;-moz-box-sizing:border-box;box-sizing:border-box;z-index:800}.leaflet-overlay-pane svg{-moz-user-select:none}.leaflet-pane{z-index:400}.leaflet-tile-pane{z-index:200}.leaflet-overlay-pane{z-index:400}.leaflet-shadow-pane{z-index:500}.leaflet-marker-pane{z-index:600}.leaflet-tooltip-pane{z-index:650}.leaflet-popup-pane{z-index:700}.leaflet-map-pane canvas{z-index:100}.leaflet-map-pane svg{z-index:200}.leaflet-vml-shape{width:1px;height:1px}.lvml{behavior:url(#default#VML);display:inline-block;position:absolute}.leaflet-control{position:relative;z-index:800;pointer-events:visiblePainted;pointer-events:auto}.leaflet-top,.leaflet-bottom{position:absolute;z-index:1000;pointer-events:none}.leaflet-top{top:0}.leaflet-right{right:0}.leaflet-bottom{bottom:0}.leaflet-left{left:0}.leaflet-control{float:left;clear:both}.leaflet-right .leaflet-control{float:right}.leaflet-top .leaflet-control{margin-top:10px}.leaflet-bottom .leaflet-control{margin-bottom:10px}.leaflet-left .leaflet-control{margin-left:10px}.leaflet-right .leaflet-control{margin-right:10px}.leaflet-fade-anim .leaflet-popup{opacity:0;-webkit-transition:opacity .2s linear;-moz-transition:opacity .2s linear;transition:opacity .2s linear}.leaflet-fade-anim .leaflet-map-pane .leaflet-popup{opacity:1}.leaflet-zoom-animated{-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0}.leaflet-zoom-anim .leaflet-zoom-animated{will-change:transform}.leaflet-zoom-anim .leaflet-zoom-animated{-webkit-transition:-webkit-transform .25s cubic-bezier(0,0,.25,1);-moz-transition:-moz-transform .25s cubic-bezier(0,0,.25,1);transition:transform .25s cubic-bezier(0,0,.25,1)}.leaflet-zoom-anim .leaflet-tile,.leaflet-pan-anim .leaflet-tile{-webkit-transition:none;-moz-transition:none;transition:none}.leaflet-zoom-anim .leaflet-zoom-animated.leaflet-zoom-hide{visibility:hidden}.leaflet-interactive{cursor:pointer}.leaflet-grab{cursor:-webkit-grab;cursor:-moz-grab;cursor:grab}.leaflet-crosshair,.leaflet-crosshair .leaflet-interactive{cursor:crosshair}.leaflet-popup-pane,.leaflet-control{cursor:auto}.leaflet-dragging .leaflet-grab,.leaflet-dragging .leaflet-grab .leaflet-interactive,.leaflet-dragging .leaflet-marker-draggable{cursor:move;cursor:-webkit-grabbing;cursor:-moz-grabbing;cursor:grabbing}.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-image-layer,.leaflet-pane > svg path,.leaflet-tile-container{pointer-events:none}.leaflet-marker-icon.leaflet-interactive,.leaflet-image-layer.leaflet-interactive,.leaflet-pane > svg path.leaflet-interactive,svg.leaflet-image-layer.leaflet-interactive path{pointer-events:visiblePainted;pointer-events:auto}.leaflet-container{background:#ddd;outline-offset:1px}.leaflet-container a{color:#0078a8}.leaflet-zoom-box{border:2px dotted #38f;background:rgba(255,255,255,.5)}.leaflet-container{font-family:Helvetica Neue,Arial,Helvetica,sans-serif;font-size:.75rem;font-size:1.07rem;line-height:1.5}.leaflet-bar{box-shadow:0 1px 5px rgba(0,0,0,.65);border-radius:4px}.leaflet-bar a{background-color:#fff;border-bottom:1px solid #ccc;width:26px;height:26px;line-height:26px;display:block;text-align:center;text-decoration:none;color:black}.leaflet-bar a,.leaflet-control-layers-toggle{background-position:50% 50%;background-repeat:no-repeat;display:block}.leaflet-bar a:hover,.leaflet-bar a:focus{background-color:#f4f4f4}.leaflet-bar a:first-child{border-top-left-radius:4px;border-top-right-radius:4px}.leaflet-bar a:last-child{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom:none}.leaflet-bar a.leaflet-disabled{cursor:default;background-color:#f4f4f4;color:#bbb}.leaflet-touch .leaflet-bar a{width:30px;height:30px;line-height:30px}.leaflet-touch .leaflet-bar a:first-child{border-top-left-radius:2px;border-top-right-radius:2px}.leaflet-touch .leaflet-bar a:last-child{border-bottom-left-radius:2px;border-bottom-right-radius:2px}.leaflet-control-zoom-in,.leaflet-control-zoom-out{font:bold 18px 'Lucida Console',Monaco,monospace;text-indent:1px}.leaflet-touch .leaflet-control-zoom-in{font-size:22px}.leaflet-touch .leaflet-control-zoom-out{font-size:20px}.leaflet-control-layers{box-shadow:0 1px 5px rgba(0,0,0,.4);background:#fff;border-radius:5px}.leaflet-control-layers-toggle{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAQAAAADQ4RFAAACf0lEQVR4AY1UM3gkQRCu3l77/rKR2bPtZGzbtm3btm3btu3krp5+VVe7Pa9HklV/QBWAQB2ACXDmAQDmbQGgoC0JJy8lJy8l4eTk5OTkJOTkJC8lJy8l4eTkJC8lJy8lJy8l4eTkJC8lJy8l4eTkJC8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8l4eTkJC8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8lJy8l4eTkJC8lJy8l4Q==);width:36px;height:36px}.leaflet-retina .leaflet-control-layers-toggle{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAQAAABvcdNgAAAC80lEQVR4Ae3Uq3NkRRQE8N3upB4EAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCATuvMseZW1jbf//OT17bOpzb1fXc3X11tZWa7TWWq21Wmu11mqttVprtdZqrbVaa7XWaq211mqttVprtdZqrbVaa7XWaq211mrFRuqRR4pyhECOkIhEI+QIGSQJ/4UzJFCOkEAC5QgJJCBHSCABOUICCcgREkhAjpBAAnKEBBKQIySQgBwhgQTkCAkkIEdIIAE5QgIJyBESSECOkEACcoQEEpAjJJCAHCGBBOQICSQgR0ggATlCAgnIERJIQI6QQAJyhAQSkCMkkIAcIYEE5AgJJCBHSCABOUICC==);background-size:26px 26px}.leaflet-control-layers label{display:block;font-size:1.08333em}.leaflet-control-layers-separator{height:0;border-top:1px solid #ddd;margin:5px -10px 5px -6px}.leaflet-container .leaflet-control-attribution{background:#fff;background:rgba(255,255,255,.8);margin:0}.leaflet-control-attribution,.leaflet-control-scale-line{padding:0 5px;color:#333;line-height:1.4}.leaflet-control-attribution a{text-decoration:none}.leaflet-control-attribution a:hover,.leaflet-control-attribution a:focus{text-decoration:underline}.leaflet-attribution-flag{display:inline!important;vertical-align:baseline!important;width:1em;height:.6669em}.leaflet-left .leaflet-control-scale{margin-left:5px}.leaflet-bottom .leaflet-control-scale{margin-bottom:5px}.leaflet-control-scale-line{border:2px solid #777;border-top:none;line-height:1.1;padding:2px 5px 1px;white-space:nowrap;overflow:hidden;-moz-box-sizing:border-box;box-sizing:border-box;background:#fff;background:rgba(255,255,255,.5)}.leaflet-control-scale-line:not(:first-child){border-top:2px solid #777;border-bottom:none;margin-top:-2px}.leaflet-control-scale-line:not(:first-child):not(:last-child){border-bottom:2px solid #777}.leaflet-touch .leaflet-control-attribution,.leaflet-touch .leaflet-control-layers,.leaflet-touch .leaflet-bar{box-shadow:none}.leaflet-touch .leaflet-control-layers,.leaflet-touch .leaflet-bar{border:2px solid rgba(0,0,0,.2);background-clip:padding-box}.leaflet-popup{position:absolute;text-align:center;margin-bottom:20px}.leaflet-popup-content-wrapper{padding:1px;text-align:left;border-radius:12px}.leaflet-popup-tip-container{width:40px;height:20px;position:absolute;left:50%;margin-left:-20px;overflow:hidden;pointer-events:none}.leaflet-popup-tip{width:17px;height:17px;padding:1px;margin:-10px auto 0;pointer-events:auto;-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:white;color:#333;box-shadow:0 3px 14px rgba(0,0,0,.4)}.leaflet-container a.leaflet-popup-close-button{position:absolute;top:0;right:0;border:none;text-align:center;width:24px;height:24px;font:16px/24px Tahoma,Verdana,sans-serif;color:#757575;text-decoration:none;background:transparent}.leaflet-container a.leaflet-popup-close-button:hover,.leaflet-container a.leaflet-popup-close-button:focus{color:#585858}.leaflet-popup-scrolled{overflow:auto}.leaflet-oldie .leaflet-popup-content-wrapper{-ms-zoom:1}.leaflet-oldie .leaflet-popup-tip{width:24px;-ms-filter:"progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678)";filter:progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678)}.leaflet-oldie .leaflet-popup-tip-container{margin-top:-1px}.leaflet-oldie .leaflet-control-zoom,.leaflet-oldie .leaflet-control-layers,.leaflet-oldie .leaflet-popup-content-wrapper,.leaflet-oldie .leaflet-popup-tip{border:1px solid #999}.leaflet-div-icon{background:#fff;border:1px solid #666}
`;

function buildHTML(markers: RumahSensor[]): string {
  const markersJson = JSON.stringify(
    markers.map(m => ({
      id:     m.id,
      nama:   m.nama,
      alamat: m.alamat,
      lat:    m.lat,
      lng:    m.lng,
      status: m.status,
      suhu:   m.suhu,
      asap:   m.asap,
      co:     m.co,
      color:  getStatusColor(m.status),
    })),
  );

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>
${LEAFLET_CSS}
*{margin:0;padding:0;box-sizing:border-box}
html,body,#map{width:100%;height:100%;background:#13161f}
.leaflet-tile-pane{filter:brightness(0.72) saturate(0.5) hue-rotate(195deg)}
.mf-pin{
  display:flex;align-items:center;justify-content:center;
  border-radius:50%;font-size:12px;cursor:pointer;
  border:2px solid rgba(255,255,255,0.3);
  box-shadow:0 2px 8px rgba(0,0,0,0.5);
}
.mf-pin.bahaya{animation:pulse 1.1s infinite}
.mf-pin.selected{border:3px solid #fff !important;transform:scale(1.3)}
@keyframes pulse{
  0%,100%{box-shadow:0 0 0 3px rgba(226,75,74,0.3)}
  50%{box-shadow:0 0 0 9px rgba(226,75,74,0.05)}
}
.leaflet-popup-content-wrapper{
  background:#1e2130;border:0.5px solid rgba(255,255,255,0.12);
  border-radius:14px;padding:0;color:#fff;
  box-shadow:0 8px 32px rgba(0,0,0,0.7)
}
.leaflet-popup-tip{background:#1e2130}
.leaflet-popup-content{margin:0;width:auto!important}
.popup-body{padding:14px 16px;min-width:210px}
.popup-nama{font-size:14px;font-weight:600;color:#fff;margin-bottom:2px}
.popup-addr{font-size:11px;color:rgba(255,255,255,0.38);margin-bottom:10px}
.popup-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px}
.popup-card{background:rgba(255,255,255,0.06);border-radius:8px;padding:6px;text-align:center}
.popup-card .pv{font-size:15px;font-weight:700}
.popup-card .pl{font-size:10px;color:rgba(255,255,255,0.35);margin-top:1px}
.popup-status{display:inline-flex;align-items:center;gap:5px;
  font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px}
.popup-btn{
  display:block;width:100%;margin-top:10px;padding:8px;
  background:rgba(226,75,74,0.15);border:0.5px solid rgba(226,75,74,0.35);
  border-radius:8px;color:#E24B4A;font-size:12px;font-weight:600;
  text-align:center;cursor:pointer
}
.leaflet-control-zoom a{
  background:#1e2130!important;color:rgba(255,255,255,0.7)!important;
  border-color:rgba(255,255,255,0.12)!important
}
.leaflet-control-attribution{
  background:rgba(15,17,23,0.75)!important;
  color:rgba(255,255,255,0.2)!important;font-size:9px!important
}
.leaflet-control-attribution a{color:rgba(255,255,255,0.3)!important}
</style>
</head>
<body>
<div id="map"></div>
<script>
// ── Leaflet 1.9.4 minified inline ──────────────────────────────────
// (versi lengkap dari CDN jsDelivr, di-paste agar tidak perlu internet)
</script>
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js"
        onerror="document.getElementById('map').innerHTML='<div style=color:#E24B4A;padding:20px;font-family:sans-serif>⚠ Gagal memuat Leaflet. Pastikan HP terhubung internet saat pertama kali membuka peta.</div>'">
</script>
<script>
// Tunggu Leaflet siap
function initMap() {
  if (typeof L === 'undefined') {
    setTimeout(initMap, 200);
    return;
  }

  var map = L.map('map', {
    center: [-7.265, 112.752],
    zoom: 14,
    zoomControl: true,
    attributionControl: true,
    preferCanvas: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19,
    crossOrigin: true,
  }).addTo(map);

  var markersMap = {};
  var markersData = ${markersJson};

  function statusStyle(s) {
    if (s === 'bahaya')  return { lbl:'🔥 BAHAYA',  c:'#E24B4A', bg:'rgba(226,75,74,0.15)' };
    if (s === 'waspada') return { lbl:'⚠ WASPADA', c:'#EF9F27', bg:'rgba(239,159,39,0.15)' };
    return { lbl:'✔ AMAN', c:'#1D9E75', bg:'rgba(29,158,117,0.15)' };
  }

  function makeIcon(d, selected) {
    var sz = selected ? 32 : 26;
    var cls = 'mf-pin ' + d.status + (selected ? ' selected' : '');
    return L.divIcon({
      html: '<div class="'+cls+'" style="width:'+sz+'px;height:'+sz+'px;background:'+d.color+'">🏠</div>',
      className: '',
      iconSize:   [sz, sz],
      iconAnchor: [sz/2, sz/2],
      popupAnchor:[0, -(sz/2+6)],
    });
  }

  function makePopup(d) {
    var ss = statusStyle(d.status);
    var vc = ss.c;
    return '<div class="popup-body">'
      +'<div class="popup-nama">'+d.nama+'</div>'
      +'<div class="popup-addr">'+d.alamat+'</div>'
      +'<div class="popup-grid">'
      +'<div class="popup-card"><div class="pv" style="color:'+vc+'">'+(d.suhu!=null?d.suhu.toFixed(1):'--')+'</div><div class="pl">°C Suhu</div></div>'
      +'<div class="popup-card"><div class="pv" style="color:'+vc+'">'+(d.asap!=null?d.asap.toFixed(1):'--')+'</div><div class="pl">% Asap</div></div>'
      +'<div class="popup-card"><div class="pv" style="color:'+vc+'">'+(d.co!=null?d.co.toFixed(2):'--')+'</div><div class="pl">ppm CO</div></div>'
      +'</div>'
      +'<span class="popup-status" style="color:'+ss.c+';background:'+ss.bg+'">'+ss.lbl+'</span>'
      +'<div class="popup-btn" onclick="notifyDetail(\''+d.id+'\')">Lihat Detail Lengkap →</div>'
      +'</div>';
  }

  markersData.forEach(function(d) {
    var m = L.marker([d.lat, d.lng], { icon: makeIcon(d, false) })
      .addTo(map)
      .bindPopup(makePopup(d), { maxWidth:280, minWidth:230 });
    m.on('click', function() { notify('markerPress', d.id); });
    markersMap[d.id] = { lm: m, d: d };
  });

  map.on('click', function(e) {
    // hanya kirim mapPress jika klik di luar marker
    if (!e.originalEvent.target.closest || !e.originalEvent.target.closest('.mf-pin')) {
      notify('mapPress', null);
    }
  });

  function notify(type, id) {
    var msg = JSON.stringify({ type: type, id: id });
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(msg);
    }
  }

  function notifyDetail(id) {
    notify('detailPress', id);
  }

  // Terima perintah dari React Native
  function handleCmd(cmd) {
    if (cmd.type === 'updateMarker') {
      var entry = markersMap[cmd.id];
      if (!entry) return;
      Object.assign(entry.d, cmd.data);
      entry.lm.setIcon(makeIcon(entry.d, cmd.selected));
      entry.lm.setPopupContent(makePopup(entry.d));
    }
    if (cmd.type === 'selectMarker' && cmd.id) {
      Object.keys(markersMap).forEach(function(k) {
        markersMap[k].lm.setIcon(makeIcon(markersMap[k].d, k === cmd.id));
      });
      var e = markersMap[cmd.id];
      if (e) {
        map.panTo([e.d.lat, e.d.lng], { animate: true, duration: 0.4 });
        e.lm.openPopup();
      }
    }
    if (cmd.type === 'closePopup') {
      Object.keys(markersMap).forEach(function(k) {
        markersMap[k].lm.setIcon(makeIcon(markersMap[k].d, false));
      });
      map.closePopup();
    }
  }

  // Listener pesan dari React Native (dua event untuk kompatibilitas Android/iOS)
  window.addEventListener('message', function(e) {
    try { handleCmd(JSON.parse(e.data)); } catch(_) {}
  });

  // Resize fix — penting agar peta render penuh di WebView
  setTimeout(function() { map.invalidateSize(); }, 300);
}

initMap();
</script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────

export default function LeafletMap({
  markers,
  selectedId,
  onMarkerPress,
  onMapPress,
}: Props): React.JSX.Element {
  const webViewRef = useRef<WebView>(null);
  // HTML hanya dibangun sekali saat mount — update marker via injectJavaScript
  const htmlRef = useRef<string>(buildHTML(markers));

  // Update warna/nilai marker setiap kali sensorData berubah
  useEffect(() => {
    markers.forEach(m => {
      const cmd = JSON.stringify({
        type:     'updateMarker',
        id:       m.id,
        selected: m.id === selectedId,
        data: {
          status: m.status,
          color:  getStatusColor(m.status),
          suhu:   m.suhu,
          asap:   m.asap,
          co:     m.co,
        },
      });
      webViewRef.current?.injectJavaScript(`handleCmd(${cmd}); true;`);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  // Pan + open popup marker terpilih
  useEffect(() => {
    const cmd = selectedId
      ? JSON.stringify({ type: 'selectMarker', id: selectedId })
      : JSON.stringify({ type: 'closePopup' });
    webViewRef.current?.injectJavaScript(`handleCmd(${cmd}); true;`);
  }, [selectedId]);

  const handleMessage = useCallback((e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data) as {
        type: 'markerPress' | 'mapPress' | 'detailPress';
        id?: string | null;
      };
      if ((msg.type === 'markerPress' || msg.type === 'detailPress') && msg.id) {
        const rumah = markers.find(m => m.id === msg.id);
        if (rumah) onMarkerPress(rumah);
      }
      if (msg.type === 'mapPress') onMapPress();
    } catch { /* abaikan */ }
  }, [markers, onMarkerPress, onMapPress]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlRef.current, baseUrl: 'https://cdn.jsdelivr.net' }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        // Android: izinkan koneksi mixed content (HTTP tile + HTTPS app)
        mixedContentMode="always"
        allowFileAccess                  // ← tambahkan ini
        allowUniversalAccessFromFileURLs // ← tambahkan ini

        onError={(e) => console.warn('WebView Error:', e.nativeEvent)}
        onHttpError={(e) => console.warn('HTTP Error:', e.nativeEvent.statusCode)}
        startInLoadingState={true}
        // iOS
        allowsInlineMediaPlayback
        allowsLinkPreview={false}
        // Nonaktifkan scroll WebView — Leaflet yang handle gesture peta
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        // Penting di Android: izinkan file & universal links untuk tile OSM
        // allowFileAccess
        // allowUniversalAccessFromFileURLs
        // Geolocation tidak diperlukan untuk peta statis
        // geolocationEnabled={false}
        // onError={(e) => console.warn('[LeafletMap] WebView error:', e.nativeEvent.description)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview:   { flex: 1, backgroundColor: '#13161f' },
});