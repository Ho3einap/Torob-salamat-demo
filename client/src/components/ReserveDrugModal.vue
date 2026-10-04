<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
    <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <CalendarCheck class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">رزرو فوری دارو در داروخانه</h3>
            <p class="text-[11px] text-slate-500">نگهداری اختصاصی برای شما به مدت ۳ ساعت</p>
          </div>
        </div>
        <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors" @click="emit('close')">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6">
        <!-- Success state -->
        <div v-if="successReservation" class="text-center py-6 space-y-4">
          <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 class="w-10 h-10" />
          </div>
          <div>
            <h4 class="text-base font-bold text-slate-900">رزرو شما با موفقیت ثبت شد!</h4>
            <p class="text-xs text-slate-500 mt-1">
              داروخانه <strong>{{ pharmacy?.name }}</strong> در جریان رزرو شما قرار گرفت.
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-right text-xs space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-500">شماره پیگیری رزرو:</span>
              <span class="font-mono font-bold text-rose-600">#{{ successReservation.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">داروخانه:</span>
              <span class="font-semibold text-slate-800">{{ pharmacy?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">تلفن تماس داروخانه:</span>
              <a :href="`tel:${pharmacy?.phone}`" class="font-bold text-rose-600">{{ pharmacy?.phone }}</a>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">مبلغ قابل پرداخت در محل:</span>
              <span class="font-bold text-emerald-700">{{ totalPrice.toLocaleString("fa-IR") }} تومان</span>
            </div>
          </div>

          <div class="flex gap-2">
            <a
              :href="`tel:${pharmacy?.phone}`"
              class="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Phone class="w-4 h-4 text-slate-600" />
              <span>تماس با مسئول فنی</span>
            </a>
            <button class="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors" @click="emit('close')">
              متوجه شدم
            </button>
          </div>
        </div>

        <!-- Form state -->
        <form v-else class="space-y-4" @submit.prevent="handleSubmit">
          <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <div class="flex items-center gap-2">
                <Pill class="w-4 h-4 text-rose-600" />
                <span class="font-bold text-slate-800">{{ medication ? medication.brandName : "داروی درخواستی" }}</span>
              </div>
              <span class="text-slate-500">{{ medication?.dosageStrength }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <div class="flex items-center gap-1.5">
                <Building2 class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ pharmacy?.name }}</span>
              </div>
              <span class="text-[11px] text-slate-400">{{ pharmacy?.neighborhood }}</span>
            </div>
            <div v-if="medication?.isColdChain" class="p-2 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] flex items-center gap-1.5 font-medium">
              <Clock class="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span>زنجیره سرد: داروخانه این دارو را در محفظه کلدپک نگه‌می‌دارد.</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">تعداد یا بسته درخواستی:</label>
            <div class="flex items-center gap-3">
              <div class="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button type="button" class="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold" @click="quantity = Math.max(1, quantity - 1)">-</button>
                <span class="px-4 py-1.5 text-xs font-bold text-slate-800">{{ quantity }}</span>
                <button type="button" class="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold" @click="quantity = Math.min(10, quantity + 1)">+</button>
              </div>
              <div class="text-xs text-slate-500">
                مبلغ کل: <strong class="text-slate-900 font-bold">{{ totalPrice.toLocaleString("fa-IR") }} تومان</strong>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">نحوه تحویل دارو:</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="p-3 rounded-2xl border text-right transition-all flex items-center gap-2 text-xs font-bold"
                :class="deliveryType === 'pickup' ? 'border-rose-600 bg-rose-50/70 text-rose-700 shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
                @click="deliveryType = 'pickup'"
              >
                <Store class="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <div>مراجعه حضوری</div>
                  <div class="text-[10px] text-slate-400 font-normal">تحویل درب داروخانه</div>
                </div>
              </button>

              <button
                type="button"
                class="p-3 rounded-2xl border text-right transition-all flex items-center gap-2 text-xs font-bold"
                :class="deliveryType === 'express_courier' ? 'border-rose-600 bg-rose-50/70 text-rose-700 shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
                @click="deliveryType = 'express_courier'"
              >
                <Truck class="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <div>پیک اکسپرس فوری</div>
                  <div class="text-[10px] text-slate-400 font-normal">ارسال کمتر از ۴۵ دقیقه</div>
                </div>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">شماره همراه خریدار:</label>
              <input
                v-model="phone"
                type="text"
                required
                class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden font-mono"
                placeholder="0912xxxxxxx"
              />
            </div>
            <div v-if="deliveryType === 'express_courier'" class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">آدرس دقیق جهت تحویل پیک:</label>
              <input
                v-model="address"
                type="text"
                required
                class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden"
                placeholder="تهران، خیابان..."
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">توضیحات یا یادداشت برای داروساز (اختیاری):</label>
            <input
              v-model="patientNotes"
              type="text"
              class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden"
              placeholder="مثلا: تا ۱ ساعت دیگر مراجعه میکنم، لطفا نسخه تایید شود"
            />
          </div>

          <div class="flex gap-2 pt-2">
            <button type="button" class="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors" @click="emit('close')">
              انصراف
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20"
            >
              {{ isSubmitting ? "در حال ثبت رزرو..." : "تایید و رزرو قطعی دارو" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { X, CalendarCheck, Building2, Pill, Phone, Truck, Store, CheckCircle2, AlertCircle, Clock } from "@lucide/vue";
import { store, refreshCounts } from "../stores/appStore";
import { apiPost } from "../services/api";

const emit = defineEmits<{ (e: "close"): void }>();

const pharmacy = computed(() => store.reserveModal.pharmacy);
const medication = computed(() => store.reserveModal.medication);

const quantity = ref(1);
const deliveryType = ref<"pickup" | "express_courier">("pickup");
const phone = ref(store.currentUser?.phone || "09121112233");
const address = ref(store.currentUser?.address || "");
const patientNotes = ref("");
const isSubmitting = ref(false);
const successReservation = ref<any | null>(null);
const errorMessage = ref("");

const unitPrice = computed(() => medication.value?.officialPrice || pharmacy.value?.__price || 350000);
const totalPrice = computed(() => unitPrice.value * quantity.value);

async function handleSubmit() {
  if (!pharmacy.value) return;
  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    const data = await apiPost("/api/reservations", {
      userId: store.currentUser?.id,
      pharmacyId: pharmacy.value.id,
      medicationId: medication.value?.id,
      quantity: quantity.value,
      unitPrice: unitPrice.value,
      deliveryType: deliveryType.value,
      userPhone: phone.value,
      userAddress: address.value,
      patientNotes: patientNotes.value,
    });

    if (data.success) {
      successReservation.value = data.reservation;
      refreshCounts();
    } else {
      errorMessage.value = data.error || "خطا در ثبت رزرو دارو";
    }
  } catch {
    errorMessage.value = "خطای برقراری ارتباط با سرور";
  } finally {
    isSubmitting.value = false;
  }
}
</script>
