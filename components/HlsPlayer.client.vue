<script setup lang="ts">
import Hls from "hls.js";

defineProps<{
    url: string
}>();

const supported = ref<boolean>(Hls.isSupported());
</script>

<template>
    <div v-if="supported">
        <HlsVideo :url="url"/>
    </div>

    <div v-else class="w-full h-full aspect-[16/9] bg-gray-800 flex items-center justify-center rounded-xl">
        <UIcon name="i-heroicons-video-camera-slash" class="text-8xl text-gray-50"/>
    </div>
</template>

<style scoped>

</style>