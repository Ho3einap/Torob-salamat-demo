import { createRouter, createWebHistory } from "vue-router";
import AiChatView from "./views/AiChatView.vue";
import MedicationsView from "./views/MedicationsView.vue";
import PharmaciesView from "./views/PharmaciesView.vue";
import PrescriptionsView from "./views/PrescriptionsView.vue";
import OrdersView from "./views/OrdersView.vue";
import ManufacturersView from "./views/ManufacturersView.vue";
import InventoryPanelView from "./views/InventoryPanelView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/chat" },
    { path: "/chat", name: "chat", component: AiChatView, meta: { title: "هوش مصنوعی ترب سلامت" } },
    { path: "/medications", name: "medications", component: MedicationsView, meta: { title: "بانک داروها" } },
    { path: "/pharmacies", name: "pharmacies", component: PharmaciesView, meta: { title: "شبکه داروخانه‌ها" } },
    { path: "/prescriptions", name: "prescriptions", component: PrescriptionsView, meta: { title: "اسکن نسخه الکترونیک" } },
    { path: "/reservations", name: "reservations", component: OrdersView, meta: { title: "پیگیری رزرو دارو", mode: "reservations" } },
    { path: "/alerts", name: "alerts", component: OrdersView, meta: { title: "گوش‌به‌زنگ داروهای کمیاب", mode: "alerts" } },
    { path: "/manufacturers", name: "manufacturers", component: ManufacturersView, meta: { title: "رده‌بندی شرکت‌های سازنده" } },
    { path: "/pharmacist", name: "pharmacist", component: InventoryPanelView, meta: { title: "پنل متصدی داروخانه" } },
    { path: "/:pathMatch(.*)*", redirect: "/chat" },
  ],
});
