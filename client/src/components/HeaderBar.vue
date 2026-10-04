<template>
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
    <div class="flex items-center justify-between px-4 lg:px-6 py-2.5">
      <!-- Brand -->
      <div class="flex items-center gap-3">
        <button
          class="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          title="منوی ناوبری"
          @click="store.sidebarOpen = !store.sidebarOpen"
        >
          <Menu class="w-5 h-5" />
        </button>

        <router-link to="/chat" class="flex items-center gap-2.5 cursor-pointer group select-none">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform"
          >
            <span class="font-black text-xl tracking-tighter">ترب</span>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-black text-lg text-slate-900 tracking-tight">ترب سلامت</span>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Sparkles class="w-2.5 h-2.5 text-emerald-600" />
                هوشمند
              </span>
            </div>
            <p class="text-[11px] text-slate-500 hidden sm:block">سامانه هوشمند یافتن داروهای کمیاب و نسخه‌ها</p>
          </div>
        </router-link>
      </div>

      <!-- Location selector -->
      <div class="relative">
        <button
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          @click="toggleCity"
        >
          <MapPin class="w-4 h-4 text-rose-500 shrink-0" />
          <span class="truncate max-w-[130px] sm:max-w-[200px]">{{ store.city }}</span>
          <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
        </button>

        <div
          v-if="cityOpen"
          class="absolute left-0 sm:right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50"
        >
          <div class="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400">
            انتخاب موقعیت شما جهت محاسبه فاصله
          </div>
          <div class="max-h-60 overflow-y-auto">
            <button
              v-for="loc in cities"
              :key="loc.name"
              class="w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors"
              :class="store.city === loc.name ? 'bg-rose-50 text-rose-600 font-bold' : 'text-slate-700'"
              @click="selectCity(loc.name)"
            >
              <span>{{ loc.name }}</span>
              <span v-if="store.city === loc.name" class="w-2 h-2 rounded-full bg-rose-500" />
            </button>
          </div>
        </div>
      </div>

      <!-- Right controls -->
      <div class="flex items-center gap-2 sm:gap-3">
        <a
          href="tel:190"
          class="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors"
          title="سامانه کشوری اطلاعات دارویی (۱۹۰)"
        >
          <PhoneCall class="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>اطلاعات دارویی ۱۹۰</span>
        </a>

        <router-link
          to="/alerts"
          class="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          title="گوش به زنگ‌های دارویی من"
        >
          <Bell class="w-5 h-5" />
          <span
            v-if="store.alertsCount > 0"
            class="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center"
          >
            {{ store.alertsCount }}
          </span>
        </router-link>

        <!-- User role switcher -->
        <div class="relative">
          <button
            class="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-xs font-semibold text-slate-800"
            @click="toggleRole"
          >
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs"
              :class="
                store.currentUser?.role === 'pharmacist'
                  ? 'bg-teal-600'
                  : store.currentUser?.role === 'admin'
                    ? 'bg-indigo-600'
                    : 'bg-rose-600'
              "
            >
              <Stethoscope v-if="store.currentUser?.role === 'pharmacist'" class="w-4 h-4" />
              <ShieldCheck v-else-if="store.currentUser?.role === 'admin'" class="w-4 h-4" />
              <UserCircle2 v-else class="w-4 h-4" />
            </div>
            <div class="hidden sm:block text-right">
              <div class="leading-tight truncate max-w-[110px]">{{ store.currentUser?.name || "کاربر مهمان" }}</div>
              <div class="text-[10px] text-slate-400 font-normal">
                {{
                  store.currentUser?.role === "pharmacist"
                    ? "داروساز / مسئول فنی"
                    : store.currentUser?.role === "admin"
                      ? "مدیر ترب سلامت"
                      : "بیمار / کاربر عادی"
                }}
              </div>
            </div>
            <ChevronDown class="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          <div
            v-if="roleOpen"
            class="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50"
          >
            <div class="px-3 pb-2 mb-1 border-b border-slate-100">
              <p class="text-xs font-bold text-slate-800">{{ store.currentUser?.name }}</p>
              <p class="text-[11px] text-slate-400">
                {{ store.currentUser?.phone }} • {{ store.currentUser?.insuranceType || "تامین اجتماعی" }}
              </p>
            </div>

            <div class="px-3 py-1 text-[10px] font-bold text-slate-400">تغییر سریع نقش (دمو سریع):</div>

            <button
              class="w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors"
              :class="store.currentUser?.role === 'patient' ? 'bg-rose-50 text-rose-600 font-bold' : 'text-slate-700'"
              @click="doSwitch('patient')"
            >
              <UserCircle2 class="w-4 h-4 text-rose-500 shrink-0" />
              <div>
                <div>علی رضایی (بیمار)</div>
                <div class="text-[10px] text-slate-400 font-normal">جستجوی دارو، رزرو، ثبت نسخه</div>
              </div>
            </button>

            <button
              class="w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors"
              :class="store.currentUser?.role === 'pharmacist' ? 'bg-teal-50 text-teal-600 font-bold' : 'text-slate-700'"
              @click="doSwitch('pharmacist')"
            >
              <Stethoscope class="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <div>دکتر اکبری (مسئول فنی داروخانه ونک)</div>
                <div class="text-[10px] text-slate-400 font-normal">مدیریت موجودی زنده و تایید رزروها</div>
              </div>
            </button>

            <button
              class="w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors"
              :class="store.currentUser?.role === 'admin' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-700'"
              @click="doSwitch('admin')"
            >
              <ShieldCheck class="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <div>مدیریت سامانه ترب سلامت</div>
                <div class="text-[10px] text-slate-400 font-normal">نظارت بر شرکت‌ها و داروخانه‌ها</div>
              </div>
            </button>

            <div class="border-t border-slate-100 my-1 pt-1">
              <button
                class="w-full text-right px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                @click="openProfile(); roleOpen = false"
              >
                <span>ویرایش پرونده پزشکی و آدرس</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { MapPin, UserCircle2, ShieldCheck, Stethoscope, ChevronDown, Bell, Sparkles, PhoneCall, Menu } from "@lucide/vue";
import { store, switchRole, openProfile } from "../stores/appStore";

const router = useRouter();
const roleOpen = ref(false);
const cityOpen = ref(false);

const cities = [
  { name: "تهران - ونک" },
  { name: "تهران - تجریش" },
  { name: "تهران - سعادت‌آباد" },
  { name: "تهران - طالقانی (هلال‌احمر)" },
  { name: "تهران - پاسداران" },
  { name: "البرز - کرج" },
  { name: "خراسان رضوی - مشهد" },
  { name: "اصفهان - مرکز" },
  { name: "فارس - شیراز" },
  { name: "آذربایجان شرقی - تبریز" },
];

function toggleCity() {
  cityOpen.value = !cityOpen.value;
  roleOpen.value = false;
}

function toggleRole() {
  roleOpen.value = !roleOpen.value;
  cityOpen.value = false;
}

function selectCity(name: string) {
  store.city = name;
  cityOpen.value = false;
}

async function doSwitch(role: "patient" | "pharmacist" | "admin") {
  const ok = await switchRole(role);
  roleOpen.value = false;
  if (ok && role === "pharmacist") {
    router.push("/pharmacist");
  }
}
</script>
