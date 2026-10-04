<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
    <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <UserCircle2 class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">پرونده پزشکی و مشخصات کاربر</h3>
            <p class="text-[11px] text-slate-500">مشخصات بیمه، آلرژی‌ها و آدرس محل سکونت</p>
          </div>
        </div>
        <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100" @click="emit('close')">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6">
        <div v-if="savedSuccess" class="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-600" />
          <span>اطلاعات پرونده با موفقیت ذخیره گردید.</span>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">نام و نام‌خانوادگی:</label>
              <input v-model="form.name" type="text" required class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-500 outline-hidden" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">شماره تلفن همراه:</label>
              <input v-model="form.phone" type="text" required class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-500 font-mono outline-hidden" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">کد ملی (جهت استعلام نسخه):</label>
              <input v-model="form.nationalId" type="text" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-500 font-mono outline-hidden" placeholder="0012345678" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">سازمان بیمه‌گر پایه:</label>
              <select v-model="form.insuranceType" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-rose-500 outline-hidden">
                <option value="تامین اجتماعی">سازمان تامین اجتماعی</option>
                <option value="بیمه سلامت (ایرانیان)">بیمه سلامت (ایرانیان / همگانی)</option>
                <option value="نیروهای مسلح (ساحد)">بیمه خدمات درمانی نیروهای مسلح</option>
                <option value="بیمه دی (جانبازان و ایثارگران)">بیمه دی</option>
                <option value="بیمه دانا">بیمه دانا</option>
                <option value="بیمه ایران">بیمه ایران</option>
                <option value="آزاد / بدون بیمه">آزاد / فاقد بیمه</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">شهر محل سکونت:</label>
              <input v-model="form.city" type="text" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-500 outline-hidden" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">محله / منطقه:</label>
              <input v-model="form.neighborhood" type="text" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-500 outline-hidden" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">آدرس کامل پستی (جهت ارسال با پیک):</label>
            <textarea v-model="form.address" rows="2" class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-500 outline-hidden" placeholder="تهران، خیابان..." />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5 text-amber-700">
              <AlertTriangle class="w-3.5 h-3.5 text-amber-600" />
              <span>حساسیت‌ها یا تداخلات دارویی شناخته‌شده (جهت هشدار سیستم):</span>
            </label>
            <input
              v-model="form.allergies"
              type="text"
              class="w-full text-xs px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/30 focus:border-amber-500 outline-hidden"
              placeholder="مثلاً: حساسیت به پنی‌سیلین یا آسپرین"
            />
          </div>

          <div class="flex gap-2 pt-2">
            <button type="button" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors" @click="emit('close')">
              انصراف
            </button>
            <button type="submit" :disabled="isSubmitting" class="flex-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Save class="w-4 h-4" />
              <span>{{ isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات" }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { X, UserCircle2, AlertTriangle, CheckCircle2, Save } from "@lucide/vue";
import { store, saveUserProfile } from "../stores/appStore";

const emit = defineEmits<{ (e: "close"): void }>();

const u = store.currentUser || {};
const form = reactive({
  id: u.id,
  name: u.name || "",
  phone: u.phone || "",
  email: u.email || "",
  insuranceType: u.insuranceType || "تامین اجتماعی",
  nationalId: u.nationalId || "",
  city: u.city || "تهران",
  neighborhood: u.neighborhood || "ونک",
  address: u.address || "",
  allergies: u.allergies || "",
});

const isSubmitting = ref(false);
const savedSuccess = ref(false);

async function handleSubmit() {
  isSubmitting.value = true;
  try {
    const ok = await saveUserProfile(form);
    if (ok) {
      savedSuccess.value = true;
      setTimeout(() => {
        savedSuccess.value = false;
        emit("close");
      }, 1200);
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>
