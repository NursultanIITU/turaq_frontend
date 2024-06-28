<script setup lang="ts">
import { ref, shallowRef, triggerRef, watch, onMounted } from 'vue';
import {
    YandexMap, YandexMapDefaultSchemeLayer, YandexMapDefaultFeaturesLayer, YandexMapDefaultMarker, getBoundsFromCoords, getLocationFromBounds
} from 'vue-yandex-maps';
import type { SearchResponse } from '@yandex/ymaps3-types/imperative/search';
import type { LngLat, YMap } from '@yandex/ymaps3-types';
import type { YMapDefaultMarker } from '@yandex/ymaps3-types/packages/markers';
import type { BehaviorType } from '@yandex/ymaps3-types';
import { useAdvStore } from '~/stores/advertisement'

const adv_store = useAdvStore()
const { advCreate, search, center, zoom, city, setSearch, dictionaries } = storeToRefs(adv_store);

const selectedSearch = ref<LngLat | null>(null);
const searchResponse = shallowRef<null | SearchResponse>(null);
const map = shallowRef<YMap | null>(null);
const defaultMarker = shallowRef<YMapDefaultMarker | null>(null);

// Аналогично включены по умолчанию в самой Яндекс Карте
const enabledBehaviors = ref<BehaviorType[]>(['click']);

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

watch(() => advCreate.value.name, async (val: string) => {
  if (!val) return;
  // Проверка, что уже координаты
  if (val.split(/[,.]/).length === 4) {
    selectedSearch.value = val.split(',').map((x) => parseFloat(x)) as LngLat;
    return;
  }

  await sleep(300);
  if (val !== advCreate.value.name) return;

  const city_name = dictionaries?.value?.cities.find((c: any) => c.id === advCreate.value.city_id)?.name
  
  searchResponse.value = await ymaps3.search({
    text: 'г. ' + city_name + ', ' + val,
    bounds: map.value?.bounds,
  });

  zoom.value = 17
  center.value = searchResponse.value[0].geometry?.coordinates
  advCreate.value.latitude = searchResponse.value[0].geometry?.coordinates[1]
  advCreate.value.longitude= searchResponse.value[0].geometry?.coordinates[0]
});

watch(() => advCreate.value.city_id, async (val: string) => {
  const city_name = dictionaries?.value?.cities.find((c: any) => c.id === advCreate.value.city_id)?.name
  searchResponse.value = await ymaps3.search({
    text: 'г. ' + city_name + ', ' + advCreate.value.name,
    bounds: map.value?.bounds,
  });

  zoom.value = 16
  center.value = searchResponse.value[0].geometry?.coordinates
  advCreate.value.latitude = searchResponse.value[0].geometry?.coordinates[1]
  advCreate.value.longitude= searchResponse.value[0].geometry?.coordinates[0]
});

onMounted(async () => {
    // await ymaps3.ready;
    setTimeout(async () => {
        const city_name = dictionaries?.value?.cities.find((c: any) => c.id === advCreate.value.city_id)?.name
        searchResponse.value = await ymaps3.search({
            text: 'г. ' + city_name + ', ' + advCreate.value.name,
            bounds: map.value?.bounds,
        });
        zoom.value = 16
        center.value = searchResponse.value[0].geometry?.coordinates
        advCreate.value.latitude = searchResponse.value[0].geometry?.coordinates[1]
        advCreate.value.longitude= searchResponse.value[0].geometry?.coordinates[0]
    }, 1000);
});

</script>

<template>
    <div>
        <v-combobox
            single-line
            class="mb-8 combobox-my" 
            hide-details 
            clearable
            v-model="setSearch"
            :label="$t('search_query')" color="primary" variant="outlined"
            v-model:search="advCreate.name"
            :items="searchResponse ?? []"
            :item-title="'properties.name'"
            :custom-filter="(val) => val.length > 3"
            :hide-no-data="false"
        ></v-combobox>

        <yandex-map
            v-model="map"
            :settings="{
                location: {
                    center: center,
                    zoom: zoom,
                },
                behaviors: enabledBehaviors,
            }"
            :cursor-grab="enabledBehaviors.includes('drag')"
            :width="'100%'"
            :height="'328px'"
            >

            <yandex-map-default-scheme-layer />
            <yandex-map-default-features-layer />
            <yandex-map-default-marker v-if="center && center.length" :settings="{ coordinates: center, title: $t('search-point-result') }" />
        </yandex-map>
    </div>

</template>

<style lang="scss">
    .map-with-fix-pin {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        .map-pin-fixed  {
            position: absolute;
            width: 30px;
            height: 30px;
            background: red;
            z-index: 1000;
            border-radius: 100%;
        }
    }
</style>