import { reactive } from "vue";
import { apiGet, apiPost, apiPut } from "../services/api";

export interface StoreState {
  currentUser: any | null;
  city: string;
  reservationsCount: number;
  alertsCount: number;
  sidebarOpen: boolean;
  reserveModal: { open: boolean; pharmacy: any | null; medication: any | null };
  alertModal: { open: boolean; medication: any | null };
  profileOpen: boolean;
  chatMessages: Array<{
    id: string;
    sender: "user" | "assistant";
    text: string;
    structuredData?: any;
    timestamp: string;
  }>;
  conversationId: number | null;
  chatLoaded: boolean;
  routeAfterLogin: string | null;
}

export const store = reactive<StoreState>({
  currentUser: null,
  city: "تهران - ونک",
  reservationsCount: 0,
  alertsCount: 0,
  sidebarOpen: false,
  reserveModal: { open: false, pharmacy: null, medication: null },
  alertModal: { open: false, medication: null },
  profileOpen: false,
  chatMessages: [],
  conversationId: null,
  chatLoaded: false,
  routeAfterLogin: null,
});

export function openReserve(pharmacy: any, medication?: any | null) {
  store.reserveModal = { open: true, pharmacy, medication: medication || null };
}

export function closeReserve() {
  store.reserveModal = { open: false, pharmacy: null, medication: null };
}

export function openAlert(medication?: any | null) {
  store.alertModal = { open: true, medication: medication || null };
}

export function closeAlert() {
  store.alertModal = { open: false, medication: null };
}

export function openProfile() {
  store.profileOpen = true;
}

export function closeProfile() {
  store.profileOpen = false;
}

export async function refreshCounts() {
  try {
    const [resR, resA] = await Promise.all([apiGet("/api/reservations"), apiGet("/api/alerts")]);
    if (resR?.success) store.reservationsCount = resR.count ?? 0;
    if (resA?.success) store.alertsCount = resA.count ?? 0;
  } catch {
    /* ignore */
  }
}

export async function bootstrapApp() {
  try {
    await apiPost("/api/bootstrap", {});
    const storedId = typeof localStorage !== "undefined" ? localStorage.getItem("torob_uid") : null;
    const data = await apiGet(`/api/auth/me${storedId ? `?userId=${storedId}` : ""}`);
    if (data?.success && data.user) {
      store.currentUser = data.user;
    }
    await refreshCounts();
  } catch (err) {
    console.error(err);
  }
}

export async function switchRole(role: "patient" | "pharmacist" | "admin") {
  try {
    const data = await apiPost("/api/auth/switch", { role });
    if (data?.success && data.user) {
      store.currentUser = data.user;
      localStorage.setItem("torob_uid", String(data.user.id));
      return true;
    }
  } catch (err) {
    console.error(err);
  }
  return false;
}

export async function saveUserProfile(profile: any) {
  const data = await apiPut("/api/auth/me", profile);
  if (data?.success && data.user) {
    store.currentUser = data.user;
    return true;
  }
  return false;
}
