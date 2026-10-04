<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-black text-slate-900">بانک جامع داروها و رده‌بندی کیفی سازندگان</h2>
          <span class="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">{{ medications.length }} قلم دارو</span>
        </div>
        <p class="text-xs text-slate-500 mt-1">مقایسه اصالت فرمولاسیون، امتیاز کیفی شرکت‌های سازنده و قیمت مصوب سازمان غذا و دارو (TTAC)</p>
      </div>

      <button
        v-if="store.currentUser?.role === 'admin' || store.currentUser?.role === 'pharmacist'"
        class="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        @click="showAddModal = true"
      >
        <Plus class="w-4 h-4" />
        <span>افزودن داروی جدید به سامانه</span>
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div class="relative flex-1">
          <Search class="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="جستجوی نام تجاری دارو (مثلا لانتوس، سل‌سپت، ریتالین، مسالازین...)"
            class="w-full text-xs pr-10 pl-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden"
          />
        </div>

        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1 text-xs text-slate-500 shrink-0">
            <ArrowUpDown class="w-3.5 h-3.5" />
            <span>مرتب‌سازی:</span>
          </div>
          <select v-model="sortBy" class="text-xs px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 font-medium focus:border-rose-500 outline-hidden">
            <option value="quality">بهترین کیفیت سازنده (امتیاز بالا به پایین)</option>
            <option value="price_asc">ارزان‌ترین قیمت مصوب</option>
            <option value="price_desc">گران‌ترین قیمت مصوب</option>
            <option value="name">بر اساس نام فارسی</option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all"
          :class="selectedCategory === cat.id ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          @click="selectedCategory = cat.id"
        >
          {{ cat.label }}
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input v-model="rareOnly" type="checkbox" class="w-4 h-4 rounded-md text-rose-600 focus:ring-rose-500" />
          <span class="font-semibold text-slate-700">فقط داروهای کمیاب و خاص</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input v-model="coldChainOnly" type="checkbox" class="w-4 h-4 rounded-md text-cyan-600 focus:ring-cyan-500" />
          <span class="font-semibold text-slate-700 flex items-center gap-1">
            <ThermometerSnowflake class="w-3.5 h-3.5 text-cyan-600" />
            فقط داروهای زنجیره سرد یخچال (۲ تا ۸ درجه)
          </span>
        </label>
      </div>
    </div>

    <!-- Grid -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="p-5 rounded-3xl bg-white border border-slate-200 animate-pulse space-y-4">
        <div class="h-4 bg-slate-200 rounded-md w-3/4" />
        <div class="h-3 bg-slate-100 rounded-md w-1/2" />
        <div class="h-16 bg-slate-100 rounded-2xl" />
      </div>
    </div>

    <div v-else-if="medications.length === 0" class="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-3">
      <Pill class="w-12 h-12 text-slate-300 mx-auto" />
      <h3 class="text-sm font-bold text-slate-700">دارویی با این مشخصات یافت نشد</h3>
      <p class="text-xs text-slate-500">می‌توانید از هوش مصنوعی ترب سلامت برای جستجوی نام عامیانه دارو استفاده فرمایید.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="med in medications"
        :key="med.id"
        class="group p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span v-if="med.isRare" class="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">کمیاب</span>
              <span v-if="med.isColdChain" class="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <ThermometerSnowflake class="w-2.5 h-2.5" />
                زنجیره سرد
              </span>
            </div>
            <span class="text-[11px] text-slate-400 font-medium">{{ med.category }}</span>
          </div>

          <h3 class="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors cursor-pointer" @click="openDetail(med.id)">
            {{ med.brandName }}
          </h3>
          <p class="text-xs text-slate-500 mt-0.5 font-medium">{{ med.persianName }} ({{ med.dosageStrength }})</p>

          <div class="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
            <div class="flex items-center justify-between gap-1">
              <div class="flex items-center gap-1 text-slate-700">
                <Award class="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span class="font-semibold truncate max-w-[150px]">{{ med.manufacturer?.persianName || med.manufacturer?.name || "نامشخص" }}</span>
              </div>
              <span class="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded-md shrink-0">
                گرید {{ med.manufacturer?.qualityTier || "A" }} • {{ med.manufacturer?.qualityScore || 85 }}/۱۰۰
              </span>
            </div>
            <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{{ med.usageSummary }}</p>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-slate-400">قیمت مصوب سازمان غذا و دارو:</span>
            <span class="text-xs font-black text-slate-900 font-mono">{{ med.officialPrice.toLocaleString("fa-IR") }} تومان</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button class="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors" @click="openDetail(med.id)">
              مقایسه و موجودی
            </button>
            <router-link
              :to="{ path: '/chat', query: { prefill: `سلام، داروی ${med.brandName} (${med.persianName}) نزدیک من کجا پیدا میشه؟` } }"
              class="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
            >
              <Sparkles class="w-3.5 h-3.5" />
              <span>جستجوی هوشمند</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Medication Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold text-slate-900">افزودن داروی جدید به کاتالوگ ترب سلامت</h3>
          <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100" @click="showAddModal = false">
            <X class="w-5 h-5" />
          </button>
        </div>
        <form class="space-y-3 text-xs" @submit.prevent="handleCreateMedication">
          <div>
            <label class="block text-slate-700 font-semibold mb-1">نام تجاری لاتین (Brand Name):</label>
            <input v-model="newMed.brandName" type="text" required placeholder="e.g. Humira 40mg" class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
          </div>
          <div>
            <label class="block text-slate-700 font-semibold mb-1">نام فارسی دارو:</label>
            <input v-model="newMed.persianName" type="text" required placeholder="مثلا آمپول هومیرا ۴۰" class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-slate-700 font-semibold mb-1">دسته درمانی:</label>
              <select v-model="newMed.category" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-hidden">
                <option v-for="c in categories.filter((x) => x.id !== 'all')" :key="c.id" :value="c.id">{{ c.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-700 font-semibold mb-1">دوز دارو:</label>
              <input v-model="newMed.dosageStrength" type="text" required placeholder="500mg" class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-slate-700 font-semibold mb-1">قیمت مصوب (تومان):</label>
              <input v-model.number="newMed.officialPrice" type="number" required class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
            </div>
            <div class="flex items-center gap-3 pt-5">
              <label class="flex items-center gap-1 font-semibold">
                <input v-model="newMed.isRare" type="checkbox" />
                داروی کمیاب
              </label>
              <label class="flex items-center gap-1 font-semibold">
                <input v-model="newMed.isColdChain" type="checkbox" />
                زنجیره سرد
              </label>
            </div>
          </div>
          <div>
            <label class="block text-slate-700 font-semibold mb-1">خلاصه مورد مصرف:</label>
            <textarea v-model="newMed.usageSummary" rows="2" class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
          </div>
          <div class="flex gap-2 pt-2">
            <button type="button" class="flex-1 py-2 rounded-xl border border-slate-200 font-bold" @click="showAddModal = false">انصراف</button>
            <button type="submit" class="flex-2 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700">ذخیره دارو</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Medication Detail Modal -->
    <div v-if="detailId !== null" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
              <Pill class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-slate-900">{{ detail?.medication?.brandName || "مشخصات دارو" }}</h3>
                <span v-if="detail?.medication?.isRare" class="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">داروی کمیاب و خاص</span>
                <span v-if="detail?.medication?.isColdChain" class="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <ThermometerSnowflake class="w-3 h-3 text-cyan-600" />
                  زنجیره سرد
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">{{ detail?.medication?.persianName }} • {{ detail?.medication?.dosageStrength }}</p>
            </div>
          </div>
          <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors" @click="detailId = null">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div v-if="detailLoading || !detail?.medication" class="py-16 text-center space-y-3">
            <div class="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p class="text-xs text-slate-500">در حال دریافت پرونده جامع دارو و موجودی زنده...</p>
          </div>

          <template v-else>
            <div class="p-4 rounded-2xl bg-gradient-to-l from-slate-900 to-slate-800 text-white shadow-md">
              <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-700">
                <div class="flex items-center gap-2">
                  <Award class="w-5 h-5 text-amber-400" />
                  <div>
                    <span class="text-xs text-slate-300">شرکت سازنده دارو:</span>
                    <h4 class="text-sm font-bold text-white">
                      {{ detail.medication.manufacturer?.persianName || detail.medication.manufacturer?.name }} ({{ detail.medication.manufacturer?.country }})
                    </h4>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="px-2.5 py-1 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
                    گرید کیفی: {{ detail.medication.manufacturer?.qualityTier || "A+" }}
                  </div>
                  <div class="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono">
                    امتیاز: {{ detail.medication.manufacturer?.qualityScore || 95 }}/۱۰۰
                  </div>
                </div>
              </div>
              <p class="text-xs text-slate-300 mt-3 leading-relaxed">
                {{ detail.medication.manufacturer?.reputationNotes || "تولیدشده طبق بالاترین استانداردهای داروسازی GMP و آزمایشگاه‌های کنترل کیفیت مرجع." }}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div class="flex items-center gap-1.5 font-bold text-slate-800">
                  <FileText class="w-4 h-4 text-rose-600" />
                  <span>مورد مصرف و اثر درمانی:</span>
                </div>
                <p class="text-slate-600 leading-relaxed">{{ detail.medication.usageSummary }}</p>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div class="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldAlert class="w-4 h-4 text-amber-600" />
                  <span>نکات و عوارض جانبی احتمالی:</span>
                </div>
                <p class="text-slate-600 leading-relaxed">{{ detail.medication.sideEffects || "طبق دستور پزشک مصرف شود." }}</p>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span class="text-slate-500 text-[11px] block">قیمت مصوب سازمان غذا و دارو (TTAC):</span>
                <span class="text-base font-black text-emerald-800">{{ detail.medication.officialPrice.toLocaleString("fa-IR") }} تومان</span>
              </div>
              <div class="text-right">
                <span class="text-slate-500 text-[11px] block">شرایط نگهداری:</span>
                <span class="font-semibold text-slate-700">{{ detail.medication.storageCondition }}</span>
              </div>
              <button class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-xs" @click="openAlert(detail.medication)">
                فعال‌سازی گوش‌به‌زنگ
              </button>
            </div>

            <div>
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 class="w-4 h-4 text-rose-600" />
                  <span>داروخانه‌های دارای موجودی فعال در شبکه ترب سلامت:</span>
                </h4>
                <span class="text-[11px] text-slate-400">{{ detail.pharmaciesStock?.length || 0 }} داروخانه یافت شد</span>
              </div>

              <div v-if="!detail.pharmaciesStock?.length" class="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                <p class="text-xs text-slate-500 font-medium">در حال حاضر موجودی این دارو در داروخانه‌های اطراف شما ثبت نشده است.</p>
                <button class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors" @click="openAlert(detail.medication)">
                  گوش‌به‌زنگ شو تا به محض شارژ پیامک بیاد
                </button>
              </div>

              <div v-else class="space-y-2.5">
                <div
                  v-for="item in detail.pharmaciesStock"
                  :key="item.inventoryId"
                  class="p-3.5 rounded-2xl border border-slate-200 hover:border-rose-300 bg-white hover:bg-rose-50/20 transition-all flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-slate-900">{{ item.pharmacy.name }}</span>
                      <span v-if="item.pharmacy.is24h" class="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded-md">۲۴ ساعته</span>
                      <span
                        class="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                        :class="item.stockStatus === 'in_stock' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                      >
                        {{ item.stockStatus === "in_stock" ? `موجود (${item.stockQuantity} عدد)` : "موجودی محدود" }}
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-500">{{ item.pharmacy.address }}</p>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="text-left">
                      <div class="font-bold text-slate-900">{{ item.price.toLocaleString("fa-IR") }} تومان</div>
                      <a :href="`tel:${item.pharmacy.phone}`" class="text-[11px] font-mono text-rose-600 hover:underline block">{{ item.pharmacy.phone }}</a>
                    </div>
                    <button class="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs" @click="openReserve(item.pharmacy, detail.medication)">
                      رزرو فوری
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="detail.alternatives?.length" class="pt-2 border-t border-slate-100">
              <h4 class="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <ArrowRightLeft class="w-4 h-4 text-slate-500" />
                <span>برندها و شرکت‌های جایگزین همین مولکول دارویی:</span>
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div v-for="alt in detail.alternatives" :key="alt.id" class="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2">
                  <div>
                    <span class="font-bold text-slate-800">{{ alt.brandName }}</span>
                    <span class="text-[11px] text-slate-500 block">
                      سازنده: {{ alt.manufacturer?.persianName || "ایران" }} (گرید {{ alt.manufacturer?.qualityTier || "A" }})
                    </span>
                  </div>
                  <span class="font-bold text-emerald-700 shrink-0">{{ alt.officialPrice.toLocaleString("fa-IR") }} ت</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import {
  Search,
  Pill,
  Award,
  ThermometerSnowflake,
  Building2,
  Plus,
  ArrowUpDown,
  Sparkles,
  ShieldAlert,
  FileText,
  ArrowRightLeft,
  X,
} from "@lucide/vue";
import { store, openReserve, openAlert } from "../stores/appStore";
import { apiGet, apiPost } from "../services/api";

const medications = ref<any[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedCategory = ref("all");
const rareOnly = ref(false);
const coldChainOnly = ref(false);
const sortBy = ref("quality");
const showAddModal = ref(false);
const detailId = ref<number | null>(null);
const detail = ref<any | null>(null);
const detailLoading = ref(false);

const newMed = reactive({
  brandName: "",
  persianName: "",
  category: "پیوند و ایمونولوژی",
  dosageStrength: "500mg",
  officialPrice: 350000,
  isRare: true,
  isColdChain: false,
  usageSummary: "",
});

const categories = [
  { id: "all", label: "همه دسته‌ها" },
  { id: "پیوند و ایمونولوژی", label: "پیوند و ایمونولوژی" },
  { id: "دیابت و غدد", label: "دیابت و غدد (انسولین)" },
  { id: "اعصاب و روان", label: "اعصاب و روان (ریتالین)" },
  { id: "انکولوژی و سرطان", label: "انکولوژی و سرطان" },
  { id: "تنفسی", label: "تنفسی و آسم" },
  { id: "گوارشی", label: "گوارشی و کولیت" },
];

let timer: ReturnType<typeof setTimeout> | null = null;

async function fetchMedications() {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (searchQuery.value) params.set("q", searchQuery.value);
    if (selectedCategory.value !== "all") params.set("category", selectedCategory.value);
    if (rareOnly.value) params.set("rareOnly", "true");
    if (coldChainOnly.value) params.set("coldChainOnly", "true");
    params.set("sortBy", sortBy.value);

    const data = await apiGet(`/api/medications?${params.toString()}`);
    if (data.success) medications.value = data.medications;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

watch([searchQuery, selectedCategory, rareOnly, coldChainOnly, sortBy], () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(fetchMedications, 200);
});

onMounted(fetchMedications);

async function openDetail(id: number) {
  detailId.value = id;
  detailLoading.value = true;
  detail.value = null;
  try {
    const data = await apiGet(`/api/medications/${id}`);
    if (data.success) detail.value = data;
  } finally {
    detailLoading.value = false;
  }
}

async function handleCreateMedication() {
  try {
    const data = await apiPost("/api/medications", {
      brandName: newMed.brandName,
      persianName: newMed.persianName,
      genericName: newMed.brandName,
      category: newMed.category,
      dosageStrength: newMed.dosageStrength,
      dosageForm: "قرص",
      officialPrice: newMed.officialPrice,
      isRare: newMed.isRare,
      isColdChain: newMed.isColdChain,
      usageSummary: newMed.usageSummary || "ثبت شده در سامانه ترب سلامت",
    });
    if (data.success) {
      showAddModal.value = false;
      newMed.brandName = "";
      newMed.persianName = "";
      fetchMedications();
    }
  } catch (err) {
    console.error(err);
  }
}
</script>
