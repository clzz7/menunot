import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp: string;
}

interface UseWebSocketOptions {
  url?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = `ws://${window.location.host}/api/ws`,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    onMessage,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('[WebSocket] Conectado ao servidor');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectCount.current = 0;
        onConnect?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('[WebSocket] Erro ao processar mensagem:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log(`[WebSocket] Conexão fechada - Código: ${event.code}, Razão: ${event.reason}`);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        onDisconnect?.();

        // Tentar reconectar se não foi fechamento intencional
        if (event.code !== 1000 && reconnectCount.current < reconnectAttempts) {
          reconnectCount.current++;
          console.log(`[WebSocket] Tentativa de reconexão ${reconnectCount.current}/${reconnectAttempts}`);
          
          reconnectTimer.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        console.error('[WebSocket] Erro na conexão:', error);
        setConnectionStatus('error');
        onError?.(error);
      };

    } catch (error) {
      console.error('[WebSocket] Erro ao criar conexão:', error);
      setConnectionStatus('error');
    }
  }, [url, reconnectAttempts, reconnectInterval, onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    if (ws.current) {
      ws.current.close(1000, 'Desconexão intencional');
      ws.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('[WebSocket] Erro ao enviar mensagem:', error);
        return false;
      }
    } else {
      console.warn('[WebSocket] Tentativa de enviar mensagem sem conexão ativa');
      return false;
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    reconnectCount: reconnectCount.current
  };
}