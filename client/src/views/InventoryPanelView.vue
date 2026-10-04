<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-black text-slate-900">پنل مدیریت انبار و موجودی زنده داروخانه</h2>
          <span class="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">داشبورد داروساز و مسئول فنی</span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">تغییر آنی وضعیت موجودی اقلام کمیاب و کنترل قیمت‌های فروش در بستر ترب سلامت</p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs font-semibold text-slate-600">داروخانه فعال:</span>
        <select v-model.number="selectedPharmacyId" class="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-hidden" @change="fetchInventory">
          <option v-for="p in pharmacies" :key="p.id" :value="p.id">{{ p.name }} ({{ p.neighborhood || p.city }})</option>
        </select>

        <button class="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs" @click="showAddModal = true">
          <Plus class="w-4 h-4" />
          <span>افزودن داروی جدید به انبار</span>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Store class="w-4 h-4 text-teal-600" />
          <span>لیست موجودی انبار: {{ currentPharmacy?.name }}</span>
        </div>
        <span class="text-xs text-slate-400">{{ inventory.length }} قلم دارو در انبار</span>
      </div>

      <div v-if="loading" class="p-12 text-center text-xs text-slate-400">در حال بارگذاری لیست موجودی...</div>
      <div v-else-if="inventory.length === 0" class="p-12 text-center text-xs text-slate-400">هیچ دارویی در انبار ثبت نشده است.</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-right text-xs">
          <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th class="p-3.5">نام دارو</th>
              <th class="p-3.5">وضعیت انبار</th>
              <th class="p-3.5">تعداد موجودی</th>
              <th class="p-3.5">قیمت فروش (تومان)</th>
              <th class="p-3.5">آخرین بازبینی</th>
              <th class="p-3.5 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in inventory" :key="item.id" class="hover:bg-slate-50/70 transition-colors">
              <td class="p-3.5">
                <div class="font-bold text-slate-900">{{ item.medicationName }}</div>
                <div class="text-[11px] text-slate-400">{{ item.medicationPersian }}</div>
              </td>
              <td class="p-3.5">
                <select
                  :value="item.stockStatus"
                  class="text-xs font-bold px-2 py-1 rounded-lg border"
                  :class="
                    item.stockStatus === 'in_stock'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : item.stockStatus === 'low_stock'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                  "
                  @change="handleUpdateStock(item.id, ($event.target as HTMLSelectElement).value, item.stockQuantity, item.price)"
                >
                  <option value="in_stock">موجود در قفسه</option>
                  <option value="low_stock">موجودی محدود</option>
                  <option value="out_of_stock">ناموجود / اتمام سهمیه</option>
                </select>
              </td>
              <td class="p-3.5 font-mono">
                <input
                  type="number"
                  :value="item.stockQuantity"
                  class="w-16 px-2 py-1 rounded-lg border border-slate-200 text-center font-bold"
                  @blur="handleUpdateStock(item.id, item.stockStatus, Number(($event.target as HTMLInputElement).value), item.price)"
                />
              </td>
              <td class="p-3.5 font-mono">
                <input
                  type="number"
                  :value="item.price"
                  class="w-28 px-2 py-1 rounded-lg border border-slate-200 text-center font-bold"
                  @blur="handleUpdateStock(item.id, item.stockStatus, item.stockQuantity, Number(($event.target as HTMLInputElement).value))"
                />
              </td>
              <td class="p-3.5 text-slate-400 font-mono text-[11px]">
                {{ new Date(item.lastVerifiedAt).toLocaleDateString("fa-IR") }}
              </td>
              <td class="p-3.5 text-center">
                <button
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                  @click="handleUpdateStock(item.id, item.stockStatus === 'in_stock' ? 'out_of_stock' : 'in_stock', item.stockQuantity, item.price)"
                >
                  تغییر سریع موجودی
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Item Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold text-slate-900">افزودن قلم دارویی به انبار {{ currentPharmacy?.name }}</h3>
          <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100" @click="showAddModal = false">
            <X class="w-5 h-5" />
          </button>
        </div>
        <form class="space-y-3 text-xs" @submit.prevent="handleAddItem">
          <div>
            <label class="block text-slate-700 font-semibold mb-1">انتخاب دارو:</label>
            <select v-model.number="newItem.medId" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-hidden" @change="onMedChange">
              <option v-for="m in allMedications" :key="m.id" :value="m.id">{{ m.brandName }} - {{ m.persianName }} ({{ m.dosageStrength }})</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-slate-700 font-semibold mb-1">تعداد موجودی:</label>
              <input v-model.number="newItem.qty" type="number" required class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
            </div>
            <div>
              <label class="block text-slate-700 font-semibold mb-1">قیمت فروش (تومان):</label>
              <input v-model.number="newItem.price" type="number" required class="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden" />
            </div>
          </div>
          <div>
            <label class="block text-slate-700 font-semibold mb-1">وضعیت اولیه انبار:</label>
            <select v-model="newItem.status" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-hidden">
              <option value="in_stock">موجود در قفسه</option>
              <option value="low_stock">موجودی محدود</option>
              <option value="out_of_stock">ناموجود</option>
            </select>
          </div>
          <div class="flex gap-2 pt-2">
            <button type="button" class="flex-1 py-2 rounded-xl border border-slate-200 font-bold" @click="showAddModal = false">انصراف</button>
            <button type="submit" class="flex-2 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700">افزودن به انبار</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { Store, Plus, X } from "@lucide/vue";
import { apiGet, apiPost, apiPut } from "../services/api";

const inventory = ref<any[]>([]);
const allMedications = ref<any[]>([]);
const pharmacies = ref<any[]>([]);
const selectedPharmacyId = ref<number>(1);
const loading = ref(true);
const showAddModal = ref(false);

const newItem = reactive({
  medId: 0,
  qty: 15,
  price: 350000,
  status: "in_stock",
  notes: "",
});

const currentPharmacy = computed(() => pharmacies.value.find((p) => p.id === selectedPharmacyId.value));

async function fetchInventory() {
  loading.value = true;
  try {
    const data = await apiGet(`/api/inventory?pharmacyId=${selectedPharmacyId.value}`);
    if (data.success) inventory.value = data.inventory;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const [pData, mData] = await Promise.all([apiGet("/api/pharmacies"), apiGet("/api/medications")]);
  if (pData.success && pData.pharmacies.length > 0) {
    pharmacies.value = pData.pharmacies;
    selectedPharmacyId.value = pData.pharmacies[0].id;
    fetchInventory();
  }
  if (mData.success && mData.medications.length > 0) {
    allMedications.value = mData.medications;
    newItem.medId = mData.medications[0].id;
    newItem.price = mData.medications[0].officialPrice;
  }
});

async function handleUpdateStock(invId: number, status: string, quantity: number, price: number) {
  const data = await apiPut(`/api/inventory/${invId}`, {
    stockStatus: status,
    stockQuantity: quantity,
    price,
  });
  if (data.success) fetchInventory();
}

function onMedChange() {
  const selected = allMedications.value.find((m) => m.id === newItem.medId);
  if (selected) newItem.price = selected.officialPrice;
}

async function handleAddItem() {
  const data = await apiPost("/api/inventory", {
    pharmacyId: selectedPharmacyId.value,
    medicationId: newItem.medId,
    stockStatus: newItem.status,
    stockQuantity: newItem.qty,
    price: newItem.price,
    notes: newItem.notes,
  });
  if (data.success) {
    showAddModal.value = false;
    fetchInventory();
  }
}
</script>
