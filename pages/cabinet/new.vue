<script setup lang="ts">
import { ref, onMounted, watch, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAdvStore } from '~/stores/advertisement'
import { useApi } from "~/composables/api";

definePageMeta({ middleware: 'auth' })

const { $api } = useApi()
const route = useRoute()
const router = useRouter()
const adv_store = useAdvStore()
const { advCreate, dictionaries, loading } = storeToRefs(adv_store)
const { addAdvertisements, resetAdvParams } = adv_store

const findedPoint = ref({})
const files = ref(null)
const drawer = ref<boolean>(true)

const errors = reactive({
  search: false,
  price: false,
  numberOfSeats: false,
  size: false,
  file: false,
  typePark: false,
  desc: false,
})

const handleImages = (filesData: any) => {
    files.value = filesData
}

const validate = () => {
  let valid = true;
  errors.search = !advCreate.value.name;
  errors.numberOfSeats = !advCreate.value.parking_space_numbers;
  errors.price = !advCreate.value.price;
  errors.size = !advCreate.value.area;
  errors.file = !files.value;
  errors.typePark = !advCreate.value.characteristics.length;
  errors.desc = !advCreate.value.description;

  for (const key in errors) {
    if (errors[key]) {
      valid = false;
      break;
    }
  }
  return valid;
};

const clearError = (field) => {
  errors[field] = false;
};
const createAdv = async () => {
  if (!validate()) {
    return;
  }

  try {
    loading.value = true
    const formData = new FormData();
    formData.append('name', advCreate.value.name);
    formData.append('latitude', advCreate.value.latitude);
    formData.append('longitude', advCreate.value.longitude);
    formData.append('object_type_id', advCreate.value.object_types);
    formData.append('deal_type_id', advCreate.value.deal_types);
    formData.append('tariff_type_id', advCreate.value.tariff_types);
    formData.append('parking_space_size_id', advCreate.value.parking_space_sizes);
    formData.append('parking_space_number_id', advCreate.value.parking_space_numbers);
    formData.append('price', advCreate.value.price);
    formData.append('area', advCreate.value.area);
    formData.append('description', advCreate.value.description);
    formData.append('city_id', advCreate.value.city_id);
    formData.append('parking_type_id', advCreate.value.parking_types)
    advCreate.value.characteristics.forEach((file:any, index:number) => {
      formData.append(`characteristics_ids[${index}]`, file);
    });
    files.value.forEach((file:any, index:number) => {
      formData.append(`images[${index}]`, file);
    });
    const data = await addAdvertisements(formData);
    loading.value = false
    if (data) {
      router.push('/cabinet')
    }
  } catch (error) {
    console.log(error, 'create error');
    alert(`ОШИБКА`)
    loading.value = false
  }
}

const changeObjectTypes = () => advCreate.value.object_types === 2 ? advCreate.value.parking_types = 2 : advCreate.value.parking_types = 1

watch(advCreate.value.name, () => clearError('search'));
watch(advCreate.value.price, () => clearError('price'));
watch(files, () => clearError('file'));
watch(advCreate.value.description, () => clearError('desc'));
watch(advCreate.value.characteristics, () => clearError('typePark'));
watch(advCreate.value.parking_space_numbers, () => clearError('numberOfSeats'));

onMounted(async () => {
  resetAdvParams()
});

</script>

<template>
    <v-main id="MainFilters" class="new-advertisement__page">
        <v-navigation-drawer
            v-model="drawer"
            class="w-100 h-100 filter__drawer"
            location="top"
            style="top: 0; z-index:2000;"
            touchless
        >

        <v-toolbar elevation="5" color="white">
            <v-container class="d-flex align-center justify-space-between">
            <div class="pa-3 ml-4 mr-5" @click="$router.push(localePath('/cabinet'))">
              <v-img src="/svgIcon/arrow-left.svg" cover max-width="7" width="7" height="12"/>
            </div>
            <h3 class="text-body-1">{{$t('new-advertisement')}}</h3>
            <h3 class="text-body-1 text-primary"></h3>
            </v-container>
        </v-toolbar>

        <v-container>

          <v-form ref="FormData" @submit.prevent="createAdv">
            <v-select
                class="mb-4"
                variant="solo"
                :items="dictionaries?.cities"
                hide-details
                :item-title="'name'"
                :item-value="'id'"
                v-model="advCreate.city_id"
            />

            <UISearchYandexInputWithMap :class="errors.search ? 'mb-2' : 'mb-8'" />
            <span class="text-body-1  text-error d-inline-block mb-6" v-if="errors.search">{{$t('specify-the-street')}}</span>

            <v-radio-group @change="changeObjectTypes" v-model="advCreate.object_types" class="mb-4" hide-details inline>
              <v-radio
                  v-for="item in dictionaries?.object_types"
                  :key="`object_types-${item.id}`"
                  class="filter-radio"
                  :label="item.title"
                  :value="item.id"
              />
            </v-radio-group>

            <v-radio-group v-model="advCreate.deal_types" class="mb-4" hide-details inline>
              <v-radio
                  v-for="item in dictionaries?.deal_types"
                  :key="`deal_types-${item.id}`"
                  class="filter-radio"
                  :label="item.title"
                  :value="item.id"
              />
            </v-radio-group>

            <v-radio-group v-if="advCreate.deal_types === 1" v-model="advCreate.tariff_types" class="mb-8" hide-details inline>
              <v-radio
                  v-for="item in dictionaries?.tariff_types"
                  :key="`tariff_types-${item.id}`"
                  class="filter-radio"
                  :label="item.title"
                  :value="item.id"
              />
            </v-radio-group>

            <div class="mb-4">
              <h3 class="mb-4">{{$t('field-price')}}</h3>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                      single-line
                      clearable
                      color="primary"
                      variant="outlined"
                      type="number"
                      v-model="advCreate.price"
                      :rules="[
                        v => !!v || $t('specify-the-price'),
                        v => (v >= 0) || $t('field-price-error'),
                      ]"
                  />
                </v-col>
              </v-row>
            </div>

            <h3 class="mb-4">{{$t('size-parkomest')}}</h3>

            <v-radio-group v-model="advCreate.parking_space_sizes" class="filter-radio-type-group mb-8" hide-details inline>
              <v-radio
                  v-for="item in dictionaries?.parking_space_sizes"
                  :key="`parking_space_sizes-${item.id}`"
                  class="filter-radio-type"
                  :label="item.title"
                  :value="item.id"
              >
                <template #label="{label}">
                  <div class="filter-radio-type-item">
                    <v-img
                        :style="`top: ${item.top}; left: ${item.left};`"
                        :src="item.image_url"
                        :height="item.height"
                        :width="item.width"
                    />
                    {{label}}
                  </div>
                </template>
              </v-radio>
            </v-radio-group>

            <div class="mb-4">
              <h3 class="mb-4">{{$t('field-area')}}</h3>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                      single-line
                      clearable
                      color="primary"
                      variant="outlined"
                      type="number"
                      v-model="advCreate.area"
                      :rules="[
                        v => !!v || $t('field-area-error'),
                      ]"
                  />
                </v-col>
              </v-row>
            </div>

            <div class="mb-4">
              <h3 class="mb-4">{{ $t('location') }}</h3>
              <div v-for="(characteristic, index) in dictionaries?.characteristics" :key="`characteristics_parking_${index}`" class="filter-checkbox-location mb-4">
                <v-checkbox
                    v-model="advCreate.characteristics"
                    :label="characteristic.title"
                    :value="characteristic.id"
                    color="primary"
                    hide-details
                />
              </div>
            </div>

            <div class="mb-6">
              <h3 class="mb-4">{{ $t('type-parking') }}</h3>
              <v-radio-group v-model="advCreate.parking_types" hide-details class="filter-checkbox-location">
                <v-radio
                    v-for="(parking_type, index) in dictionaries?.parking_types" :key="`types_parking_${index}`"
                    :value="parking_type.id"
                    :label="parking_type.title"
                    color="primary"
                    class="mb-4"
                    :disabled="advCreate.object_types === 2 && parking_type.id !== 2"

                />
              </v-radio-group>
              <span class="text-body-1  text-error d-inline-block mb-2" v-if="errors.typePark">{{$t('specify-the-type-of-parking')}}</span>
            </div>

            <div class="mb-4">
              <h3 class="mb-4">{{$t('size-for-auto')}}</h3>
              <v-row>
                <v-col cols="12">
                  <v-radio-group v-model="advCreate.parking_space_numbers" class="mb-4" hide-details inline>
                    <v-radio
                        v-for="item in dictionaries?.parking_space_numbers"
                        :key="`parking_space_numbers-${item.id}`"
                        class="filter-radio"
                        :label="item.title"
                        :value="item.id"
                    />
                  </v-radio-group>
                  <span class="text-body-1  text-error d-inline-block mb-2" v-if="errors.numberOfSeats">{{$t('specify-the-size')}}</span>
                </v-col>
              </v-row>
            </div>

            <h3 class="mb-3">{{$t('photo')}}</h3>
            <p class="mb-3">{{$t('you-can-upload-up-to-5-photos')}}</p>
            <UIDropImage :class="errors.file ? 'mb-2' : 'mb-8'" :uploadMsg="$t('add-photo')" :max="5" :error="$t('photo-error')" @changed="handleImages" />
            <span class="text-body-1  text-error d-inline-block mb-6" v-if="errors.file">{{$t('attach-a-photo')}}</span>

            <div class="mb-4">
              <h3 class="mb-4">{{$t('description')}}</h3>
              <v-row>
                <v-col cols="12">
                  <v-textarea
                      single-line
                      clearable
                      color="primary"
                      variant="outlined"
                      type="number"
                      v-model="advCreate.description"
                      :rules="[
                        v => !!v || $t('enter-a-description'),
                      ]"
                  />
                </v-col>
              </v-row>
            </div>

            <v-btn :loading="loading" size="x-large" color="primary" rounded="lg" elevation="0" class="text-none w-100" type="submit">{{$t('to-publish')}}</v-btn>
          </v-form>


        </v-container>



        </v-navigation-drawer>


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
</style>