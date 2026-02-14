<template>
  <div id="app" class="min-h-screen theme-page flex flex-col">
    <Navbar />
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer />
    <Loading :loading="appStore.loading" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from './stores/app'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import Loading from './components/Loading.vue'

const appStore = useAppStore()

onMounted(() => {
  appStore.loadConfig()
})
</script>
