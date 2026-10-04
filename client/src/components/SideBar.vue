<template>
  <!-- Desktop -->
  <aside class="hidden lg:block w-72 h-[calc(100vh-57px)] sticky top-[57px] shrink-0">
    <NavContent />
  </aside>

  <!-- Mobile Drawer -->
  <div v-if="store.sidebarOpen" class="fixed inset-0 z-50 lg:hidden">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" @click="store.sidebarOpen = false" />
    <div class="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl z-10">
      <NavContent />
    </div>
  </div>
</template>

<script setup lang="ts">
import { store } from "../stores/appStore";
import NavContent from "./SideBarNav.vue";
</script>
