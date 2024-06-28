<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAdvStore } from '~/stores/advertisement'
import { useMainStore } from '~/stores/main'
import { useApi } from "~/composables/api";

const main_store = useMainStore()
const adv_store = useAdvStore()
const { $api } = useApi()

const { search, center, zoom, city, filters, firstReset, setSearch } = storeToRefs(main_store);
const { fetchDictionaries } = useAdvStore()
const { dictionaries } = storeToRefs(adv_store);
const mountedV = ref(false)
const { locale } = useI18n()

const resetFilterFunc = () => {
    filters.value.object_types = [dictionaries.value.object_types[0]?.id]
    filters.value.deal_types = dictionaries.value.deal_types[0]?.id
    filters.value.tariff_types = dictionaries.value.tariff_types[0]?.id
    filters.value.parking_space_sizes = dictionaries.value.parking_space_sizes[0]?.id
    city.value = Number(localStorage.getItem('city')) || dictionaries.value.cities[0]?.id || 0
    search.value = ''
    filters.value.from_price = null
    filters.value.to_price = null
    filters.value.from_size = null
    filters.value.to_size = null
    filters.value.parking_types = dictionaries.value.parking_types[0]?.id
    filters.value.characteristics = []
    firstReset.value = true
    search.value = ''
    setSearch.value = null
}

onMounted(async () => {
  try {
    await fetchDictionaries()
  } catch (error) {
    
  }
  if (!firstReset.value && dictionaries.value && dictionaries.value && dictionaries.value.object_types) {
    resetFilterFunc()
  }
  mountedV.value = true
});

watch(
  () => locale.value,
  async () => {
    // mountedV.value = false
    await fetchDictionaries()
    if (!firstReset.value && dictionaries.value && dictionaries.value && dictionaries.value.object_types) {
      resetFilterFunc()
    }
    mountedV.value = true
  },
);

</script>

<template>
  <v-app v-if="mountedV">
    <Header app />
    <slot />
    <Footer app />
  </v-app>
</template>


<style lang="scss">

</style>