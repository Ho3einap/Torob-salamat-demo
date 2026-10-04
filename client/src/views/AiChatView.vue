<template>
  <div class="flex flex-col h-full max-w-5xl mx-auto">
    <!-- Banner -->
    <div class="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white p-4 sm:p-5 rounded-3xl shadow-lg shadow-rose-600/15 mb-4 shrink-0">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Sparkles class="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base sm:text-lg font-black tracking-tight">هوش مصنوعی ترب سلامت</h2>
              <span class="text-[10px] bg-white/20 font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">زبان محاوره‌ای و فوری</span>
            </div>
            <p class="text-xs text-rose-100 mt-0.5">
              نام هر داروی کمیاب، برند یا علائم نسخه را به زبان خودتان بنویسید؛ ما کیفیت سازندگان و نزدیک‌ترین داروخانه را رده‌بندی می‌کنیم.
            </p>
          </div>
        </div>

        <div class="text-left text-xs bg-black/15 px-3 py-1.5 rounded-xl border border-white/10">
          <span class="text-rose-200 text-[10px] block">موقعیت انتخابی شما:</span>
          <strong class="font-bold">{{ store.city }}</strong>
        </div>
      </div>
    </div>

    <!-- Sample prompts -->
    <div class="mb-3 shrink-0">
      <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-semibold">
        <Flame class="w-3.5 h-3.5 text-rose-500" />
        <span>پرسش‌های متداول و داروهای کمیاب پرجستجو:</span>
      </div>
      <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          v-for="(prompt, idx) in samplePrompts"
          :key="idx"
          class="text-right text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 transition-all shrink-0 shadow-2xs font-medium"
          @click="handleSendMessage(prompt)"
        >
          {{ prompt.slice(0, 48) }}...
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div ref="messagesBox" class="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-y-auto p-4 sm:p-6 space-y-6 mb-4 min-h-[380px]">
      <div v-if="store.chatMessages.length === 0" class="text-center py-16 space-y-4 max-w-md mx-auto">
        <div class="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <Sparkles class="w-8 h-8" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-800">گفتگو با هوش مصنوعی ترب سلامت را شروع کنید</h3>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            مثلا بنویسید: «سلام برای پدرم قرص متفورمین ۵۰۰ هگزال آلمانی یا مشابهش دور و بر ونک داری؟»
          </p>
        </div>
      </div>

      <div v-for="msg in store.chatMessages" :key="msg.id" class="flex flex-col" :class="msg.sender === 'user' ? 'items-start' : 'items-end'">
        <div
          class="max-w-[90%] sm:max-w-[85%] rounded-3xl p-4 sm:p-5 shadow-xs"
          :class="msg.sender === 'user' ? 'bg-rose-600 text-white rounded-tr-xs' : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-xs'"
        >
          <div class="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-black/5">
            <div class="flex items-center gap-1.5 font-bold text-xs">
              <span v-if="msg.sender === 'user'">شما</span>
              <span v-else class="flex items-center gap-1 text-rose-600 font-black">
                <Sparkles class="w-3.5 h-3.5 text-amber-500" />
                <span>ترب سلامت (هوش مصنوعی)</span>
              </span>
            </div>
            <span class="text-[10px] font-mono" :class="msg.sender === 'user' ? 'text-rose-200' : 'text-slate-400'">{{ msg.timestamp }}</span>
          </div>

          <div class="text-xs leading-relaxed whitespace-pre-line">{{ msg.text }}</div>

          <div v-if="msg.structuredData" class="mt-5 space-y-4 text-right">
            <!-- Manufacturer Ranking Widget -->
            <div v-if="msg.structuredData.manufacturerRanking?.length" class="rounded-2xl bg-white p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-1">
                <div class="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Award class="w-4 h-4 text-amber-500" />
                  <span>رده‌بندی شرکت‌های سازنده کالا (از بهترین تا گزینه‌های جایگزین):</span>
                </div>
                <span class="text-[10px] font-semibold text-slate-400">براساس خلوص، فرمولاسیون و عوارض</span>
              </div>

              <div class="space-y-2">
                <div
                  v-for="(item, idx) in msg.structuredData.manufacturerRanking"
                  :key="idx"
                  class="p-3 rounded-xl border text-xs transition-all"
                  :class="item.isRecommended ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300/50' : 'bg-slate-50 border-slate-200'"
                >
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <div class="flex items-center gap-2">
                      <span
                        class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        :class="idx === 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'"
                      >
                        {{ idx + 1 }}
                      </span>
                      <span class="font-bold text-slate-900">{{ item.brandName }}</span>
                      <span v-if="item.isRecommended" class="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-md">
                        ⭐ پیشنهاد اول ترب
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-[11px] font-bold text-slate-500 font-mono">گرید {{ item.tier }} ({{ item.score }}/۱۰۰)</span>
                      <span class="font-bold text-emerald-700 font-mono">{{ item.price.toLocaleString("fa-IR") }} تومان</span>
                    </div>
                  </div>
                  <p class="text-[11px] text-slate-600 mt-1.5 pr-7 leading-relaxed">
                    🏢 <strong>شرکت سازنده:</strong> {{ item.manufacturerName }} • {{ item.pros }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Destination Pharmacy Ranking Widget -->
            <div v-if="msg.structuredData.rankedPharmacies?.length" class="rounded-2xl bg-white p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-1">
                <div class="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Building2 class="w-4 h-4 text-rose-600" />
                  <span>رده‌بندی داروخانه‌های مقصد (نزدیک‌ترین و دارای موجودی زنده):</span>
                </div>
                <span class="text-[10px] font-semibold text-rose-600">مرتب‌شده براساس فاصله و موجودی</span>
              </div>

              <div class="space-y-2.5">
                <div
                  v-for="(pharmacy, idx) in msg.structuredData.rankedPharmacies"
                  :key="pharmacy.pharmacyId"
                  class="p-3.5 rounded-2xl border text-xs transition-all"
                  :class="idx === 0 ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-200' : 'bg-slate-50 border-slate-200'"
                >
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span
                        class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        :class="idx === 0 ? 'bg-rose-600 text-white' : 'bg-slate-300 text-slate-800'"
                      >
                        {{ idx + 1 }}
                      </span>
                      <h4 class="font-bold text-slate-900">{{ pharmacy.pharmacyName }}</h4>
                      <span v-if="pharmacy.is24h" class="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded-md">🌙 شبانه‌روزی</span>
                    </div>
                    <span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-lg font-mono text-[11px]">
                      امتیاز مقصد: {{ pharmacy.destinationScore }}/۱۰۰
                    </span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                    <div class="flex items-center gap-1.5">
                      <Navigation class="w-3.5 h-3.5 text-rose-500" />
                      <span>
                        فاصله: <strong>{{ pharmacy.distanceKm.toLocaleString("fa-IR") }} کیلومتر</strong> (حدود
                        {{ pharmacy.travelMinutes.toLocaleString("fa-IR") }} دقیقه)
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <Phone class="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        شماره تماس:
                        <a :href="`tel:${pharmacy.phone}`" class="font-bold text-rose-600 font-mono hover:underline">{{ pharmacy.phone }}</a>
                      </span>
                    </div>
                  </div>

                  <div class="flex items-start gap-1.5 mt-2 text-[11px] text-slate-700 bg-white p-2 rounded-xl border border-slate-200/80">
                    <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span class="font-medium">{{ pharmacy.address }}</span>
                  </div>

                  <div class="flex flex-wrap items-center justify-between gap-2 mt-2 text-[11px]">
                    <span class="text-slate-500">💡 <em>{{ pharmacy.rankReason }}</em></span>
                    <span
                      class="font-bold px-2 py-0.5 rounded-md"
                      :class="pharmacy.stockStatus === 'in_stock' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                    >
                      {{ pharmacy.stockStatus === "in_stock" ? `موجودی قطعی: ${pharmacy.stockQuantity} عدد` : "موجودی محدود" }}
                    </span>
                  </div>

                  <div class="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-200/60">
                    <button
                      class="flex-1 py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1"
                      @click="reserveAtPharmacy(pharmacy)"
                    >
                      <CalendarCheck class="w-3.5 h-3.5" />
                      <span>رزرو فوری ۳۰ دقیقه‌ای</span>
                    </button>
                    <a
                      :href="`tel:${pharmacy.phone}`"
                      class="py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors flex items-center gap-1"
                    >
                      <Phone class="w-3.5 h-3.5 text-emerald-600" />
                      <span>تماس تلفنی</span>
                    </a>
                    <a
                      href="https://nshn.ir/?lat=35.7575&lng=51.4099"
                      target="_blank"
                      rel="noreferrer"
                      class="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <Navigation class="w-3.5 h-3.5 text-slate-500" />
                      <span>نشان و بلد</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isTyping" class="flex items-start gap-2">
        <div class="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span>هوش مصنوعی ترب سلامت در حال رده‌بندی کیفی سازندگان و جستجوی موجودی زنده داروخانه‌ها...</span>
        </div>
      </div>
    </div>

    <!-- Input Bar -->
    <div class="shrink-0 bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-sm">
      <form class="flex items-center gap-2" @submit.prevent="handleSendMessage()">
        <button
          type="button"
          class="p-3 rounded-2xl transition-all"
          :class="isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          title="جستجوی صوتی (شبیه‌ساز ضبط صدای بیمار)"
          @click="toggleVoiceInput"
        >
          <MicOff v-if="isListening" class="w-5 h-5" />
          <Mic v-else class="w-5 h-5" />
        </button>

        <input
          v-model="inputText"
          type="text"
          :placeholder="isListening ? 'در حال گوش دادن به صدای شما...' : 'نام داروی کمیاب یا نسخه خود را به زبان محاوره‌ای اینجا بنویسید...'"
          class="flex-1 text-xs sm:text-sm px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden transition-all"
        />

        <button
          type="submit"
          :disabled="!inputText.trim() || isTyping"
          class="p-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white transition-all disabled:opacity-40 shadow-md shadow-rose-600/20"
        >
          <Send class="w-5 h-5 rotate-180" />
        </button>
      </form>

      <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-2">
        <span>هوش مصنوعی محاوره‌ای ترب سلامت • بک‌اند NestJS • موتور رده‌بندی هوشمند داروخانه‌ها</span>
        <span class="hidden sm:inline">پاسخگویی آنی با رده‌بندی از بهترین کالا تا بدترین</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Building2,
  Phone,
  MapPin,
  CalendarCheck,
  Award,
  Navigation,
  Flame,
} from "@lucide/vue";
import { store, openReserve } from "../stores/appStore";
import { apiGet, apiPost } from "../services/api";

const inputText = ref("");
const isTyping = ref(false);
const isListening = ref(false);
const messagesBox = ref<HTMLElement | null>(null);

const samplePrompts = [
  "سلام، انسولین لانتوس سولوستار فرانسوی نزدیک ونک میخوام فوری، کجا موجوده و قیمتش چنده؟",
  "داروی پیوند کلیه سل‌سپت خارجی بهتره یا سوپریمون عبیدی؟ کدوم داروخونه شبانه‌روزی الان داره؟",
  "قرص ریتالین نووارتیس سوئیس با نسخه روانپزشک تو تهران یا کرج کجاست؟",
  "کپسول مسالازین ۵۰۰ پنتازا برای کولیت، ایرانی یا خارجی کدوم باکیفیت‌تره و نزدیک سعادت‌آباد کی داره؟",
  "اسپری سروفلو ۲۵۰ برای تنگی نفس مادرم تجریش فوری لازم داریم",
];

function scrollToBottom() {
  nextTick(() => {
    messagesBox.value?.scrollTo({ top: messagesBox.value.scrollHeight, behavior: "smooth" });
  });
}

onMounted(async () => {
  if (store.chatMessages.length === 0 && !store.chatLoaded) {
    try {
      const json = await apiGet("/api/ai/chat");
      if (json.success && json.conversations?.length > 0) {
        const firstConv = json.conversations[0];
        store.conversationId = firstConv.id;
        const d = await apiGet(`/api/ai/chat?conversationId=${firstConv.id}`);
        if (d.success && d.messages?.length > 0) {
          store.chatMessages = d.messages.map((m: any) => ({
            id: String(m.id),
            sender: m.sender,
            text: m.message,
            structuredData: m.structuredData,
            timestamp: new Date(m.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
          }));
        }
      }
      store.chatLoaded = true;
    } catch (err) {
      console.error(err);
    }
  }
  scrollToBottom();
});

watch(
  () => store.chatMessages.length,
  () => scrollToBottom(),
);

async function handleSendMessage(textToSend?: string) {
  const text = textToSend || inputText.value;
  if (!text.trim()) return;

  store.chatMessages.push({
    id: String(Date.now()),
    sender: "user",
    text,
    timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
  });

  inputText.value = "";
  isTyping.value = true;

  try {
    const data = await apiPost("/api/ai/chat", {
      message: text,
      conversationId: store.conversationId,
      userId: store.currentUser?.id,
      city: store.city,
    });

    if (data.success && data.reply) {
      if (!store.conversationId && data.conversationId) {
        store.conversationId = data.conversationId;
      }
      store.chatMessages.push({
        id: String(data.reply.id || Date.now() + 1),
        sender: "assistant",
        text: data.reply.message,
        structuredData: data.structuredData || data.reply.structuredData,
        timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      });
    }
  } catch {
    store.chatMessages.push({
      id: String(Date.now() + 1),
      sender: "assistant",
      text: "متاسفانه در حال حاضر ارتباط با سامانه هوشمند دارویی برقرار نشد. لطفاً مجدداً امتحان فرمایید یا با سامانه ۱۹۰ تماس بگیرید.",
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
    });
  } finally {
    isTyping.value = false;
  }
}

function toggleVoiceInput() {
  if (!isListening.value) {
    isListening.value = true;
    setTimeout(() => {
      isListening.value = false;
      inputText.value = "سلام، انسولین لانتوس سولوستار فرانسوی نزدیک ونک فوری لازم دارم";
    }, 2500);
  } else {
    isListening.value = false;
  }
}

function reserveAtPharmacy(pharmacy: any) {
  openReserve({
    id: pharmacy.pharmacyId,
    name: pharmacy.pharmacyName,
    licenseNumber: "IR-190",
    city: store.city,
    neighborhood: "",
    address: pharmacy.address,
    phone: pharmacy.phone,
    latitude: "35.75",
    longitude: "51.41",
    is24h: pharmacy.is24h,
    isVerified: true,
    rating: String(pharmacy.rating),
    deliveryAvailable: true,
  });
}
</script>
