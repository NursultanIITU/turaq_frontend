<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useApi } from "~/composables/api";
import { useMainStore } from '~/stores/main'
import { useAdvStore } from '~/stores/advertisement'

const route = useRoute()
const { $apiOther } = useApi()
const { fetchSearchAdv, dictionaries } = useAdvStore()
const main_store = useMainStore()
const { search, city, distance } = storeToRefs(main_store);


const findedPoint = ref({})
const drawer = ref<boolean>(false)
const resetFilters = ref<boolean>(false)
const checkboxValue = ref<boolean>(true)

const searchCenter = async () => {
    const data: any = await $apiOther(`https://geocode-maps.yandex.ru/1.x/?apikey=3e257536-e664-4050-ad1d-44b011d2781c&geocode=${'г. ' + dictionaries?.cities.find((c: any) => c.id === city.value)?.name + ', '}${search.value}&format=json`, 'GET');
    // console.log(data?.response?.GeoObjectCollection?.featureMember[0]?.GeoObject?.Point, 'data');s
    if (data?.response?.GeoObjectCollection?.featureMember[0]?.GeoObject?.Point) {
        findedPoint.value = data?.response?.GeoObjectCollection?.featureMember[0]?.GeoObject?.Point
    }
}

const searchByDistance = async () => {
    await fetchSearchAdv()
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

watch(search, async (val: string) => {
  if (!val) return
  if (val.length < 3) return
  await sleep(500);

  await searchCenter()
});

onMounted(() => {
  if (search.value) {
    searchCenter()
  }
  if (route.query.showfilter && route.query.showfilter === 'true') {
    drawer.value = true
  }
});
</script>

<template>
    <v-main class="advertisement__page pb-0">
        <div v-if="!route.params.id" class="bg-white">
          <v-container>
            <v-row>
              <v-col lg="7" cols="12" class="pb-0">
                <UISearchYandexInput :SearchFilters="true" />
              </v-col>
              <v-col class="pt-0 pb-0 pt-md-3" lg="5" cols="12">
                <div class="tab-buttons mb-4">
                  <v-btn @click="$router.replace(localePath('/advertisement/map'))" v-if="route.path === localePath('/advertisement/list')" class="tab-button text-none">
                      <template #prepend>
                          <v-img src="/svgIcon/map-black.svg" height="24" width="24"></v-img>
                      </template>
                      {{$t('on-map')}}
                  </v-btn>
                  <v-btn @click="$router.replace(localePath('/advertisement/list'))" v-if="route.path === localePath('/advertisement/map')" class="tab-button text-none">
                      <template #prepend>
                          <v-img src="/svgIcon/list.svg" height="24" width="24"></v-img>
                      </template>
                      {{$t('list')}}
                  </v-btn>
                  <v-btn @click="drawer = true" class="tab-button text-none">
                      <template #prepend>
                          <v-img src="/svgIcon/filter.svg" height="24" width="24"></v-img>
                      </template>
                      {{$t('filter')}}
                  </v-btn>
                </div>
              </v-col>
            </v-row>
            <v-row v-if="search" class="pb-3">
              <v-col md="2" cols="12" class="d-flex ga-2 align-center justify-space-between justify-md-start py-0">
                <span>{{$t('distance')}}</span>
                <span>{{ distance }} {{$t('distance-unit')}}</span>
              </v-col>
              <v-col md="4" cols="12" class="mt-md-0 mt-2 py-0">
                <v-slider
                  color="primary"
                  track-color="#E4E4E4"
                  thumb-color="#C6D9FE"
                  :thumb-size="22"
                  v-model="distance"
                  :max="30"
                  :min="1"
                  class="align-center ma-0 custom-slider"
                  :step="1"
                  hide-details
                  @end="searchByDistance()"
                >
                </v-slider>
              </v-col>
            </v-row>
          </v-container>
        </div>
        <NuxtPage :findedPoint="findedPoint" />
        <v-overlay v-model="drawer" height="100%" width="100%">
          <v-navigation-drawer
              v-model="drawer"
              class="w-100 h-100 filter__drawer"
              location="top"
              style="top: 0"
          >

            <v-toolbar elevation="5" color="white">
              <v-container class="d-flex align-center justify-space-between">
                <div class="pa-3 ml-4 mr-5" @click="drawer = false">
                    <v-img src="/svgIcon/arrow-left.svg" cover max-width="7" width="7" height="12"/>
                </div>
                <h3 class="text-body-1">{{$t('filter')}}</h3>
                <h3 class="text-body-1 text-primary" @click="resetFilters = !resetFilters">{{$t('reset_filters')}}</h3>
              </v-container>
            </v-toolbar>

            <MainFilters type="popup" :reset-filters="resetFilters" @close-popup="drawer = false" />

          </v-navigation-drawer>
        </v-overlay>

    </v-main>

</template>

<style lang="scss">
    .tab-buttons {
        display: flex;
        align-items: center;
        width: 100%;
    }
    .tab-button {
        border: 1px solid #E4E4E4;
        box-shadow: none;
        border-radius: 0;
        margin-left: -1px;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        text-align: left;
        padding: 14px;
        --v-btn-height: auto;
        flex: 1 1;
        &:first-child {
            border-radius: 8px 0 0 8px;
            margin-left: 0;
        }
        &:last-child {
            border-radius: 0 8px 8px 0;
        }
        .v-img {
            margin-right: 6px;
        }
    }

    .advertisement__page {
      &-checkbox {
        .v-label {
          opacity: 1 !important;
        }
      }
      .v-input--density-default {
        --v-input-control-height: 30px !important;
        --v-input-padding-top: 16px;
      }
    }
</style>