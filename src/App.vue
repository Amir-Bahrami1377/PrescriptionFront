<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const auth = useAuthStore()

function handleUnauthorized() {
  auth.logout()
  router.push({ name: 'login' })
}

onMounted(() => window.addEventListener('auth:unauthorized', handleUnauthorized))
onUnmounted(() => window.removeEventListener('auth:unauthorized', handleUnauthorized))
</script>

<template>
  <router-view />
</template>
