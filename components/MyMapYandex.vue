<script setup lang="ts">
import {
  computed, onMounted, ref, useAttrs, shallowRef, watch, version,
} from 'vue';
import { useMainStore } from '~/stores/main'
import { useAdvStore } from "~/stores/advertisement";
import VueBottomSheet from "@webzlodimir/vue-bottom-sheet";
import "@webzlodimir/vue-bottom-sheet/dist/style.css";
import {
  YandexMap,
  YandexMapClusterer,
  YandexMapControl,
  YandexMapControlButton,
  YandexMapControls,
  YandexMapDefaultFeaturesLayer,
  YandexMapMarker,
  YandexMapDefaultMarker,
  YandexMapDefaultSchemeLayer,
  YandexMapZoomControl,
  YandexMapFeature,
} from 'vue-yandex-maps';
import type { LngLat, LngLatBounds, YMap } from '@yandex/ymaps3-types';
import type { YMapClusterer } from '@yandex/ymaps3-types/packages/clusterer';
import type { YMapFeatureProps } from '@yandex/ymaps3-types';
import { advPriceTariffType } from "~/utilities/helper";


const attrs = useAttrs()
const main_store = useMainStore()
const { zoom, center, myGeo } = storeToRefs(main_store);
const { status, data } = useAuth()
const adv_store = useAdvStore()
const { fetchSearchAdv } = adv_store
const { advSearch } = storeToRefs(adv_store);


const map = shallowRef<YMap | null>(null);
const lineCoordinates = ref([])
const clusterer = shallowRef<YMapClusterer | null>(null);
const count = ref(500);
const savedCount = ref(500);
const gridSize = ref(6);
const background = ref('red');
const zoom2 = ref(0);
const bounds = ref<LngLatBounds>([[0, 0], [0, 0]]);
const trueBounds = ref<LngLatBounds>([[0, 0], [0, 0]]);
const myBottomSheet = ref(null)
const card = ref(null)


const AuthOrSubscribe = computed(() => {
  switch (status.value) {
    case "unauthenticated":
      return { path: '/login', query: { statusAuth: status.value, subscribe: 'true' } };
    case "authenticated":
      return { path: '/login', query: { statusAuth: status.value, subscribe: 'true' } }
  }
})

const open = (item: any) => {
  card.value = item
  setTimeout(() => {
    myBottomSheet.value.open();
  }, 100);
}

const close = () => {
  myBottomSheet.value.close();
}

watch(
    () => attrs.findedPoint,
    () => {
      if (attrs.findedPoint) {
        center.value = attrs?.findedPoint?.split(' ')
        // console.log(lineCoordinates.value, 'lineCoordinates.value');
        zoom.value = 16
      }
    }
)

watch(count, async (val) => {
  const oldVal = val;
  setTimeout(() => {
    if (oldVal !== count.value) return;
    savedCount.value = val;
  }, 500);
});

onMounted(async () => {
  await fetchSearchAdv()
  if (version.startsWith('2')) return;
  setInterval(async() => {
    if (map.value) {
      zoom2.value = map.value.zoom;
      bounds.value = map.value.bounds;

      const position = await ymaps3.geolocation.getPosition();
      myGeo.value = position?.coords

      if (attrs.findedPoint) {
        center.value = attrs?.findedPoint?.split(' ')
        zoom.value = 16
      }

    }
  }, 1000);
  // await ymaps3.ready;
});
</script>

<template>
  <div class="position-relative">
    <yandex-map
        v-model="map"
        :settings="{
          location: {
            center: center,
            zoom: zoom,
          },
          showScaleInCopyrights: true,
        }"
        width="100%"
        height="600px"
        class="my-yandex-map"
    >
    
      <yandex-map-default-scheme-layer />
      <yandex-map-default-features-layer />

      <yandex-map-controls :settings="{ position: 'right' }">
        <yandex-map-zoom-control />
      </yandex-map-controls>

      <yandex-map-clusterer
        v-model="clusterer"
        :grid-size="2 ** gridSize"
        zoom-on-cluster-click
        @trueBounds="trueBounds = $event"
      >
        <yandex-map-marker
          v-for="(item, index) in advSearch"
          :key="`adv-${index}`"
          :settings="{
            coordinates: [item.longitude, item.latitude],
            onClick: () => open(item),
          }"
        >
          <div class="marker">{{ new Intl.NumberFormat('kk-KZ').format(item?.price) }} ₸ {{ item?.tariff_type?.id && ('/' + $t(advPriceTariffType(item?.tariff_type?.id))) }}</div>
        </yandex-map-marker>
        <template #cluster="{ length }">
          <div class="cluster fade-in">
            {{ length }}
          </div>
        </template>
      </yandex-map-clusterer>

      <yandex-map-default-marker v-if="attrs?.findedPoint" :settings="{ coordinates: attrs?.findedPoint?.split(' '), title: $t('search-point-result') }" />
      <yandex-map-default-marker v-if="myGeo.length" :settings="{ coordinates: myGeo, title: $t('your_location') }" />
    </yandex-map>
    <v-container>
      <div class="map-not-have-card" v-if="advSearch?.length === 0">
        <h3 class="text-body-1 text-none mb-4">
          {{$t('nothing-was-found')}}
        </h3>
        <v-btn color="primary" rounded="lg" variant="outlined" elevation="0" class="text-none d-flex align-center" size="x-large" @click="$router.push(localePath(AuthOrSubscribe))">
          <v-img src="/svgIcon/bell.svg" width="19" height="19" class="mr-1" />
          <span class="text-primary text-body-2">{{$t('subscribe-to-notifications')}}</span>
        </v-btn>
      </div>
    </v-container>
    <vue-bottom-sheet v-if="card" ref="myBottomSheet">
      <CardAdvertisement
        :card="card"
      />
      <v-container>
        <a target="_blank" class="v-btn v-theme--Theme text-primary v-btn--density-default elevation-0 rounded-lg v-btn--size-x-large v-btn--variant-outlined text-none w-100" :href="`https://yandex.ru/maps/?rtext=~${card.latitude},${card.longitude}`">
          <span class="v-btn__overlay"></span>
          <span class="v-btn__underlay"></span>
          <span class="v-btn__content" data-no-activator="">
            <v-img src="/svgIcon/route-line.svg" width="20" height="20" class="mr-2" />
            {{$t('set-a-route-in-map')}}
          </span>
        </a>

         <!-- <v-btn size="x-large" color="primary" variant="outlined" rounded="lg" elevation="0" class="text-none w-100">
            <v-img src="/svgIcon/route-line.svg" width="20" height="20" class="mr-2" />
              {{$t('set-a-route-in-map')}}
          </v-btn> -->
      </v-container>
    </vue-bottom-sheet>
  </div>
</template>

<style lang="scss">
  .my-yandex-map {
  //   position: absolute;
  //   bottom: 0;
  //   height: 100%;
  //   top: 224px;
  @media (min-width: 1024px) {
    height: calc(100vh - 200px)!important;
    position: relative;
  }
  }

  .map-not-have-card {
    position: absolute;
    bottom: 80px;
    background: #FFF;
    width: calc(100% - 32px);
    height: 151px;
    left: 16px;
    padding: 24px 43px 24px 43px;
    gap: 0;
    border-radius: 16px;
    h3 {
      font-size: 16px;
      font-weight: 400;
      line-height: 19.2px;
      text-align: left;
    }
    box-shadow: 0 4px 4px 0 #00000040;
    @media (min-width: 1024px) {
      width: 440px;
      left: auto;
    }
  }

  .bounds {
    user-select: all;
  }

  .marker {
    background: #256AF2;
    border-radius: 8px;
    padding: 11px 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-wrap: nowrap;
    font-size: 12px;
    font-weight: 400;
    line-height: 14.4px;
    text-align: left;
    position: absolute;
    top: -50px;
    left: -65px;
    color: #FFF;
    min-width:130px;
    width: 130px;
    &:after {
      content: '';
      display: flex;
      position: absolute;
      bottom: -5px;
      width: 10px;
      height: 10px;
      transform: rotate(-45deg);
      background: #256AF2;
    }
  }

  .cluster {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    background: #256AF2;
    color: #fff;
    border-radius: 100%;
    cursor: pointer;
    border: 2px solid #1154da;
    outline: 2px solid #256AF2;
  }

  .padded {
    padding: 5px;
  }

  .fade-in {
    animation: fadeIn 0.3s;
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>