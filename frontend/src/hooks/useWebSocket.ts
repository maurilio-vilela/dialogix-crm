import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface WebSocketState {
  socket: Socket | null;
  isConnected: boolean;
  error: Error | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true, onConnect, onDisconnect, onError } = options;
  const { token } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);
  const [state, setState] = useState<WebSocketState>({
    socket: null,
    isConnected: false,
    error: null,
  });

  // manter callbacks atualizados sem reabrir conexão
  useEffect(() => {
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  }, [onConnect, onDisconnect, onError]);

  useEffect(() => {
    if (!token || !autoConnect) return;

    // Configurar conexão
    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const socket = io(`${BACKEND_URL}/chat`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Event Listeners
    socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', socket.id);
      setState((prev) => ({ ...prev, isConnected: true, error: null, socket }));
      onConnectRef.current?.();
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket desconectado:', reason);
      setState((prev) => ({ ...prev, isConnected: false, socket }));
      onDisconnectRef.current?.();
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error.message);
      setState((prev) => ({ ...prev, error, socket }));
      onErrorRef.current?.(error);
    });

    socket.on('error', (error) => {
      console.error('❌ Erro WebSocket:', error);
      setState((prev) => ({ ...prev, error, socket }));
      onErrorRef.current?.(error);
    });

    // Cleanup
    return () => {
      console.log('🧹 Limpando conexão WebSocket');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, autoConnect]);

  // Método utilitário para enviar eventos
  const emit = (event: string, data?: any) => {
    if (socketRef.current && state.isConnected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ Socket não conectado. Não foi possível enviar:', event);
    }
  };

  // Método utilitário para escutar eventos
  const on = (event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  };

  // Método utilitário para remover listeners
  const off = (event: string, handler?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  };

  return {
    socket: state.socket,
    isConnected: state.isConnected,
    error: state.error,
    emit,
    on,
    off,
  };
}
