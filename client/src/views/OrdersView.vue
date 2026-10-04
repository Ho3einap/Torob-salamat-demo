<template>
  <!-- Reservations Mode -->
  <div v-if="isReservationsMode" class="space-y-6 max-w-5xl mx-auto">
    <div class="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-black text-slate-900">پیگیری سفارشات و رزروهای دارو</h2>
          <span class="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">{{ reservations.length }} رزرو ثبت شده</span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">داروهای رزرو شده به مدت ۳ ساعت در قفسه داروخانه مقصد محفوظ می‌مانند.</p>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto">
        <button
          v-for="tab in resTabs"
          :key="tab.id"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          :class="filterStatus === tab.id ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          @click="filterStatus = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div v-if="loadingRes" class="space-y-3">
      <div v-for="i in 3" :key="i" class="p-5 rounded-3xl bg-white border border-slate-200 animate-pulse h-32" />
    </div>

    <div v-else-if="filteredReservations.length === 0" class="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-3">
      <CalendarClock class="w-12 h-12 text-slate-300 mx-auto" />
      <h3 class="text-sm font-bold text-slate-700">رزرو فعالی در این بخش یافت نشد</h3>
      <p class="text-xs text-slate-500">از صفحه بانک داروها یا هوش مصنوعی، داروی موردنیاز خود را رزرو کنید.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="res in filteredReservations" :key="res.id" class="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-mono font-bold text-slate-400">#RES-{{ res.id }}</span>
            <span class="text-slate-500 font-medium">
              ثبت شده در: {{ new Date(res.createdAt).toLocaleDateString("fa-IR") }} -
              {{ new Date(res.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }) }}
            </span>
          </div>
          <span :class="statusBadge(res.status).cls">{{ statusBadge(res.status).label }}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div class="flex items-center gap-2">
              <Pill class="w-4 h-4 text-rose-600" />
              <span class="font-bold text-slate-900">{{ res.medication ? res.medication.brandName : "داروی درخواستی" }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600 flex-wrap gap-1">
              <span>تعداد درخواستی: {{ res.quantity }} عدد</span>
              <span class="font-bold text-emerald-700 font-mono">مبلغ کل: {{ res.totalPrice.toLocaleString("fa-IR") }} تومان</span>
            </div>
            <p v-if="res.patientNotes" class="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-200">
              💬 <strong>یادداشت خریدار:</strong> {{ res.patientNotes }}
            </p>
          </div>

          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div class="flex items-center gap-2">
              <Building2 class="w-4 h-4 text-teal-600" />
              <span class="font-bold text-slate-900">{{ res.pharmacy?.name }}</span>
            </div>
            <div class="flex items-start gap-1.5 text-slate-600">
              <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span class="text-[11px] leading-relaxed">{{ res.pharmacy?.address }}</span>
            </div>
            <div class="flex items-center justify-between pt-1 flex-wrap gap-1">
              <a :href="`tel:${res.pharmacy?.phone}`" class="text-rose-600 font-bold font-mono hover:underline flex items-center gap-1">
                <Phone class="w-3.5 h-3.5" />
                <span>{{ res.pharmacy?.phone }}</span>
              </a>
              <span class="text-[11px] text-slate-500 font-medium">تحویل: {{ res.deliveryType === "express_courier" ? "🛵 پیک فوری" : "🏪 مراجعه حضوری" }}</span>
            </div>
          </div>
        </div>

        <div v-if="res.pharmacistNotes" class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span class="font-bold block">پیام مسئول فنی داروخانه:</span>
            <span class="text-[11px]">{{ res.pharmacistNotes }}</span>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div class="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Clock class="w-3.5 h-3.5 text-amber-500" />
            <span>مدت نگهداری: تا ۳ ساعت در انبار رزرو</span>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <template v-if="(store.currentUser?.role === 'pharmacist' || store.currentUser?.role === 'admin') && res.status === 'pending_review'">
              <button class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs" @click="updateStatus(res.id, 'ready_for_pickup', 'دارو در محفظه کلدپک آماده تحویل گردید.')">
                تایید و آماده تحویل
              </button>
              <button class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs" @click="updateStatus(res.id, 'rejected', 'متاسفانه موجودی به اتمام رسیده است.')">
                عدم موجودی
              </button>
            </template>
            <button
              v-if="(store.currentUser?.role === 'pharmacist' || store.currentUser?.role === 'admin') && res.status === 'ready_for_pickup'"
              class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              @click="updateStatus(res.id, 'completed', 'تحویل به بیمار انجام شد.')"
            >
              ثبت تحویل نهایی
            </button>
            <a :href="`tel:${res.pharmacy?.phone}`" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1">
              <Phone class="w-3.5 h-3.5 text-slate-500" />
              <span>تماس با داروخانه</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Alerts Mode -->
  <div v-else class="space-y-6 max-w-5xl mx-auto">
    <div class="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-black text-slate-900">گوش‌به‌زنگ داروهای کمیاب و سهمیه‌ای</h2>
          <span class="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">{{ alerts.length }} هشدار فعال</span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">به محض شارژ دارو در انبار هر یک از داروخانه‌های شهر، سامانه فوراً به شماره همراه شما پیامک ارسال می‌کند.</p>
      </div>

      <button class="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs" @click="openAlert(null)">
        <Plus class="w-4 h-4" />
        <span>افزودن داروی جدید به گوش‌به‌زنگ</span>
      </button>
    </div>

    <!-- Simulated SMS -->
    <div v-if="simulatedSms" class="p-4 rounded-2xl bg-slate-900 text-white shadow-xl flex items-center justify-between gap-3 text-xs border border-slate-700">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-amber-500 text-slate-900 flex items-center justify-center font-bold shrink-0">SMS</div>
        <div>
          <span class="font-bold block text-amber-400">پیش‌نمایش پیامک ارسالی به گوشی شما:</span>
          <span>{{ simulatedSms }}</span>
        </div>
      </div>
      <button class="text-slate-400 hover:text-white text-xs underline shrink-0" @click="simulatedSms = null">بستن</button>
    </div>

    <div v-if="loadingAlerts" class="space-y-3">
      <div v-for="i in 2" :key="i" class="p-5 rounded-3xl bg-white border border-slate-200 animate-pulse h-28" />
    </div>

    <div v-else-if="alerts.length === 0" class="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-3">
      <BellRing class="w-12 h-12 text-slate-300 mx-auto" />
      <h3 class="text-sm font-bold text-slate-700">هنوز دارویی را به گوش‌به‌زنگ اضافه نکرده‌اید</h3>
      <p class="text-xs text-slate-500">با افزودن داروهای کمیاب مثل انسولین لانتوس، سل‌سپت یا ریتالین، از موجود شدن آن‌ها باخبر شوید.</p>
      <button class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors" @click="openAlert(null)">
        ایجاد اولین گوش‌به‌زنگ
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="alert in alerts" :key="alert.id" class="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3 text-xs flex flex-col justify-between">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Pill class="w-4 h-4" />
              </div>
              <div>
                <h4 class="font-bold text-slate-900">{{ alert.medication?.brandName || "داروی کمیاب" }}</h4>
                <span class="text-[11px] text-slate-400">{{ alert.medication?.persianName }}</span>
              </div>
            </div>
            <span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
              <CheckCircle2 class="w-3 h-3" />
              فعال و گوش‌به‌زنگ
            </span>
          </div>

          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-slate-600">
            <div class="flex items-center justify-between">
              <span>محدوده پایش: <strong>{{ alert.city }}</strong> (شعاع {{ alert.maxDistanceKm || 25 }} کیلومتر)</span>
            </div>
            <div class="flex items-center gap-1 font-mono text-slate-800">
              <Smartphone class="w-3.5 h-3.5 text-slate-400" />
              <span>پیامک به: {{ alert.userPhone }}</span>
            </div>
            <p v-if="alert.notes" class="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">یادداشت: {{ alert.notes }}</p>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <button class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-200 transition-colors flex items-center gap-1" @click="simulateSms(alert)">
            <Send class="w-3 h-3 text-amber-600" />
            <span>تست پیامک شارژ انبار</span>
          </button>
          <button class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors" title="حذف گوش‌به‌زنگ" @click="deleteAlert(alert.id)">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  Phone,
  MapPin,
  Building2,
  Pill,
  BellRing,
  Plus,
  Smartphone,
  Trash2,
  Send,
} from "@lucide/vue";
import { store, openAlert, refreshCounts } from "../stores/appStore";
import { apiGet, apiPut, apiDelete } from "../services/api";

const route = useRoute();
const isReservationsMode = computed(() => route.meta.mode !== "alerts");

const reservations = ref<any[]>([]);
const alerts = ref<any[]>([]);
const loadingRes = ref(true);
const loadingAlerts = ref(true);
const filterStatus = ref("all");
const simulatedSms = ref<string | null>(null);

const resTabs = [
  { id: "all", label: "همه" },
  { id: "pending_review", label: "در انتظار" },
  { id: "ready_for_pickup", label: "آماده تحویل" },
  { id: "completed", label: "تحویل شده" },
];

async function fetchReservations() {
  loadingRes.value = true;
  try {
    const data = await apiGet("/api/reservations");
    if (data.success) {
      reservations.value = data.reservations.map((r: any) => ({
        ...r.reservation,
        pharmacy: r.pharmacy,
        medication: r.medication,
        user: r.user,
      }));
    }
  } finally {
    loadingRes.value = false;
  }
}

async function fetchAlerts() {
  loadingAlerts.value = true;
  try {
    const data = await apiGet("/api/alerts");
    if (data.success) {
      alerts.value = data.alerts.map((a: any) => ({
        ...a.alert,
        medication: a.medication,
        user: a.user,
      }));
    }
  } finally {
    loadingAlerts.value = false;
  }
}

onMounted(() => {
  fetchReservations();
  fetchAlerts();
});

const filteredReservations = computed(() =>
  reservations.value.filter((r) => filterStatus.value === "all" || r.status === filterStatus.value),
);

function statusBadge(status: string) {
  switch (status) {
    case "pending_review":
      return { label: "در انتظار تایید داروساز", cls: "bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-xs" };
    case "confirmed":
      return { label: "تایید شده توسط مسئول فنی", cls: "bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full text-xs" };
    case "ready_for_pickup":
      return { label: "آماده تحویل در داروخانه", cls: "bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-xs" };
    case "out_for_delivery":
      return { label: "ارسال با پیک اکسپرس", cls: "bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-full text-xs" };
    case "completed":
      return { label: "تحویل داده شد", cls: "bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full text-xs" };
    case "rejected":
      return { label: "عدم موجودی / لغو شده", cls: "bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-full text-xs" };
    default:
      return { label: status, cls: "bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full text-xs" };
  }
}

async function updateStatus(id: number, status: string, pharmacistNotes?: string) {
  const data = await apiPut(`/api/reservations/${id}`, { status, pharmacistNotes });
  if (data.success) {
    fetchReservations();
    refreshCounts();
  }
}

async function deleteAlert(id: number) {
  const data = await apiDelete(`/api/alerts/${id}`);
  if (data.success) {
    fetchAlerts();
    refreshCounts();
  }
}

function simulateSms(alert: any) {
  const medName = alert.medication?.brandName || "داروی درخواستی";
  simulatedSms.value = `🔔 پیامک فوری ترب سلامت: داروی ${medName} هم‌اکنون در داروخانه شبانه‌روزی ونک موجود شد! موجودی: ۱۲ عدد - تماس: 02188776655`;
  setTimeout(() => {
    simulatedSms.value = null;
  }, 7000);
}
</script>
