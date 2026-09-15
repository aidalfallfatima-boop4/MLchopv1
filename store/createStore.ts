import { useSyncExternalStore } from "react";

export function createStore<T>(initialState: T) {
  let state = initialState;
  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState = (next: T | ((previous: T) => T)) => {
    state =
      typeof next === "function"
        ? (next as (previous: T) => T)(state)
        : next;

    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const useStore = () =>
    useSyncExternalStore(subscribe, getState, getState);

  return { getState, setState, subscribe, useStore };
}
