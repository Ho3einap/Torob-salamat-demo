<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <HeaderBar />

    <div class="flex-1 flex max-w-[1600px] w-full mx-auto">
      <SideBar />
      <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
        <router-view :key="$route.fullPath + $route.meta.mode" />
      </main>
    </div>

    <!-- Global Modals -->
    <ReserveDrugModal v-if="store.reserveModal.open" @close="closeReserve" />
    <CreateAlertModal v-if="store.alertModal.open" @close="closeAlert" />
    <UserProfileModal v-if="store.profileOpen" @close="closeProfile" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import HeaderBar from "./components/HeaderBar.vue";
import SideBar from "./components/SideBar.vue";
import ReserveDrugModal from "./components/ReserveDrugModal.vue";
import CreateAlertModal from "./components/CreateAlertModal.vue";
import UserProfileModal from "./components/UserProfileModal.vue";
import { store, bootstrapApp, closeReserve, closeAlert, closeProfile } from "./stores/appStore";

onMounted(() => {
  bootstrapApp();
});
</script>
