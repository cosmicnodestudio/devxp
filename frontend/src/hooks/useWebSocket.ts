import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

export function useWebSocket(url: string, onMessage?: (message: WebSocketMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isMounted) {
            console.log('WebSocket connected');
            setIsConnected(true);
          }
        };

        ws.onmessage = (event) => {
          if (isMounted) {
            try {
              const message: WebSocketMessage = JSON.parse(event.data);
              setLastMessage(message);
              onMessage?.(message);
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          if (isMounted) {
            console.log('WebSocket disconnected');
            setIsConnected(false);

            // Reconnect after 3 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMounted) {
                console.log('Attempting to reconnect...');
                connect();
              }
            }, 3000);
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url, onMessage]);

  const send = (data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  return { isConnected, lastMessage, send };
}
