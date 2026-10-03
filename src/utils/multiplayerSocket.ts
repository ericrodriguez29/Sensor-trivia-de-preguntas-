import { OnlineRoomState } from '../types';

type MessageHandler = (data: { type: string; room?: OnlineRoomState; [key: string]: unknown }) => void;

class MultiplayerClient {
  private ws: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private reconnectTimer: number | null = null;
  public isConnected: boolean = false;

  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        resolve(true);
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const url = `${protocol}//${host}`;

      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.isConnected = true;
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handlers.forEach(h => h(data));
          } catch (e) {
            console.error('Error parsing WS payload', e);
          }
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.ws = null;
        };

        this.ws.onerror = () => {
          this.isConnected = false;
          resolve(false);
        };
      } catch (err) {
        console.error('WebSocket connection error:', err);
        resolve(false);
      }
    });
  }

  send(type: string, payload: Record<string, unknown> = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...payload }));
    } else {
      this.connect().then((ok) => {
        if (ok && this.ws) {
          this.ws.send(JSON.stringify({ type, ...payload }));
        }
      });
    }
  }

  subscribe(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const mpSocket = new MultiplayerClient();
