<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
          <FileSpreadsheet class="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-lg font-black text-slate-900">اسکن و استعلام هوشمند نسخه الکترونیک</h2>
            <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">اتصال به سامانه سلامت و تامین اجتماعی</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            با وارد کردن کد رهگیری نسخه یا کد ملی، هوش مصنوعی سبد داروهای شما را خوانده و داروخانه‌های دارای تمام اقلام را پیدا می‌کند.
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Form -->
      <div class="lg:col-span-5 space-y-4">
        <div class="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Search class="w-4 h-4 text-emerald-600" />
            <span>مشخصات استعلام نسخه:</span>
          </h3>

          <form class="space-y-3 text-xs" @submit.prevent="handleScan">
            <div>
              <label class="block text-slate-700 font-semibold mb-1">کد رهگیری نسخه الکترونیک (۵ تا ۷ رقمی):</label>
              <input
                v-model="form.trackingCode"
                type="text"
                required
                placeholder="e.g. RX-98234-TH یا کد عددی"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-slate-700 font-semibold mb-1">کد ملی بیمار:</label>
                <input v-model="form.nationalId" type="text" required class="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono outline-hidden" />
              </div>
              <div>
                <label class="block text-slate-700 font-semibold mb-1">شماره همراه:</label>
                <input v-model="form.userPhone" type="text" required class="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono outline-hidden" />
              </div>
            </div>

            <div>
              <label class="block text-slate-700 font-semibold mb-1">داروهای نوشته‌شده یا علائم (اختیاری جهت تطبیق هوش مصنوعی):</label>
              <textarea
                v-model="form.rawText"
                rows="2"
                placeholder="مثلاً: انسولین لانتوس و متفورمین ۵۰۰، یا سل‌سپت پیوند..."
                class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden"
              />
            </div>

            <div class="space-y-1.5 pt-1">
              <span class="text-[11px] text-slate-400 font-medium block">نسخه‌های نمونه تستی:</span>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold truncate"
                  @click="loadSample('diabetes')"
                >
                  نسخه دیابت (لانتوس)
                </button>
                <button
                  type="button"
                  class="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold truncate"
                  @click="loadSample('transplant')"
                >
                  نسخه پیوند (سل‌سپت)
                </button>
              </div>
            </div>

            <button
              type="submit"
              :disabled="isScanning"
              class="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <template v-if="isScanning">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>در حال اسکن و بررسی انبار داروخانه‌ها...</span>
              </template>
              <template v-else>
                <Sparkles class="w-4 h-4" />
                <span>استعلام و یافتن بهترین داروخانه مقصد</span>
              </template>
            </button>
          </form>
        </div>
      </div>

      <!-- Results -->
      <div class="lg:col-span-7 space-y-4">
        <div v-if="scanResult" class="space-y-4">
          <div class="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <div class="flex items-center justify-between font-bold text-emerald-950 pb-2 border-b border-emerald-200/60 flex-wrap gap-1">
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                <span>نسخه الکترونیک معتبر با موفقیت بازخوانی شد</span>
              </div>
              <span class="font-mono text-emerald-800">{{ scanResult.patientInfo.trackingCode }}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-slate-700 text-[11px]">
              <div>
                پزشک صادرکننده: <strong>{{ scanResult.doctorInfo.doctorName }}</strong>
              </div>
              <div>
                پوشش بیمه: <strong>{{ scanResult.patientInfo.insurance }}</strong>
              </div>
            </div>
          </div>

          <div class="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h4 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Pill class="w-4 h-4 text-rose-600" />
              <span>اقلام تجویز‌شده در نسخه (تحلیل هوش مصنوعی):</span>
            </h4>
            <div class="space-y-2">
              <div v-for="(item, idx) in scanResult.extractedItems" :key="idx" class="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-2">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0">{{ idx + 1 }}</span>
                  <div>
                    <span class="font-bold text-slate-900">{{ item.drugName }}</span>
                    <span class="text-[11px] text-slate-500 block">دوز: {{ item.dosage }} • تعداد: {{ item.count }} عدد</span>
                  </div>
                </div>
                <div class="text-left shrink-0">
                  <span class="font-bold text-emerald-700 font-mono">{{ (item.price * item.count).toLocaleString("fa-IR") }} تومان</span>
                  <span v-if="item.isRare" class="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-md block mt-0.5">سهمیه‌ای کمیاب</span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h4 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 class="w-4 h-4 text-teal-600" />
              <span>پیشنهاد هوشمند داروخانه‌های دارای کل سبد نسخه:</span>
            </h4>
            <div class="space-y-3">
              <div
                v-for="rec in scanResult.recommendedPharmacies"
                :key="rec.pharmacy.id"
                class="p-4 rounded-2xl border text-xs transition-all"
                :class="rec.hasAllItems ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200' : 'bg-slate-50 border-slate-200'"
              >
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="space-y-0.5">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-slate-900">{{ rec.pharmacy.name }}</span>
                      <span v-if="rec.hasAllItems" class="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">✓ ۱۰۰٪ موجودی کل نسخه</span>
                      <span v-else class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">موجودی بخشی از نسخه</span>
                    </div>
                    <p class="text-[11px] text-slate-500">{{ rec.pharmacy.address }}</p>
                  </div>
                  <div class="text-left">
                    <div class="text-xs text-slate-500 font-medium">مجموع برآورد سبد:</div>
                    <div class="text-sm font-black text-slate-900 font-mono">{{ rec.totalBasketPrice.toLocaleString("fa-IR") }} تومان</div>
                  </div>
                </div>

                <div class="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-200/60 text-[11px]">
                  <span class="text-slate-600">
                    📍 فاصله: {{ rec.distanceKm.toLocaleString("fa-IR") }} کیلومتر (حدود {{ rec.travelMinutes.toLocaleString("fa-IR") }} دقیقه)
                  </span>
                  <div class="flex items-center gap-2">
                    <a :href="`tel:${rec.pharmacy.phone}`" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors">
                      تماس ({{ rec.pharmacy.phone }})
                    </a>
                    <button class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs" @click="openReserve(rec.pharmacy)">
                      رزرو یکجای نسخه
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-3">
          <UploadCloud class="w-12 h-12 text-slate-300 mx-auto" />
          <h3 class="text-sm font-bold text-slate-700">کد نسخه را وارد نمایید</h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            هوش مصنوعی ترب سلامت به صورت خودکار تمام داروخانه‌های اطراف را اسکن کرده و نزدیک‌ترین داروخانه با انبار کامل را به شما پیشنهاد می‌دهد.
          </p>
        </div>

        <!-- History -->
        <div class="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Clock class="w-4 h-4 text-slate-500" />
            <span>تاریخچه نسخه‌های استعلام‌شده اخیر:</span>
          </h4>
          <p v-if="savedPrescriptions.length === 0" class="text-xs text-slate-400 py-3 text-center">هنوز نسخه‌ای ثبت نشده است.</p>
          <div v-else class="space-y-2">
            <div v-for="item in savedPrescriptions.slice(0, 3)" :key="item.prescription.id" class="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-2 flex-wrap">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-800">{{ item.prescription.patientName }}</span>
                  <span class="text-[10px] font-mono text-slate-500">{{ item.prescription.trackingCode }}</span>
                </div>
                <span class="text-[11px] text-slate-400">{{ item.prescription.doctorName }}</span>
              </div>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">تحلیل‌شده و آماده تحویل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { FileSpreadsheet, Search, Sparkles, CheckCircle2, Building2, Pill, UploadCloud, Clock } from "@lucide/vue";
import { store, openReserve } from "../stores/appStore";
import { apiGet, apiPost } from "../services/api";

const form = reactive({
  trackingCode: "RX-98234-TH",
  nationalId: store.currentUser?.nationalId || "0012345678",
  userPhone: store.currentUser?.phone || "09121112233",
  rawText: "",
});

const isScanning = ref(false);
const scanResult = ref<any | null>(null);
const savedPrescriptions = ref<any[]>([]);

function loadSample(type: "diabetes" | "transplant") {
  if (type === "diabetes") {
    form.trackingCode = "RX-98234-TH";
    form.rawText = "انسولین لانتوس سولوستار و متفورمین ۵۰۰ هگزال";
  } else {
    form.trackingCode = "RX-55410-TX";
    form.rawText = "سل‌سپت ۵۰۰ سوئیسی پیوند کلیه";
  }
}

async function fetchHistory() {
  const data = await apiGet("/api/prescriptions");
  if (data.success) savedPrescriptions.value = data.prescriptions;
}

onMounted(fetchHistory);

async function handleScan() {
  isScanning.value = true;
  try {
    const data = await apiPost("/api/prescriptions/scan-ai", {
      trackingCode: form.trackingCode,
      nationalId: form.nationalId,
      rawText: form.rawText,
      city: store.city,
    });

    if (data.success) {
      scanResult.value = data;
      await apiPost("/api/prescriptions", {
        userId: store.currentUser?.id,
        patientName: store.currentUser?.name || "بیمار محترم",
        nationalId: form.nationalId,
        trackingCode: form.trackingCode,
        doctorName: data.doctorInfo?.doctorName,
        itemsJson: data.extractedItems,
        city: store.city,
        userPhone: form.userPhone,
        notes: "ثبت شده از طریق اسکنر هوشمند نسخه الکترونیک",
      });
      fetchHistory();
    }
  } finally {
    isScanning.value = false;
  }
}
</script>
