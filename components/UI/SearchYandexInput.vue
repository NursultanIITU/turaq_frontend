<script setup lang="ts">
import {
  ref,
  shallowRef,
  watch,
  withDefaults,
  onMounted,
  defineProps,
} from "vue";
import {
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultMarker,
  getBoundsFromCoords,
  getLocationFromBounds,
} from "vue-yandex-maps";
import type { SearchResponse } from "@yandex/ymaps3-types/imperative/search";
import type { LngLat, YMap } from "@yandex/ymaps3-types";
import { useMainStore } from "~/stores/main";
import { useAdvStore } from "~/stores/advertisement";

const main_store = useMainStore();
const { fetchSearchAdv, dictionaries } = useAdvStore();
const { search, center, zoom, city, filters, setSearch } =
  storeToRefs(main_store);

const selectedSearch = ref<LngLat | null>(null);

const searchResponse = shallowRef<null | SearchResponse>(null);
const map = shallowRef<YMap | null>(null);

interface IProps {
  SearchFilters: boolean;
}
const props = withDefaults(defineProps<IProps>(), {
  SearchFilters: false,
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const setMyAddress = async () => {
  if (map.value) {
    const { coords } = await ymaps3.geolocation.getPosition();
    const position = await ymaps3.search({
      text: coords,
    });
    console.log(position, "position");

    setSearch.value = position[0];
    search.value = position[0]?.properties?.name;
    const city_id = dictionaries?.cities.find(
      (c: any) => c.name === position[0]?.properties?.description
    )?.id;
    if (city_id) {
      city.value = city_id;
    }
  }
};

watch(search, async (val: string) => {
  //   if (!val) return;
  // Проверка, что уже координаты
  if (val.split(/[,.]/).length === 4) {
    selectedSearch.value = val.split(",").map((x) => parseFloat(x)) as LngLat;
    return;
  }

  await sleep(1000);
  if (val !== search.value) return;

  const city_name = dictionaries?.cities.find(
    (c: any) => c.id === city.value
  )?.name;
  searchResponse.value = await ymaps3.search({
    text: "г. " + city_name + ", " + val,
    bounds: map.value?.bounds,
  });

  zoom.value = 16;
  center.value = searchResponse.value[0].geometry?.coordinates;

  if (props.SearchFilters) {
    await fetchSearchAdv();
  }
});

watch(city, async (val: string) => {
  const city_name = dictionaries?.cities.find(
    (c: any) => c.id === city.value
  )?.name;
  searchResponse.value = await ymaps3.search({
    text: "г. " + city_name + ", " + search.value,
    bounds: map.value?.bounds,
  });

  zoom.value = 12;
  center.value = searchResponse.value[0].geometry?.coordinates;
});

onMounted(async () => {
  // await ymaps3.ready;
  setTimeout(async () => {
    const city_name = dictionaries?.cities.find(
      (c: any) => c.id === city.value
    )?.name;
    searchResponse.value = await ymaps3.search({
      text: "г. " + city_name + ", " + search.value,
      bounds: map.value?.bounds,
    });
    zoom.value = 12;
    center.value = searchResponse.value[0].geometry?.coordinates;
  }, 1000);
});
</script>

<template>
  <div>
    <v-combobox
      single-line
      class="mb-4 combobox-my"
      hide-details
      clearable
      v-model="setSearch"
      :label="$t('search_query')"
      color="primary"
      variant="outlined"
      v-model:search="search"
      :items="searchResponse ?? []"
      :item-title="'properties.name'"
      :custom-filter="(val) => val.length > 3"
      :hide-no-data="false"
    >
      <template #prepend-inner>
        <div
          class="mb-1 mr-3 ml-1 text-body-2 text-gray d-flex cursor-pointer"
          @click="setMyAddress()"
        >
          <v-img
            src="/svgIcon/my-geo.png"
            height="20"
            width="20"
            :title="$t('set_my_geo')"
          ></v-img>
        </div>
      </template>
    </v-combobox>

    <yandex-map
      v-model="map"
      :settings="{
        location: {
          center: [10, 10],
          zoom: 5,
        },
      }"
      :width="'0px'"
      :height="'0px'"
    >
    </yandex-map>
  </div>
</template>

<style lang="scss">
#MainFilters {
  .v-select {
    display: flex;
    .v-field__input {
      padding: 4px 4px 4px 0;
    }
    .v-select__selection-text {
      font-size: 20px;
      font-weight: 400;
      line-height: 28px;
      text-align: left;
      color: #000000;
    }
  }
  .v-field--variant-solo {
    box-shadow: none;
    background: transparent;
  }
  .v-field__input {
    --v-input-control-height: 32px;
    min-height: 32px;
  }
  .filter-radio {
    z-index: 1;
    .v-selection-control__wrapper {
      visibility: hidden;
      position: absolute;
    }
    .v-label {
      padding: 14px;
      font-size: 16px;
      font-weight: 400;
      line-height: 20px;
      text-align: left;
      color: #000000;
      gap: 10px;
      border-radius: 0;
      border: 1px solid #e4e4e4;
      opacity: 1;
      margin-left: -1px;
      transition: 0.2s ease;
    }
    &:first-child {
      .v-label {
        margin-left: 0;
        border-radius: 8px 0 0 8px;
      }
    }
    &:last-child {
      .v-label {
        border-radius: 0 8px 8px 0;
      }
    }
    &.v-selection-control--dirty {
      z-index: 2;
      .v-label {
        border-color: #797979;
        background-color: #f4f8ff;
      }
    }
  }
  .filter-radio-type {
    .v-selection-control__wrapper {
      visibility: hidden;
      position: absolute;
    }
    .v-label {
      opacity: 1;
    }
    &-group {
      .v-selection-control-group {
        display: flex;
        gap: 13px;
      }
    }
    &-item {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      height: 110px;
      width: 110px;
      border-radius: 16px;
      background: #f8f9fa;
      padding: 14px;
      font-size: 14px;
      font-weight: 600;
      line-height: 16.8px;
      text-align: left;
      color: #121212;
      overflow: hidden;
      position: relative;
      .v-img {
        position: absolute;
        opacity: 0.5;
      }
    }
  }
  .v-selection-control--dirty {
    .filter-radio-type-item {
      background: radial-gradient(
        123.18% 123.18% at 55% 36.82%,
        #ebf4ff 0%,
        #9ebeff 100%
      );
      .v-img {
        opacity: 1;
      }
    }
  }

  .combobox-my {
    .v-input__control,
    input {
      height: 56px;
    }
    .v-field__input {
      --v-input-control-height: 56px;
      min-height: 56px;
    }
  }
}
</style>
