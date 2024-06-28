<script setup lang="ts">
import { ref, onMounted, shallowRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import VueGallery from "vue-gallery";
import {
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultMarker,
  getBoundsFromCoords,
  getLocationFromBounds,
} from "vue-yandex-maps";
import { useAdvStore } from "~/stores/advertisement";
import type { YMapDefaultMarker } from "@yandex/ymaps3-types/packages/markers";
import type { BehaviorType } from "@yandex/ymaps3-types";
import { useApi } from "~/composables/api";
import { advPriceTariffType, statusChip } from "~/utilities/helper";

const { $api } = useApi();
const route = useRoute();
const router = useRouter();
const adv_store = useAdvStore();
const { city, center, zoom, filters, search, dictionaries, adv, loading } =
  storeToRefs(adv_store);
const { fetchMyAdvBySlug, fetchAdvBySlug } = adv_store;

const map = shallowRef<YMap | null>(null);
const defaultMarker = shallowRef<YMapDefaultMarker | null>(null);
const findedPoint = ref({});
const index = ref(null);
const selectImage = ref(0);
const drawer = ref<boolean>(true);
const enabledBehaviors = ref<BehaviorType[]>(["click"]);

onMounted(async () => {
  try {
    await fetchAdvBySlug(route.params.id);
  } catch (error) {
    console.log("error");
  }
});
</script>

<template>
  <v-main class="advertisement__page-id">
    <v-navigation-drawer
      v-model="drawer"
      class="w-100 h-100 filter__drawer"
      location="top"
      style="top: 0; z-index: 2000"
      touchless
    >
      <v-toolbar elevation="5" color="white">
        <v-container class="d-flex align-center justify-space-between">
          <div class="pa-3 ml-4 mr-5" @click="$router.go(-1)">
            <v-img
              src="/svgIcon/arrow-left.svg"
              cover
              max-width="7"
              width="7"
              height="12"
            />
          </div>
          <h3 class="text-body-1"></h3>
          <h3 class="text-body-1 text-primary"></h3>
        </v-container>
      </v-toolbar>

      <v-container v-if="loading">
        <v-skeleton-loader
          type="image, text, text, image, article, article"
        ></v-skeleton-loader>
      </v-container>
      <v-container v-else>
        <div
          v-if="adv?.my && adv?.status"
          class="d-flex align-center justify-space-between mb-6 mt-2"
        >
          <v-chip
            :color="statusChip(adv.status).color"
            class="rounded"
            elevation="0"
            :variant="statusChip(adv.status).variant"
          >
            <v-img
              :src="statusChip(adv.status).icon"
              width="18"
              height="18"
              class="mr-2"
            />
            <span
              :class="`status-card-${adv.status}`"
              class="text-black text-caption"
              >{{ $t(statusChip(adv.status).text) }}</span
            >
          </v-chip>
          <div
            v-if="adv.status === 'published'"
            class="d-flex align-center justify-space-between"
          >
            <v-btn width="28" min-width="28" class="mr-3" variant="text"
              ><v-img src="/svgIcon/editAdv.svg" width="23" height="23"
            /></v-btn>
            <v-btn width="28" min-width="28" variant="text"
              ><v-img src="/svgIcon/removeAdv.svg" width="24" height="24"
            /></v-btn>
          </div>
        </div>
        <vue-gallery
          :images="adv?.media?.map((el) => el.media_url)"
          :index="index"
          @close="index = null"
        />
        <div class="my-gallery mt-2">
          <v-carousel
            height="212"
            v-model="selectImage"
            hide-delimiters
            :show-arrows="false"
          >
            <v-carousel-item
              v-for="(image, imageIndex) in adv?.media?.map(
                (el) => el.media_url
              )"
              :key="imageIndex"
              @click="index = imageIndex"
              :src="image ? image : '/no_image.jpeg'"
              cover
            >
              <template v-slot:error>
                <v-img
                  height="100%"
                  width="100%"
                  contain
                  src="/no_image.jpeg"
                  class="error-image"
                ></v-img>
              </template>
            </v-carousel-item>
          </v-carousel>
          <div class="my-gallery-counter">
            {{ selectImage + 1 }}/{{ adv?.media?.length }}
          </div>
        </div>

        <div class="mt-5 d-flex align-center justify-space-between">
          <span class="text-body-1"
            >{{ new Intl.NumberFormat("kk-KZ").format(adv?.price) }} ₸
            {{
              adv?.tariff_type?.id &&
              "/" + $t(advPriceTariffType(adv?.tariff_type?.id))
            }}</span
          >
          <span class="text-body-1 text-primary"
            >{{ adv?.object_type?.title }}
            {{
              adv?.deal_type?.id === 1
                ? ` • ${adv?.tariff_type?.title}`
                : `• ${adv?.deal_type?.title}`
            }}</span
          >
        </div>

        <yandex-map
          class="yandex-id-map mt-5"
          v-model="map"
          :settings="{
            location: {
              center:
                adv?.latitude && adv?.longitude
                  ? [adv?.longitude, adv?.latitude]
                  : center,
              zoom: 16,
            },
          }"
          :width="'100%'"
          :height="'118px'"
        >
          <yandex-map-default-scheme-layer />
          <yandex-map-default-features-layer />
          <yandex-map-default-marker
            v-if="adv?.latitude && adv?.longitude"
            :settings="{
              coordinates: [adv?.longitude, adv?.latitude],
              title: adv?.name,
            }"
          />
        </yandex-map>

        <div class="d-flex flex-column mt-5">
          <span class="text-subtitle-2">{{ adv?.name }}</span>
          <span v-if="adv?.city?.name" class="text-subtitle-2 text-gray">{{
            adv?.city?.name
          }}</span>
        </div>

        <!-- <v-chip-group v-if="adv?.characteristics" class="py-0 mt-6">
                <v-chip
                    variant="elevated"
                    v-for="(widget, index) in adv?.characteristics"
                    :key="`widget-card-${index}`"
                    class="rounded bg-chip-card card-chip"
                    elevation="0"
                >
                    <v-img
                        :src="widget.id === 2 ? '/svgIcon/lock.svg' : '/svgIcon/home.svg'"
                        class="mr-2"
                        width="16"
                        height="16"
                    />
                    <span class="text-caption">{{widget.title}}</span>
                </v-chip>
            </v-chip-group> -->

        <div class="mt-8">
          <h3 class="text-body-1">{{ $t("more-detailed") }}</h3>
          <v-row class="mt-5">
            <v-col class="py-0"
              ><span class="text-gray text-body-2">{{
                $t("deal_type")
              }}</span></v-col
            >
            <v-col class="py-0"
              ><span class="text-body-2">{{
                adv?.deal_type?.title
              }}</span></v-col
            >
          </v-row>
          <v-row class="mt-3">
            <v-col class="py-0"
              ><span class="text-gray text-body-2">{{
                $t("type-parking")
              }}</span></v-col
            >
            <v-col class="py-0"
              ><span class="text-body-2">{{
                adv?.object_type?.title
              }}</span></v-col
            >
          </v-row>
          <v-row class="mt-3">
            <v-col class="py-0"
              ><span class="text-gray text-body-2">{{
                $t("size-parkomest")
              }}</span></v-col
            >
            <v-col class="py-0"
              ><span class="text-body-2">{{
                adv?.parking_space_size?.title
              }}</span></v-col
            >
          </v-row>
          <v-row class="mt-3">
            <v-col class="py-0"
              ><span class="text-gray text-body-2">{{
                $t("size-for-auto")
              }}</span></v-col
            >
            <v-col class="py-0"
              ><span class="text-body-2">{{
                adv?.parking_space_number?.title
              }}</span></v-col
            >
          </v-row>
          <v-row class="mt-3">
            <v-col class="py-0"
              ><span class="text-gray text-body-2">{{
                $t("size-object")
              }}</span></v-col
            >
            <v-col class="py-0"
              ><span class="text-body-2"
                >{{ Number(adv?.area) ? Number(adv?.area).toFixed(0) : ""
                }}{{ $t("area_unit") }}</span
              ></v-col
            >
          </v-row>
          <v-row
            v-if="adv?.characteristics && adv?.characteristics.length"
            class="mt-3"
          >
            <v-col class="py-0"
              ><span class="text-gray text-body-2">{{
                $t("location")
              }}</span></v-col
            >
            <v-col class="py-0"
              ><span class="text-body-2">{{
                adv?.characteristics?.map((el) => el.title)?.join(", ")
              }}</span></v-col
            >
          </v-row>
        </div>

        <div v-if="adv?.description" class="mt-8">
          <h3 class="text-body-1">{{ $t("description") }}</h3>
          <p class="text-body-2 mt-4" v-html="adv?.description"></p>
        </div>

        <div class="mt-8">
          <h3 class="text-body-1">{{ $t("adv_host") }}</h3>
          <p class="text-body-2 mt-4">{{ $t("adv_host_name") }}</p>
        </div>

        <v-btn
          :href="`tel:+${adv?.author?.phone}`"
          v-if="!adv?.my"
          rounded="lg"
          size="large"
          elevation="0"
          class="text-none w-100 my-10"
          color="green"
        >
          <span>{{ $t("action_to_call") }}</span>
        </v-btn>
        <v-btn
          @click="archiveAdv()"
          v-else-if="adv?.status !== 'archive' && adv.status === 'published'"
          rounded="lg"
          variant="outlined"
          size="large"
          elevation="0"
          class="text-none w-100 my-10"
          color="primary"
        >
          <span>{{ $t("archiveAdv") }}</span>
        </v-btn>
        <v-btn
          @click="unArchiveAdv()"
          v-else-if="adv?.status === 'archive'"
          rounded="lg"
          variant="outlined"
          size="large"
          elevation="0"
          class="text-none w-100 my-10"
          color="primary"
        >
          <span>{{ $t("unArchiveAdv") }}</span>
        </v-btn>
      </v-container>
    </v-navigation-drawer>
  </v-main>
</template>

<style lang="scss">
.advertisement__page-id {
  .yandex-id-map {
    border-radius: 8px;
    overflow: hidden;
  }
  .my-gallery {
    display: flex;
    align-items: center;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    &-counter {
      position: absolute;
      bottom: 8px;
      right: 8px;
      font-size: 12px;
      font-weight: 400;
      line-height: 14.4px;
      text-align: left;
      height: 19px;
      padding: 2px 6px 2px 6px;
      border-radius: 8px;
      color: #fff;
      background: #393939;
    }
  }
}
</style>
