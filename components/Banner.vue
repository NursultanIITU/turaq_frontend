<script setup lang="ts">
interface IProps {
  background: string,
  text: string
}

const props = defineProps<IProps>()

</script>

<template>
  <section class="banner d-flex align-center">
    <v-container>
      <p class="text-h5 text-white text-center px-10 font-weight-bold">{{ $t(text) }}</p>
    </v-container>
  </section>
</template>

<style scoped lang="scss">
.banner {
  min-height: 160px;
  background-size: cover;
  // border-radius: 0 0 28px 28px;
  background: #6594F1;
  margin-top: -20px;
}
</style>