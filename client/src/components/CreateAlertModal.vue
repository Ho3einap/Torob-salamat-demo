<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
    <div class="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <BellRing class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">فعال‌سازی گوش‌به‌زنگ داروی کمیاب</h3>
            <p class="text-[11px] text-slate-500">اطلاع‌رسانی پیامکی سریع به محض شارژ انبار داروخانه‌ها</p>
          </div>
        </div>
        <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100" @click="emit('close')">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6">
        <div v-if="success" class="text-center py-4 space-y-4">
          <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 class="w-8 h-8" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-900">گوش‌به‌زنگ با موفقیت فعال گردید</h4>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              به محض موجود شدن داروی <strong>{{ targetMedName }}</strong> در داروخانه‌های محدوده {{ city }}، بلافاصله به شماره
              {{ phone }} پیامک ارسال می‌شود.
            </p>
          </div>
          <button class="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors" @click="emit('close')">
            بستن پنجره
          </button>
        </div>

        <form v-else class="space-y-4" @submit.prevent="handleSubmit">
          <div v-if="errorMsg" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ errorMsg }}</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">داروی مورد نظر:</label>
            <div v-if="store.alertModal.medication" class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <Pill class="w-4 h-4 text-rose-600" />
                <span class="font-bold text-slate-800">{{ store.alertModal.medication.brandName }}</span>
              </div>
              <span class="text-slate-500 text-[11px]">{{ store.alertModal.medication.persianName }}</span>
            </div>
            <select v-else v-model="selectedMedId" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-500 outline-hidden">
              <option v-for="m in medications" :key="m.id" :value="m.id">{{ m.brandName }} - {{ m.persianName }} ({{ m.dosageStrength }})</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">شهر / استان:</label>
              <input v-model="city" type="text" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-500 outline-hidden" placeholder="تهران، کرج، مشهد..." />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">حداکثر شعاع فاصله:</label>
              <select v-model.number="maxDistance" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-500 outline-hidden">
                <option :value="10">تا ۱۰ کیلومتر</option>
                <option :value="25">تا ۲۵ کیلومتر</option>
                <option :value="50">تا ۵۰ کیلومتر (کل استان)</option>
                <option :value="100">سراسر کشور</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">شماره موبایل جهت دریافت پیامک فوری:</label>
            <div class="relative">
              <input
                v-model="phone"
                type="text"
                required
                class="w-full text-xs px-3 py-2 pl-9 rounded-xl border border-slate-200 focus:border-rose-500 font-mono outline-hidden"
                placeholder="0912xxxxxxx"
              />
              <Smartphone class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">یادداشت اختصاصی (اختیاری):</label>
            <input
              v-model="notes"
              type="text"
              class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-500 outline-hidden"
              placeholder="مثلا: برای بیمار پیوندی، در صورت امکان مارک فرانسوی یا سوئیسی باشد"
            />
          </div>

          <div class="flex gap-2 pt-2">
            <button type="button" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors" @click="emit('close')">
              انصراف
            </button>
            <button type="submit" :disabled="isSubmitting" class="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors disabled:opacity-50">
              {{ isSubmitting ? "در حال ثبت..." : "فعال‌سازی گوش‌به‌زنگ" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { X, BellRing, Pill, Smartphone, CheckCircle2, AlertCircle } from "@lucide/vue";
import { store, refreshCounts } from "../stores/appStore";
import { apiGet, apiPost } from "../services/api";

const emit = defineEmits<{ (e: "close"): void }>();

const medications = ref<any[]>([]);
const selectedMedId = ref<number | string>("");
const city = ref(store.currentUser?.city || "تهران");
const maxDistance = ref(25);
const phone = ref(store.currentUser?.phone || "09121112233");
const notes = ref("");
const isSubmitting = ref(false);
const success = ref(false);
const errorMsg = ref("");

const targetMedName = computed(() => {
  if (store.alertModal.medication) return store.alertModal.medication.brandName;
  const m = medications.value.find((x) => x.id === Number(selectedMedId.value));
  return m?.brandName || "داروی درخواستی";
});

onMounted(async () => {
  if (!store.alertModal.medication) {
    const data = await apiGet("/api/medications");
    if (data.success) {
      medications.value = data.medications;
      if (data.medications.length > 0) selectedMedId.value = data.medications[0].id;
    }
  }
});

async function handleSubmit() {
  const medId = store.alertModal.medication?.id || Number(selectedMedId.value);
  if (!medId) {
    errorMsg.value = "لطفاً یک داروی کمیاب انتخاب نمایید";
    return;
  }

  isSubmitting.value = true;
  errorMsg.value = "";

  try {
    const data = await apiPost("/api/alerts", {
      userId: store.currentUser?.id,
      medicationId: medId,
      city: city.value,
      maxDistanceKm: maxDistance.value,
      userPhone: phone.value,
      notes: notes.value,
    });

    if (data.success) {
      success.value = true;
      refreshCounts();
    } else {
      errorMsg.value = data.error || "خطا در ثبت هشدار";
    }
  } catch {
    errorMsg.value = "خطای سرور";
  } finally {
    isSubmitting.value = false;
  }
}
</script>
