/**
 * Configuración compartida de Jest.
 *
 * `jest-expo` ya mockea la mayor parte del SDK. Aquí solo se agregan los
 * módulos nativos que usan los tests y que no deben tocar el dispositivo.
 */

import type { ReactNode } from "react";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
  Link: ({ children }: { children: ReactNode }) => children,
}));
