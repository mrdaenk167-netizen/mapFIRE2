// src/services/mqttService.ts — SDK 54, mqtt@5.x
// Singleton service untuk koneksi HiveMQ Cloud via WebSocket Secure

import mqtt, { MqttClient } from 'mqtt';
import { MQTT_CONFIG, TOPICS } from '../constants/mqttConfig';
import type { BrokerStatus, MQTTPayload } from '../types';

type MessageCallback = (topic: string, data: MQTTPayload) => void;
type StatusCallback  = (status: BrokerStatus) => void;

class MQTTService {
  private client:          MqttClient | null = null;
  private listeners:       Record<string, MessageCallback[]> = {};
  private statusCallback:  StatusCallback | null = null;
  public  connected:       boolean = false;

  connect(onStatus: StatusCallback): void {
    this.statusCallback = onStatus;

    const url = `wss://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}/mqtt`;

    // mqtt@5 — connect options
    this.client = mqtt.connect(url, {
      username:        MQTT_CONFIG.username,
      password:        MQTT_CONFIG.password,
      clientId:        MQTT_CONFIG.clientId,
      reconnectPeriod: MQTT_CONFIG.reconnectPeriod,
      connectTimeout:  MQTT_CONFIG.connectTimeout,
      keepalive:       MQTT_CONFIG.keepalive,
      clean:           MQTT_CONFIG.clean,
      protocolVersion: 4,  // MQTT 3.1.1
    });

    this.client.on('connect', () => {
      this.connected = true;
      this.statusCallback?.('connected');
      console.log('[MQTT] Terhubung ke HiveMQ');

      this.client!.subscribe(TOPICS.allSensors, { qos: 1 }, (err) => {
        if (err) console.error('[MQTT] Subscribe error:', err.message);
      });
    });

    this.client.on('message', (topic: string, payload: Buffer) => {
      try {
        const data = JSON.parse(payload.toString()) as MQTTPayload;
        this._notify(topic, data);
      } catch {
        // payload tidak valid, abaikan
      }
    });

    this.client.on('reconnect', () => {
      this.connected = false;
      this.statusCallback?.('reconnecting');
    });

    this.client.on('disconnect', () => {
      this.connected = false;
      this.statusCallback?.('disconnected');
    });

    this.client.on('offline', () => {
      this.connected = false;
      this.statusCallback?.('disconnected');
    });

    this.client.on('error', (err: Error) => {
      console.error('[MQTT] Error:', err.message);
      this.statusCallback?.('error');
    });
  }

  subscribe(topic: string, callback: MessageCallback): () => void {
    if (!this.listeners[topic]) this.listeners[topic] = [];
    this.listeners[topic].push(callback);
    return () => {
      this.listeners[topic] = this.listeners[topic].filter(cb => cb !== callback);
    };
  }

  private _notify(topic: string, data: MQTTPayload): void {
    Object.keys(this.listeners).forEach(pattern => {
      if (this._matchTopic(pattern, topic)) {
        this.listeners[pattern].forEach(cb => cb(topic, data));
      }
    });
  }

  private _matchTopic(pattern: string, topic: string): boolean {
    const pp = pattern.split('/');
    const tp = topic.split('/');
    if (pp.length !== tp.length) return false;
    return pp.every((p, i) => p === '+' || p === tp[i]);
  }

  publish(topic: string, payload: object): void {
    if (this.client && this.connected) {
      this.client.publish(topic, JSON.stringify(payload), { qos: 1 });
    }
  }

  disconnect(): void {
    this.client?.end(true);
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// Singleton
const mqttService = new MQTTService();
export default mqttService;
