<script setup lang="ts">
import { useAttrs } from 'vue'

const attrs = useAttrs()
</script>

<template>
    <div>
        <MyMapYandex :findedPoint="attrs?.findedPoint?.pos" />
    </div>
</template>