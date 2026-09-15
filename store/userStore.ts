import { Role } from "../types";
import { createStore } from "./createStore";

export type UserState = {
  role: Role;
  name: string;
  phone: string;
  address: string;
};

const store = createStore<UserState>({
  role: null,
  name: "Client ML CHOP",
  phone: "+223 70 00 00 00",
  address: "Hamdallaye ACI 2000, Bamako",
});

export const useUserStore = store.useStore;

export function setRole(role: Role) {
  store.setState((current) => ({ ...current, role }));
}

export function updateUserProfile(patch: Partial<Omit<UserState, "role">>) {
  store.setState((current) => ({ ...current, ...patch }));
}

export function logout() {
  store.setState((current) => ({ ...current, role: null }));
}
