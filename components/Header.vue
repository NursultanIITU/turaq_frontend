<script setup lang="ts">
import { ref } from "vue";
import { useMainStore } from "~/stores/main";
import { useAdvStore } from "~/stores/advertisement";
import VueBottomSheet from "@webzlodimir/vue-bottom-sheet";
import "@webzlodimir/vue-bottom-sheet/dist/style.css";

const main_store = useMainStore();
const adv_store = useAdvStore();

const { locale, locales, setLocale } = useI18n();

let { city } = storeToRefs(main_store);
const { fetchSearchAdv } = adv_store;
const { dictionaries } = storeToRefs(adv_store);
const { status } = useAuth();

const drawer = ref<boolean>(false);
const bottomSheetRefBurger = ref();
const bottomSheetRefBurgerLang = ref();

const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value);
});

const openSheet = (type: string): void => {
  setTimeout(() => {
    switch (type) {
      case "city":
        bottomSheetRefBurger.value.open();
        break;
      case "lang":
        bottomSheetRefBurgerLang.value.open();
        break;

      default:
        break;
    }
  }, 100);
};

const closeSheet = (): void => {
  if (bottomSheetRefBurger.value) {
    bottomSheetRefBurger.value.close();
  }
  if (bottomSheetRefBurgerLang.value) {
    bottomSheetRefBurgerLang.value.close();
  }
};

const citySelected = (selectedCityId: number): void => {
  city.value = selectedCityId;
  closeSheet();
  setGlobalCity(selectedCityId);
};

const setGlobalCity = async (city: number): void => {
  localStorage.setItem("city", city.toString());
};

watch(
  () => city.value,
  async () => {
    await fetchSearchAdv();
  }
);
</script>

<template>
  <v-app-bar
    :class="`${drawer ? 'd-none' : 'position-absolute'} ${
      $route.path === localePath('/')
        ? 'main-page mt-0 mt-md-6 mb-8'
        : 'other-page mt-0 mt-md-0 mb-8'
    }`"
    class="header"
    height="64"
    elevation="0"
    color="transparent"
  >
    <v-container class="h-100 py-0 px-0 px-md-4 header-v-container">
      <div
        class="header-body d-flex align-center justify-space-between bg-white h-100 header-container py-0 pl-1 pl-md-6 pr-6"
      >
        <div class="header-body-left">
          <v-app-bar-nav-icon
            class="d-block d-md-none"
            variant="text"
            :color="!drawer ? 'black' : 'black'"
            @click="drawer = !drawer"
            height="51"
          />
          <nuxt-link
            :to="localePath('/')"
            class="text-h6 text-decoration-none text-body-color font-weight-semi-bold"
          >
            Turaq.kz
          </nuxt-link>
          <div class="d-none d-md-flex header-location">
            <div class="header-location-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M8.0013 1.3335C5.06797 1.3335 2.66797 3.7335 2.66797 6.66683C2.66797 10.2668 7.33464 14.3335 7.53464 14.5335C7.66797 14.6002 7.86797 14.6668 8.0013 14.6668C8.13463 14.6668 8.33463 14.6002 8.46797 14.5335C8.66797 14.3335 13.3346 10.2668 13.3346 6.66683C13.3346 3.7335 10.9346 1.3335 8.0013 1.3335ZM8.0013 13.1335C6.6013 11.8002 4.0013 8.9335 4.0013 6.66683C4.0013 4.46683 5.8013 2.66683 8.0013 2.66683C10.2013 2.66683 12.0013 4.46683 12.0013 6.66683C12.0013 8.86683 9.4013 11.8002 8.0013 13.1335ZM8.0013 4.00016C6.53464 4.00016 5.33464 5.20016 5.33464 6.66683C5.33464 8.1335 6.53464 9.3335 8.0013 9.3335C9.46797 9.3335 10.668 8.1335 10.668 6.66683C10.668 5.20016 9.46797 4.00016 8.0013 4.00016ZM8.0013 8.00016C7.26797 8.00016 6.66797 7.40016 6.66797 6.66683C6.66797 5.9335 7.26797 5.3335 8.0013 5.3335C8.73463 5.3335 9.33463 5.9335 9.33463 6.66683C9.33463 7.40016 8.73463 8.00016 8.0013 8.00016Z"
                  fill="#0D6EFD"
                />
              </svg>
            </div>
            <v-select
              :items="dictionaries?.cities"
              variant="solo"
              hide-details
              :item-title="'name'"
              :item-value="'id'"
              v-model="city"
              :update:modelValue="setGlobalCity(city)"
            >
            </v-select>
          </div>
        </div>
        <div class="header-body-right">
          <div class="d-flex d-md-none">
            <v-select
              class="text-uppercase"
              :items="availableLocales"
              variant="solo"
              hide-details
              :item-title="'name'"
              :item-value="'code'"
              v-model="locale"
              :update:modelValue="setLocale(locale)"
              readonly
              @click="openSheet('lang')"
            >
            </v-select>
          </div>

          <div class="d-none d-md-flex ga-6">
            <v-select
              class="text-uppercase"
              :items="availableLocales"
              variant="solo"
              hide-details
              :item-title="'name'"
              :item-value="'code'"
              v-model="locale"
              :update:modelValue="setLocale(locale)"
            >
            </v-select>
            <v-btn
              v-if="status === 'unauthenticated'"
              :to="localePath('/cabinet')"
              class="bg-primary text-none"
              rounded="lg"
              elevation="0"
              >{{ $t("sign-in") }}</v-btn
            >
            <v-btn
              v-else
              :to="localePath('/cabinet')"
              class="bg-primary text-none"
              rounded="lg"
              elevation="0"
              >{{ $t("profile") }}</v-btn
            >
          </div>
        </div>
      </div>
      <vue-bottom-sheet v-if="availableLocales" ref="bottomSheetRefBurgerLang">
        <div class="pa-5 pt-4 d-flex justify-space-between">
          <span class="text-h6 text-body-color">{{ $t("select-lang") }}</span>
        </div>
        <ul class="pa-5 pb-16 pt-6">
          <li
            v-for="lang in locales"
            :key="lang.name"
            @click="
              setLocale(lang.code);
              closeSheet();
            "
            class="d-flex align-center justify-space-between mb-5"
          >
            <span class="text-body-color">{{ lang.name }}</span>
            <v-icon icon="mdi-check" size="20" v-if="lang.code === locale" />
          </li>
        </ul>
      </vue-bottom-sheet>
    </v-container>
  </v-app-bar>
  <v-navigation-drawer
    v-model="drawer"
    v-if="drawer"
    class="w-100 h-100"
    location="top"
    color="background"
    style="top: 0"
  >
    <header class="px-3 py-5 mb-6" @click="drawer = !drawer">
      <v-icon icon="mdi-chevron-left"></v-icon>
    </header>
    <v-container>
      <ul>
        <li class="px-5 pt-4 pb-7 bg-white rounded-xl mb-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-color text-h6">{{
              $t("personal-account")
            }}</span>
            <nuxt-link
              v-if="status === 'unauthenticated'"
              :to="localePath('/login')"
            >
              <v-btn
                rounded="lg"
                elevation="0"
                color="primary"
                class="text-none"
                >{{ $t("sign-in") }}</v-btn
              >
            </nuxt-link>
            <nuxt-link v-else :to="localePath('/cabinet')">
              <v-btn
                rounded="lg"
                elevation="0"
                color="primary"
                class="text-none"
                >{{ $t("profile") }}</v-btn
              >
            </nuxt-link>
          </div>
          <div>
            <p class="text-darker-gray text-body-2" style="line-height: 16.8px">
              {{ $t("personal-cabinet-desc") }}
            </p>
          </div>
        </li>
        <li class="pa-5 bg-white rounded-xl">
          <div class="mb-2">
            <span class="text-body-color text-h6">{{ $t("city") }}</span>
          </div>
          <div>
            <div class="d-flex header-location">
              <div class="header-location-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8.0013 1.3335C5.06797 1.3335 2.66797 3.7335 2.66797 6.66683C2.66797 10.2668 7.33464 14.3335 7.53464 14.5335C7.66797 14.6002 7.86797 14.6668 8.0013 14.6668C8.13463 14.6668 8.33463 14.6002 8.46797 14.5335C8.66797 14.3335 13.3346 10.2668 13.3346 6.66683C13.3346 3.7335 10.9346 1.3335 8.0013 1.3335ZM8.0013 13.1335C6.6013 11.8002 4.0013 8.9335 4.0013 6.66683C4.0013 4.46683 5.8013 2.66683 8.0013 2.66683C10.2013 2.66683 12.0013 4.46683 12.0013 6.66683C12.0013 8.86683 9.4013 11.8002 8.0013 13.1335ZM8.0013 4.00016C6.53464 4.00016 5.33464 5.20016 5.33464 6.66683C5.33464 8.1335 6.53464 9.3335 8.0013 9.3335C9.46797 9.3335 10.668 8.1335 10.668 6.66683C10.668 5.20016 9.46797 4.00016 8.0013 4.00016ZM8.0013 8.00016C7.26797 8.00016 6.66797 7.40016 6.66797 6.66683C6.66797 5.9335 7.26797 5.3335 8.0013 5.3335C8.73463 5.3335 9.33463 5.9335 9.33463 6.66683C9.33463 7.40016 8.73463 8.00016 8.0013 8.00016Z"
                    fill="#0D6EFD"
                  />
                </svg>
              </div>
              <v-select
                :items="dictionaries?.cities"
                variant="solo"
                hide-details
                :item-title="'name'"
                :item-value="'id'"
                v-model="city"
                class="d-flex"
                @click="openSheet('city')"
                readonly
              ></v-select>
            </div>
          </div>
        </li>
      </ul>
    </v-container>
    <vue-bottom-sheet v-if="dictionaries?.cities" ref="bottomSheetRefBurger">
      <div class="pa-5 pt-4 d-flex justify-space-between">
        <span class="text-h6 text-body-color">{{ $t("select-city") }}</span>
      </div>
      <ul class="pa-5 pb-16 pt-6">
        <li
          v-for="city_sheet in dictionaries?.cities"
          :key="city_sheet.id"
          @click="citySelected(city_sheet.id)"
          class="d-flex align-center justify-space-between mb-5"
        >
          <span class="text-body-color">{{ city_sheet.name }}</span>
          <v-icon icon="mdi-check" size="20" v-if="city_sheet.id === city" />
        </li>
      </ul>
    </vue-bottom-sheet>
  </v-navigation-drawer>
</template>

<style lang="scss">
.header {
  z-index: 100;
  justify-content: center;
  &-container {
    border-radius: 0 0 16px 16px;

    @media (min-width: 960px) {
      border-radius: 24px;
    }
  }
  &.other-page {
    .header-v-container {
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
    }
    .header-container {
      border-radius: 0px !important;
    }
    .header-body {
      --v-theme-overlay-multiplier: var(
        --v-theme-primary-blue-overlay-multiplier
      );
      background-color: rgb(var(--v-theme-primary-blue)) !important;
      * {
        color: #fff !important;
      }
    }
  }
  &.main-page {
  }
  .v-toolbar__content {
    // border-radius: 0 0 24px 24px;
    // background: #FFF;
  }
  &-body {
    &-left {
      display: flex;
      align-items: center;
      color: rgb(var(--v-theme-primary));
    }
    &-right {
      display: flex;
      align-items: center;
      color: rgb(var(--v-theme-primary));
    }
  }
  &-location {
    display: flex;
    align-items: center;
    margin-left: 24px;
    color: rgb(var(--v-theme-primary));
    @media (max-width: 960px) {
      margin-left: 0;
    }
    &-icon {
      background: #f5f8ff;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      min-width: 32px;
      border-radius: 100%;
      margin-right: 8px;
      svg {
        width: 16px;
        height: 16px;
        path {
          fill: rgb(var(--v-theme-primary));
        }
      }
    }
  }
  &.other-page {
    .header-body {
      &-left {
        color: rgb(var(--v-theme-white));
      }
      &-right {
        color: rgb(var(--v-theme-white));
      }
    }
  }
}
</style>
