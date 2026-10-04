<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-black text-slate-900">شبکه داروخانه‌ها و رادار فاصله ترب سلامت</h2>
          <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">{{ pharmacies.length }} داروخانه فعال</span>
        </div>
        <p class="text-xs text-slate-500 mt-1">داروخانه‌های منتخب سهمیه‌ای هلال احمر، ۱۳ آبان، ۲۹ فروردین و شبانه‌روزی با قابلیت تماس مستقیم و رزرو</p>
      </div>

      <button
        v-if="store.currentUser?.role === 'admin' || store.currentUser?.role === 'pharmacist'"
        class="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        @click="showAddModal = true"
      >
        <Plus class="w-4 h-4" />
        <span>ثبت داروخانه جدید در شبکه</span>
      </button>
    </div>

    <!-- Search -->
    <div class="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div class="relative flex-1">
          <Search class="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="جستجوی نام داروخانه، محله (ونک، تجریش، سعادت‌آباد...) یا تلفن"
            class="w-full text-xs pr-10 pl-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-500 outline-hidden"
          />
        </div>
        <div class="flex items-center gap-3 text-xs">
          <label class="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
            <input v-model="is24hOnly" type="checkbox" class="w-4 h-4 rounded text-rose-600 focus:ring-rose-500" />
            <span>🌙 فقط شبانه‌روزی</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
            <input v-model="deliveryOnly" type="checkbox" class="w-4 h-4 rounded text-rose-600 focus:ring-rose-500" />
            <span>🛵 دارای پیک اکسپرس</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Grid -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i" class="p-5 rounded-3xl bg-white border border-slate-200 animate-pulse space-y-4">
        <div class="h-4 bg-slate-200 rounded-md w-3/4" />
        <div class="h-3 bg-slate-100 rounded-md w-1/2" />
        <div class="h-14 bg-slate-100 rounded-2xl" />
      </div>
    </div>

    <div v-else-if="pharmacies.length === 0" class="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-3">
      <Building2 class="w-12 h-12 text-slate-300 mx-auto" />
      <h3 class="text-sm font-bold text-slate-700">داروخانه‌ای با این مشخصات یافت نشد</h3>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="pharmacy in pharmacies"
        :key="pharmacy.id"
        class="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
      >
        <div>
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-bold text-slate-900">{{ pharmacy.name }}</h3>
                <span v-if="pharmacy.is24h" class="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">🌙 شبانه‌روزی</span>
                <span v-if="pharmacy.isVerified" class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <ShieldCheck class="w-2.5 h-2.5" />
                  تایید سامانه ۱۹۰
                </span>
              </div>
              <p class="text-xs text-slate-500">{{ pharmacy.licenseType || "داروخانه عمومی" }}</p>
            </div>

            <div class="flex items-center gap-1 bg-amber-50 text-amber-900 font-bold px-2 py-1 rounded-xl text-xs shrink-0">
              <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{{ pharmacy.rating }}</span>
              <span class="text-[10px] text-slate-400">({{ pharmacy.totalReviews || 80 }})</span>
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 my-3 flex items-center justify-between text-xs">
            <div class="flex items-center gap-1.5 text-emerald-900 font-bold">
              <Navigation class="w-4 h-4 text-emerald-600" />
              <span>فاصله از موقعیت شما: <strong>{{ (pharmacy.distanceKm || 1.2).toLocaleString("fa-IR") }} کیلومتر</strong></span>
            </div>
            <span class="text-emerald-800 font-medium">حدود {{ (pharmacy.travelMinutes || 5).toLocaleString("fa-IR") }} دقیقه با خودرو</span>
          </div>

          <div class="space-y-2 text-xs text-slate-600">
            <div class="flex items-start gap-2">
              <MapPin class="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span class="leading-relaxed">{{ pharmacy.address }}</span>
            </div>
            <div class="flex items-center justify-between pt-1 border-t border-slate-100 flex-wrap gap-1">
              <div class="flex items-center gap-2">
                <Phone class="w-4 h-4 text-slate-400" />
                <a :href="`tel:${pharmacy.phone}`" class="font-bold text-slate-800 font-mono hover:text-rose-600">{{ pharmacy.phone }}</a>
              </div>
              <span v-if="pharmacy.pharmacistInCharge" class="text-[11px] text-slate-500">مسئول فنی: {{ pharmacy.pharmacistInCharge }}</span>
            </div>
          </div>

          <div v-if="pharmacy.insuranceAccepted" class="flex items-center gap-1.5 flex-wrap mt-3 pt-2 border-t border-slate-100">
            <span class="text-[10px] text-slate-400 font-semibold">پوشش بیمه‌ای:</span>
            <span v-for="(ins, idx) in (pharmacy.insuranceAccepted as string[])" :key="idx" class="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md">
              {{ ins }}
            </span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
          <a :href="`tel:${pharmacy.phone}`" class="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs">
            <Phone class="w-3.5 h-3.5" />
            <span>تماس فوری</span>
          </a>
          <a
            :href="`https://nshn.ir/?lat=${pharmacy.latitude}&lng=${pharmacy.longitude}`"
            target="_blank"
            rel="noreferrer"
            class="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1"
          >
            <Navigation class="w-3.5 h-3.5 text-slate-500" />
            <span>نشان و بلد</span>
          </a>
          <button class="py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors" @click="openReview(pharmacy)">
            ثبت نظر
          </button>
        </div>
      </div>
    </div>

    <!-- Add Pharmacy Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold text-slate-900">افزودن داروخانه جدید به شبکه ترب سلامت</h3>
          <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100" @click="showAddModal = false">
            <X class="w-5 h-5" />
          </button>
        </div>
        <form class="space-y-3 text-xs" @submit.prevent="handleCreatePharmacy">
          <div>
            <label class="block text-slate-700 font-semibold mb-1">نام داروخانه:</label>
            <input v-model="newPh.name" type="text" required placeholder="مثلا داروخانه شبانه‌روزی دکتر حسینی" class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-slate-700 font-semibold mb-1">شهر:</label>
              <input v-model="newPh.city" type="text" required class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
            </div>
            <div>
              <label class="block text-slate-700 font-semibold mb-1">محله:</label>
              <input v-model="newPh.neighborhood" type="text" required class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
            </div>
          </div>
          <div>
            <label class="block text-slate-700 font-semibold mb-1">آدرس کامل:</label>
            <input v-model="newPh.address" type="text" required placeholder="تهران، میدان..." class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-slate-700 font-semibold mb-1">شماره تلفن ثابت:</label>
              <input v-model="newPh.phone" type="text" required placeholder="02188xxxxxx" class="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono outline-hidden" />
            </div>
            <div>
              <label class="block text-slate-700 font-semibold mb-1">نام مسئول فنی:</label>
              <input v-model="newPh.pharmacistInCharge" type="text" placeholder="دکتر ..." class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
            </div>
          </div>
          <div class="flex items-center gap-2 pt-2">
            <input id="chk24h" v-model="newPh.is24h" type="checkbox" class="w-4 h-4 rounded text-rose-600" />
            <label for="chk24h" class="font-semibold text-slate-700">داروخانه شبانه‌روزی است (پاسخگویی ۲۴ ساعته)</label>
          </div>
          <div class="flex gap-2 pt-2">
            <button type="button" class="flex-1 py-2 rounded-xl border border-slate-200 font-bold" @click="showAddModal = false">انصراف</button>
            <button type="submit" class="flex-2 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800">ثبت داروخانه</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="reviewTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Star class="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">ثبت تجربه و امتیاز به داروخانه</h3>
              <p class="text-[11px] text-slate-500">{{ reviewTarget.name }}</p>
            </div>
          </div>
          <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100" @click="reviewTarget = null">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6">
          <div v-if="reviewSuccess" class="text-center py-6 space-y-2">
            <CheckCircle2 class="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 class="text-sm font-bold text-slate-900">نظر شما با موفقیت ثبت شد!</h4>
            <p class="text-xs text-slate-500">از اینکه به سایر بیماران در یافتن دارو کمک می‌کنید سپاسگزاریم.</p>
          </div>

          <form v-else class="space-y-4" @submit.prevent="handleAddReview">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5 text-center">امتیاز کلی به داروخانه:</label>
              <div class="flex justify-center gap-2">
                <button v-for="star in 5" :key="star" type="button" class="p-1 hover:scale-110 transition-transform" @click="reviewForm.rating = star">
                  <Star class="w-7 h-7" :class="star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'" />
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2">
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center space-y-1">
                <span class="text-[11px] text-slate-500 block">صحت موجودی اعلام‌شده:</span>
                <select v-model.number="reviewForm.stockAccuracyScore" class="w-full text-xs font-bold py-1 bg-white border border-slate-200 rounded-lg text-center">
                  <option :value="5">کاملاً دقیق (۵ از ۵)</option>
                  <option :value="4">خوب (۴ از ۵)</option>
                  <option :value="3">متوسط (۳ از ۵)</option>
                  <option :value="2">ناقص (۲ از ۵)</option>
                </select>
              </div>
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center space-y-1">
                <span class="text-[11px] text-slate-500 block">پاسخگویی مسئول فنی:</span>
                <select v-model.number="reviewForm.pharmacistServiceScore" class="w-full text-xs font-bold py-1 bg-white border border-slate-200 rounded-lg text-center">
                  <option :value="5">عالی و راهنما (۵ از ۵)</option>
                  <option :value="4">خوب (۴ از ۵)</option>
                  <option :value="3">متوسط (۳ از ۵)</option>
                  <option :value="2">ضعیف (۲ از ۵)</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">متن نظر و تجربه شما از تحویل دارو:</label>
              <textarea
                v-model="reviewForm.comment"
                rows="3"
                required
                class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-500 outline-hidden"
                placeholder="مثلا: برخورد مسئول فنی بسیار محترمانه بود و انسولین را در محفظه یخ تحویل دادند..."
              />
            </div>

            <div class="flex gap-2 pt-2">
              <button type="button" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50" @click="reviewTarget = null">انصراف</button>
              <button type="submit" class="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors">ارسال نظر</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import { Search, Building2, Phone, MapPin, ShieldCheck, Star, Navigation, Plus, CheckCircle2, X } from "@lucide/vue";
import { store } from "../stores/appStore";
import { apiGet, apiPost } from "../services/api";

const pharmacies = ref<any[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const is24hOnly = ref(false);
const deliveryOnly = ref(false);
const showAddModal = ref(false);

const newPh = reactive({
  name: "",
  city: "تهران",
  neighborhood: "ونک",
  address: "",
  phone: "",
  is24h: true,
  pharmacistInCharge: "",
});

const reviewTarget = ref<any | null>(null);
const reviewSuccess = ref(false);
const reviewForm = reactive({
  rating: 5,
  stockAccuracyScore: 5,
  pharmacistServiceScore: 5,
  comment: "",
});

let timer: ReturnType<typeof setTimeout> | null = null;

async function fetchPharmacies() {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (searchQuery.value) params.set("q", searchQuery.value);
    if (is24hOnly.value) params.set("is24hOnly", "true");
    if (deliveryOnly.value) params.set("deliveryOnly", "true");
    params.set("lat", "35.7575");
    params.set("lng", "51.4099");

    const data = await apiGet(`/api/pharmacies?${params.toString()}`);
    if (data.success) pharmacies.value = data.pharmacies;
  } finally {
    loading.value = false;
  }
}

watch([searchQuery, is24hOnly, deliveryOnly], () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(fetchPharmacies, 200);
});

onMounted(fetchPharmacies);

async function handleCreatePharmacy() {
  const data = await apiPost("/api/pharmacies", { ...newPh, latitude: "35.7575", longitude: "51.4099" });
  if (data.success) {
    showAddModal.value = false;
    newPh.name = "";
    newPh.address = "";
    newPh.phone = "";
    fetchPharmacies();
  }
}

function openReview(pharmacy: any) {
  reviewTarget.value = pharmacy;
  reviewSuccess.value = false;
  reviewForm.comment = "";
  reviewForm.rating = 5;
}

async function handleAddReview() {
  if (!reviewTarget.value) return;
  const data = await apiPost("/api/reviews", {
    pharmacyId: reviewTarget.value.id,
    userId: store.currentUser?.id,
    userName: store.currentUser?.name || "کاربر ترب سلامت",
    rating: reviewForm.rating,
    stockAccuracyScore: reviewForm.stockAccuracyScore,
    pharmacistServiceScore: reviewForm.pharmacistServiceScore,
    comment: reviewForm.comment,
  });
  if (data.success) {
    reviewSuccess.value = true;
    fetchPharmacies();
    setTimeout(() => {
      reviewTarget.value = null;
    }, 1200);
  }
}
</script>
