import { useNetworkState } from "expo-network";

export type OnlineState = {
  /** hay conexión de red según el dispositivo */
  isOnline: boolean;
  /** la red conectada tiene salida a internet */
  isInternetReachable: boolean;
};

/**
 * Estado de red reactivo (expo-network).
 *
 * Mientras `isConnected` es `undefined` (el listener todavía no reporta nada) se
 * considera online, para no mostrar el aviso de "sin conexión" al abrir la app.
 */
export function useIsOnline(): OnlineState {
  const { isConnected, isInternetReachable } = useNetworkState();

  return {
    isOnline: isConnected !== false,
    isInternetReachable: isInternetReachable !== false,
  };
}