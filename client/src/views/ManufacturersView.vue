<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-black text-slate-900">رده‌بندی شرکت‌های داروسازی (بر اساس کیفیت و خلوص)</h2>
          <span class="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">{{ manufacturers.length }} شرکت ارزیابی‌شده</span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">رتبه‌بندی استاندارد ترب سلامت با توجه به خطوط cGMP، پایش عوارض و میزان رضایت پزشکان و بیماران</p>
      </div>

      <button
        v-if="store.currentUser?.role === 'admin' || store.currentUser?.role === 'pharmacist'"
        class="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        @click="showAddModal = true"
      >
        <Plus class="w-4 h-4" />
        <span>ثبت شرکت دارویی جدید</span>
      </button>
    </div>

    <!-- Leaderboard -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="p-5 rounded-3xl bg-white border border-slate-200 animate-pulse h-28" />
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(man, idx) in manufacturers"
        :key="man.id"
        class="p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
        :class="
          idx === 0
            ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-200 shadow-sm'
            : idx === 1
              ? 'bg-slate-50/70 border-slate-300 shadow-2xs'
              : idx === 2
                ? 'bg-orange-50/30 border-orange-200'
                : 'bg-white border-slate-200'
        "
      >
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs"
            :class="
              idx === 0
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950'
                : idx === 1
                  ? 'bg-slate-200 text-slate-800'
                  : idx === 2
                    ? 'bg-orange-200 text-orange-900'
                    : 'bg-slate-100 text-slate-600'
            "
          >
            #{{ idx + 1 }}
          </div>

          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-sm font-bold text-slate-900">{{ man.persianName }}</h3>
              <span class="text-slate-400 font-mono text-[11px]">({{ man.name }})</span>
              <span v-if="man.isIranian" class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">تولید ایران</span>
              <span v-else class="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                <Globe class="w-2.5 h-2.5" />
                {{ man.country }}
              </span>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed max-w-2xl">{{ man.reputationNotes || "دارنده گواهینامه استانداردهای داروسازی بین‌المللی" }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0 self-end md:self-center">
          <div class="text-left">
            <span class="text-[10px] text-slate-400 block font-medium">گرید کیفی ترب:</span>
            <span class="text-xs font-black text-slate-900 font-mono">سطح {{ man.qualityTier }}</span>
          </div>
          <div class="p-3 rounded-2xl bg-white border border-slate-200/90 text-center shadow-2xs min-w-[80px]">
            <span class="text-[10px] text-slate-400 block font-semibold">امتیاز خلوص:</span>
            <span class="text-base font-black text-emerald-700 font-mono">{{ man.qualityScore }}/۱۰۰</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold text-slate-900">افزودن شرکت داروسازی جدید</h3>
          <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100" @click="showAddModal = false">
            <X class="w-5 h-5" />
          </button>
        </div>
        <form class="space-y-3 text-xs" @submit.prevent="handleCreate">
          <div>
            <label class="block text-slate-700 font-semibold mb-1">نام لاتین شرکت:</label>
            <input v-model="newMan.name" type="text" required placeholder="e.g. Pfizer Inc" class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
          </div>
          <div>
            <label class="block text-slate-700 font-semibold mb-1">نام فارسی:</label>
            <input v-model="newMan.persianName" type="text" required placeholder="مثلا داروسازی فایزر" class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-slate-700 font-semibold mb-1">کشور مبدا:</label>
              <input v-model="newMan.country" type="text" required class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
            </div>
            <div>
              <label class="block text-slate-700 font-semibold mb-1">امتیاز کیفی (۱ تا ۱۰۰):</label>
              <input v-model.number="newMan.qualityScore" type="number" min="1" max="100" required class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
            </div>
          </div>
          <div>
            <label class="block text-slate-700 font-semibold mb-1">توضیحات و اعتبار سازنده:</label>
            <textarea v-model="newMan.reputationNotes" rows="2" class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
          </div>
          <div class="flex gap-2 pt-2">
            <button type="button" class="flex-1 py-2 rounded-xl border border-slate-200 font-bold" @click="showAddModal = false">انصراف</button>
            <button type="submit" class="flex-2 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800">ثبت شرکت</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Plus, Globe, X } from "@lucide/vue";
import { store } from "../stores/appStore";
import { apiGet, apiPost } from "../services/api";

const manufacturers = ref<any[]>([]);
const loading = ref(true);
const showAddModal = ref(false);

const newMan = reactive({
  name: "",
  persianName: "",
  country: "ایران",
  qualityScore: 90,
  reputationNotes: "",
  isIranian: true,
});

async function fetchManufacturers() {
  loading.value = true;
  try {
    const data = await apiGet("/api/manufacturers");
    if (data.success) manufacturers.value = data.manufacturers;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchManufacturers);

async function handleCreate() {
  const data = await apiPost("/api/manufacturers", { ...newMan });
  if (data.success) {
    showAddModal.value = false;
    newMan.name = "";
    newMan.persianName = "";
    fetchManufacturers();
  }
}
</script>
