<template>
  <div class="flex flex-col h-full bg-white border-l border-slate-200 shadow-xs">
    <!-- Mobile header -->
    <div class="lg:hidden flex items-center justify-between p-4 border-b border-slate-100">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-black text-sm">ترب</div>
        <span class="font-bold text-sm text-slate-800">منوی ترب سلامت</span>
      </div>
      <button class="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100" @click="store.sidebarOpen = false">
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Nav list -->
    <div class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      <div class="px-3 pb-2 text-[11px] font-bold text-slate-400">خدمات تخصصی سلامت و دارو</div>

      <router-link
        v-for="item in visibleItems"
        :key="item.id"
        :to="item.to"
        class="group flex items-start gap-3 p-2.5 rounded-2xl text-right transition-all duration-150 relative"
        :class="isActive(item.to) ? 'bg-rose-50 text-rose-700 shadow-xs border border-rose-100/80 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 border border-transparent font-medium'"
        @click="store.sidebarOpen = false"
      >
        <div
          class="p-2 rounded-xl shrink-0 transition-colors"
          :class="isActive(item.to) ? 'bg-rose-600 text-white shadow-xs shadow-rose-500/20' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'"
        >
          <component :is="item.icon" class="w-4 h-4" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1">
            <span class="text-xs truncate block">{{ item.label }}</span>
            <span v-if="item.badge" class="text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0" :class="item.badgeColor">
              {{ item.badge }}
            </span>
            <span
              v-else-if="item.countKey && countOf(item.countKey) > 0"
              class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-600 text-white shrink-0"
            >
              {{ countOf(item.countKey) }}
            </span>
          </div>
          <p class="text-[10px] text-slate-400 truncate mt-0.5">{{ item.sublabel }}</p>
        </div>

        <ChevronLeft v-if="isActive(item.to)" class="w-4 h-4 text-rose-500 absolute left-2 top-1/2 -translate-y-1/2 hidden sm:block" />
      </router-link>
    </div>

    <!-- Footer -->
    <div class="p-3 border-t border-slate-100 bg-slate-50/70 space-y-2">
      <div class="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-sm">
        <div class="flex items-center gap-2 mb-1">
          <Sparkles class="w-4 h-4 text-amber-300" />
          <span class="text-xs font-bold">پاسخگوی هوشمند محاوره‌ای</span>
        </div>
        <p class="text-[11px] text-rose-100 leading-relaxed">
          داروی کمیاب خود را به زبان عامیانه بنویسید؛ هوش مصنوعی ترب فوری نزدیک‌ترین داروخانه را معرفی می‌کند.
        </p>
      </div>

      <div class="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
        <div class="flex items-center gap-2 text-slate-600">
          <PhoneForwarded class="w-4 h-4 text-emerald-600" />
          <span class="text-[11px] font-semibold">سامانه دارویی کشور</span>
        </div>
        <a href="tel:190" class="font-black text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded-lg text-xs">۱۹۰</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  MessageSquareHeart,
  Pill,
  Building2,
  FileSpreadsheet,
  CalendarClock,
  BellRing,
  Award,
  Store,
  Sparkles,
  X,
  PhoneForwarded,
  ChevronLeft,
} from "@lucide/vue";
import { store } from "../stores/appStore";

const route = useRoute();

const navItems = [
  {
    id: "ai-chat",
    label: "هوش مصنوعی ترب سلامت",
    sublabel: "گفتگوی محاوره‌ای و رده‌بندی فوری",
    icon: MessageSquareHeart,
    badge: "پیشرفته",
    badgeColor: "bg-rose-100 text-rose-700",
    roles: ["patient", "pharmacist", "admin"],
    to: "/chat",
  },
  {
    id: "medications",
    label: "بانک داروها و رده‌بندی کیفی",
    sublabel: "مقایسه برندها، خلوص و قیمت",
    icon: Pill,
    roles: ["patient", "pharmacist", "admin"],
    to: "/medications",
  },
  {
    id: "pharmacies",
    label: "شبکه داروخانه‌ها و رادار فاصله",
    sublabel: "موجودی زنده، شبانه‌روزی و تماس",
    icon: Building2,
    roles: ["patient", "pharmacist", "admin"],
    to: "/pharmacies",
  },
  {
    id: "prescriptions",
    label: "اسکن و ثبت نسخه الکترونیک",
    sublabel: "تحلیل هوشمند سبد دارویی با کد ملی",
    icon: FileSpreadsheet,
    badge: "جدید",
    badgeColor: "bg-emerald-100 text-emerald-700",
    roles: ["patient", "pharmacist", "admin"],
    to: "/prescriptions",
  },
  {
    id: "reservations",
    label: "پیگیری سفارش و رزرو دارو",
    sublabel: "رزرو ۳۰ دقیقه‌ای و پیک اکسپرس",
    icon: CalendarClock,
    countKey: "reservations",
    roles: ["patient", "pharmacist", "admin"],
    to: "/reservations",
  },
  {
    id: "alerts",
    label: "گوش‌به‌زنگ داروهای کمیاب",
    sublabel: "ردیاب شارژ مجدد داروخانه‌ها",
    icon: BellRing,
    countKey: "alerts",
    roles: ["patient", "pharmacist", "admin"],
    to: "/alerts",
  },
  {
    id: "manufacturers",
    label: "رده‌بندی شرکت‌های سازنده",
    sublabel: "رتبه‌بندی کیفی شرکت‌های دارویی",
    icon: Award,
    roles: ["patient", "pharmacist", "admin"],
    to: "/manufacturers",
  },
  {
    id: "pharmacist-panel",
    label: "پنل متصدی داروخانه",
    sublabel: "مدیریت انبار زنده و تایید رزروها",
    icon: Store,
    badge: "مسئول فنی",
    badgeColor: "bg-teal-100 text-teal-800",
    roles: ["pharmacist", "admin"],
    to: "/pharmacist",
  },
];

const visibleItems = computed(() => navItems.filter((i) => i.roles.includes(store.currentUser?.role || "patient")));

function isActive(to: string) {
  return route.path === to;
}

function countOf(key: string) {
  return key === "reservations" ? store.reservationsCount : store.alertsCount;
}
</script>
