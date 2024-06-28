<script setup lang="ts">
import { ref, watch, defineProps, onMounted } from 'vue';
import { useMainStore } from '~/stores/main'
import { useAdvStore } from '~/stores/advertisement'
import { useApi } from "~/composables/api";
import VueBottomSheet from "@webzlodimir/vue-bottom-sheet";
import "@webzlodimir/vue-bottom-sheet/dist/style.css";

const main_store = useMainStore()
const adv_store = useAdvStore()
interface IProps {
  resetFilters: boolean
  type: 'popup' | 'page'
}

const props = withDefaults(defineProps<IProps>(), {
  type: 'page'
});

const emits = defineEmits(['close-popup'])

const { $api } = useApi()
const { search, center, zoom, city, filters, firstReset, setSearch } = storeToRefs(main_store);
const { dictionaries } = storeToRefs(adv_store);
const { fetchSearchAdv } = adv_store

const bottomSheetRefFilters = ref()

async function closePopupFilters() {
  try {
    await fetchSearchAdv()
    closePopup()
  } catch (e) {
    console.log(e)
    throw e
  }
}

function closePopup(): void {
  emits('close-popup')
}

const resetFilterFunc = (): void => {
    filters.value.object_types = [dictionaries.value.object_types[0]?.id]
    filters.value.deal_types = dictionaries.value.deal_types[0]?.id
    filters.value.tariff_types = dictionaries.value.tariff_types[0]?.id
    filters.value.parking_space_sizes = dictionaries.value.parking_space_sizes[0]?.id
    filters.value.from_price = null
    filters.value.to_price = null
    filters.value.from_size = null
    filters.value.to_size = null
    filters.value.parking_types = dictionaries.value.parking_types[0]?.id
    filters.value.characteristics = []
    filters.value.parking_space_numbers = null
    city.value = Number(localStorage.getItem('city')) || dictionaries.value.cities[0]?.id || 0
    search.value = ''
    firstReset.value = true
    search.value = ''
    setSearch.value = null
}

const openSheet = (): void => {
  setTimeout(() => {
    bottomSheetRefFilters.value.open();
  }, 100);
}

const closeSheet = (): void => {
  bottomSheetRefFilters.value.close();
}

const changeObjectTypes = () => filters.value.object_types?.length === 1 && filters.value.object_types[0] === 2 ? filters.value.parking_types = 2 : filters.value.parking_types = 1

watch(() => props.resetFilters, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    resetFilterFunc()
    await fetchSearchAdv()
    closePopup()
  }
});

onMounted(async () => {
  if (!firstReset.value || props.type === 'page') {
    resetFilterFunc()
  }
});

</script>

<template>
  <section id="MainFilters" :class="type === 'page' ? 'page-filters' : 'popup-filters'">
    <v-container>
        <div>
            <v-select
                class="mb-4 d-flex d-md-none"
                :items="dictionaries?.deal_types"
                variant="solo"
                hide-details
                :item-title="'title'"
                :item-value="'id'"
                v-model="filters.deal_types"
            ></v-select>

            <div class="d-md-flex d-none">
              <v-radio-group v-model="filters.deal_types" class="mb-4 filter-radio-text-group" hide-details inline>
                <v-radio v-for="item in dictionaries?.deal_types" :key="`deal_types-${item.id}`" class="filter-radio filter-radio-text" :label="item.title" :value="item.id"></v-radio>
              </v-radio-group>
            </div>

            <!-- <v-radio-group v-model="filters.object_types" class="mb-4" hide-details inline  @change="changeObjectTypes">
                <v-radio v-for="item in dictionaries?.object_types" :key="`object_types-${item.id}`" class="filter-radio" :label="item.title" :value="item.id"></v-radio>
            </v-radio-group> -->

            <v-select
                class="mb-4 v-select-checkboxes"
                :items="dictionaries?.object_types"
                variant="outlined"
                hide-details
                :item-title="'title'"
                :item-value="'id'"
                v-model="filters.object_types"
                @update:modelValue="changeObjectTypes"
                multiple
                name="object_types"
                color="primary"
                :placeholder="$t('object_type')"
            ></v-select>

            <v-radio-group v-if="filters.deal_types === 1" v-model="filters.tariff_types" class="mb-8" hide-details inline>
                <v-radio v-for="item in dictionaries?.tariff_types" :key="`tariff_types-${item.id}`" class="filter-radio" :label="item.title" :value="item.id"></v-radio>
            </v-radio-group>

            <div class="mb-4 d-flex align-center ga-2">
              <h3>{{ $t('size-parkomest') }}</h3>
              <v-icon icon="mdi-information-outline" style="opacity: .9" @click="openSheet" size="16"></v-icon>
            </div>

            <vue-bottom-sheet ref="bottomSheetRefFilters">
              <div class="pa-5 pt-4 d-flex justify-space-between">
                <span class="text-h6 text-body-color">{{ $t('size-park-info-title') }}</span>
              </div>
              <ul class="pa-5 pb-16 pt-6">
                <li @click="closeSheet()" class="d-flex align-center justify-space-between mb-5">
                  <span class="text-body-color">{{ $t('size-park-info-standard') }}</span>
                </li>
                <li @click="closeSheet()" class="d-flex align-center justify-space-between mb-5">
                  <span class="text-body-color">{{ $t('size-park-info-plus') }}</span>
                </li>
                <li @click="closeSheet()" class="d-flex align-center justify-space-between mb-5">
                  <span class="text-body-color">{{ $t('size-park-info-mini') }}</span>
                </li>
              </ul>
            </vue-bottom-sheet>

            <v-radio-group v-model="filters.parking_space_sizes" class="filter-radio-type-group mb-8" hide-details inline>
                <v-radio v-for="item in dictionaries?.parking_space_sizes" :key="`parking_space_sizes-${item.id}`" class="filter-radio-type" :label="item.title" :value="item.id">
                    <template #label="{label}">
                        <div class="filter-radio-type-item">
                            <v-img :style="`top: ${item.top}; left: ${item.left};`" :src="item.image_url" :height="item.height" :width="item.width"></v-img>
                            {{label}}
                        </div>
                    </template>
                </v-radio>
            </v-radio-group>

            <h3 class="mb-4">{{ $t('close-to') }}</h3>

            <UISearchYandexInput class="mb-2" />

            <div class="mb-8" v-if="type === 'popup'">
              <h3 class="mb-4">{{ $t('field-price') }}</h3>
              <v-row>
                <v-col cols="6">
                  <v-text-field single-line hide-details clearable :label="$t('from')" color="primary" variant="outlined" type="number" v-model="filters.from_price" />
                </v-col>
                <v-col cols="6">
                  <v-text-field single-line hide-details clearable :label="$t('to')" color="primary" variant="outlined" type="number" v-model="filters.to_price" />
                </v-col>
              </v-row>
            </div>

            <div class="mb-6" v-if="type === 'popup'">
              <h3 class="mb-4">{{ $t('location') }}</h3>
              <div v-for="(characteristic, index) in dictionaries?.characteristics" :key="`characteristics_parking_${index}`" class="filter-checkbox-location mb-4">
                <v-checkbox
                    v-model="filters.characteristics"
                    :label="characteristic.title"
                    :value="characteristic.id"
                    color="primary"
                    hide-details
                />
              </div>
            </div>

            <div class="mb-6" v-if="type === 'popup'">
              <h3 class="mb-4">{{ $t('type-parking') }}</h3>
              <v-radio-group v-model="filters.parking_types" hide-details class="filter-checkbox-location">
                <v-radio
                    v-for="(parking_type, index) in dictionaries?.parking_types" :key="`types_parking_${index}`"
                    :value="parking_type.id"
                    :label="parking_type.title"
                    color="primary"
                    class="mb-4"
                    :disabled="filters.object_types?.length === 1 && filters.object_types[0] === 2  && parking_type.id !== 2"
                />
              </v-radio-group>
            </div>

            <div class="mb-8" v-if="type === 'popup'">
              <h3 class="mb-4">{{ $t('field-area') }}</h3>
              <v-row>
                <v-col cols="12">
                  <v-text-field single-line hide-details clearable :label="$t('from')" color="primary" variant="outlined" type="number" v-model="filters.from_size" />
                </v-col>
<!--                <v-col cols="6">-->
<!--                  <v-text-field single-line hide-details clearable :label="$t('to')" color="primary" variant="outlined" type="number" v-model="filters.to_size" />-->
<!--                </v-col>-->
              </v-row>
            </div>

            <div class="mb-8" v-if="type === 'popup'">
              <h3 class="mb-4">{{ $t('size-for-auto') }}</h3>
              <v-row>
                <v-col cols="12">
                  <v-radio-group v-model="filters.parking_space_numbers" class="mb-4" hide-details inline>
                    <v-radio
                        v-for="item in dictionaries?.parking_space_numbers"
                        :key="`parking_space_numbers-${item.id}`"
                        class="filter-radio"
                        :label="item.title"
                        :value="item.id"
                    />
                  </v-radio-group>
                </v-col>
              </v-row>
            </div>

            <div class="d-flex flex-wrap justify-space-between mb-6">
                <v-btn @click="$router.push(localePath('/advertisement/list'))" rounded="lg" size="large" elevation="0" class="text-none mb-4 w-100" color="primary" v-if="type === 'page'">
                  <span>{{$t('show')}} <label v-if="type === 'page'">{{ $t('advertisement') }}</label></span>
                </v-btn>
                <v-row class="">
                  <v-col cols="6">
                    <v-btn @click="$router.push(localePath('/advertisement/list?showfilter=true'))" rounded="lg" size="large" class="text-none" block  variant="tonal" color="primary" v-if="type === 'page'">
                      <template #prepend>
                          <v-img src="/filter-icon.svg" height="24" width="24"></v-img>
                      </template>
                      {{ $t('all-filters') }}
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn @click="$router.push(localePath('/advertisement/map'))" rounded="lg" size="large" class="text-none" block  variant="tonal" color="primary" v-if="type === 'page'">
                        <template #prepend>
                            <v-img src="/map-icon.svg" height="24" width="24"></v-img>
                        </template>
                      {{ $t('on-map') }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-btn @click="closePopupFilters" block rounded="lg" size="large" elevation="0" class="text-none" color="primary" v-if="type === 'popup'">
                  <span>{{$t('show')}} <label v-if="type === 'popup'">{{ $t('advertisement') }}</label></span>
                </v-btn>
            </div>

        </div>
    </v-container>
  </section>
</template>

<style lang="scss">
    #MainFilters {
      &.page-filters {
        background: #fff;
        border-radius: 24px;
        padding: 8px 0;
        position: relative;
        z-index: 5;
        // height: 623px;
      }
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
                border: 1px solid #E4E4E4;
                opacity: 1;
                margin-left: -1px;
                transition: .2s ease;
            }
            &:first-child {
                .v-label {
                    margin-left: 0;
                    border-radius: 8px 0 0 8px
                }
            }
            &:last-child {
                .v-label {
                    border-radius: 0 8px 8px 0
                }
            }
            &.v-selection-control--dirty {
                z-index: 2;
                .v-label {
                    border-color: #797979;
                    background-color: #F4F8FF;
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
                height: 100px;
                width: 100px;
                border-radius: 16px;
                background: #F8F9FA;
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
                    opacity: .5;
                }
            }
        }
        .v-selection-control--dirty {
            .filter-radio-type-item {
                background: radial-gradient(123.18% 123.18% at 55% 36.82%, #EBF4FF 0%, #9EBEFF 100%);
              .v-img {
                opacity: 1;
              }  
            }
        }
        .filter-checkbox-location {
          .v-input--density-default {
            --v-input-control-height: 24px !important;
            --v-input-padding-top: 16px;
          }
          .v-selection-control--density-default {
            --v-selection-control-size: 18px;
          }
          .v-selection-control__input > .v-icon {
            opacity: .3;
          }
          .v-selection-control--disabled .v-selection-control__input > .v-icon, .v-selection-control--dirty .v-selection-control__input > .v-icon, .v-selection-control--error .v-selection-control__input > .v-icon {
            opacity: 1 !important;
          }
          .v-label.v-label--clickable {
            margin-left: 8px;
            opacity: 1;
          }
        }
        .filter-size-number {
          .v-selection-control__input {
            display: none;
          }
        }

        .combobox-my {
            .v-input__control, input {
                height: 56px;
            }
            .v-field__input {
                --v-input-control-height: 56px;
                min-height: 56px;
            }
        }

        .filter-radio-text {
          .v-label {
            background: transparent !important;
            border: none;
            color: #1C1C1C;
            font-size: 20px;
            font-style: normal;
            font-weight: 400;
            line-height: 28px; /* 140% */
            opacity: 0.4;
            padding: 4px 0;
            margin: 0;
          }
          &.v-selection-control--dirty .v-label {
            background: transparent !important;
            border: none;
            opacity: 1;
            margin: 0;
            padding: 4px 0;
          }
        }
        .filter-radio-text-group {
          .v-selection-control-group.v-selection-control-group--inline {
            gap: 16px;
          }
        }

        .v-select-checkboxes {
          width: 100%;
          display: block;
          .v-field__input {
            padding: 12px;
            height: 47px;
            input {
              touch-action: none;
            }
            .v-select__selection-text {
              color: #1C1C1C;
              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: 20px; /* 125% */
            }
          }
          .v-field__outline {
            --v-field-border-opacity: 1;
            border-radius: 8px;
            color: #797979!important;
            // border: 1px solid #797979;
            // background: #F4F8FF;
          }
          .v-field--focused .v-field__outline {
            --v-field-border-width: 1px;
            color: #256AF2!important;
          }
        }
    }
</style>