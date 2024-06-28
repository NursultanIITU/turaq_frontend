<script setup lang="ts">
const { status } = useAuth();
interface IAdvantages {
  icon: string;
  title: string;
  subtitle: string;
}

const advantages: IAdvantages[] = [
  {
    icon: "/main/wallet.svg",
    title: "index-page-block3-item1-title",
    subtitle: "index-page-block3-item1-subtitle",
  },
  {
    icon: "/main/check.svg",
    title: "index-page-block3-item2-title",
    subtitle: "index-page-block3-item2-subtitle",
  },
  {
    icon: "/main/search.svg",
    title: "index-page-block3-item3-title",
    subtitle: "index-page-block3-item3-subtitle",
  },
];

const questions: string[] = [
  "index-page-block4-item1",
  "index-page-block4-item2",
  "index-page-block4-item3",
];

const AuthOrSubscribe = computed<{ path: string }>(() => {
  switch (status.value) {
    case "unauthenticated":
      return { path: "/login", query: { new: "true" } };
    case "authenticated":
      return { path: "/cabinet/new" };
    default:
      throw new Error("unknown status");
  }
});
</script>

<template>
  <v-main class="main__page">
    <section class="main__page__banner mb-15 mb-md-8 bg-primary-blue">
      <v-container class="px-0 pb-0 pb-md-4 px-md-4">
        <v-row class="main__page__banner-row mx-0 mx-lg-n3 pa-md-0">
          <v-col cols="12" lg="6" class="">
            <h1
              class="text-lg-start text-center text-h6 text-sm-h4 text-md-h3 px-15 px-lg-0 font-weight-semi-bold text-white pr-lg-8"
            >
              {{ $t("main-page-title") }}
            </h1>
          </v-col>
          <v-col cols="12" lg="6" class="pb-3 pa-0 pa-lg-3">
            <MainFilters type="page" class="main__page__banner-filters" />
          </v-col>
        </v-row>
      </v-container>
    </section>
    <section class="main__page__demo mb-6">
      <v-container class="px-0 px-md-4">
        <v-sheet class="main__page__demo-sheet">
          <v-row class="mx-0 pa-4 pa-md-0">
            <v-col cols="12" sm="6" class="pb-4 pa-0 pa-md-12">
              <h2 class="mb-4 text-white font-weight-semi-bold">
                {{ $t("index-page-block1-title") }}
              </h2>
              <h3 class="text-body-1 text-md-h6 mb-0 mb-md-10">
                {{ $t("index-page-block1-description") }}
              </h3>
              <v-btn
                @click="$router.push(localePath(AuthOrSubscribe))"
                color="white"
                class="d-none d-md-block text-none text-body-1 rounded-lg"
                size="x-large"
                elevation="0"
                >{{ $t("index-page-block1-button") }}</v-btn
              >
            </v-col>
            <v-col
              cols="12"
              sm="6"
              class="main__page__demo-column-right d-flex align-end justify-center mb-4 mb-md-0"
            >
              <v-img
                src="/main/demo-card.png"
                class="main__page__demo-column-right-image"
                cover
              />
            </v-col>
            <v-btn
              @click="$router.push(localePath(AuthOrSubscribe))"
              color="white"
              block
              class="mb-6 d-md-none text-none text-body-1 rounded-lg"
              size="x-large"
              elevation="0"
              >{{ $t("index-page-block1-button") }}</v-btn
            >
          </v-row>
        </v-sheet>
      </v-container>
    </section>
    <section class="main__page__about mb-md-6">
      <v-container class="px-0 px-md-4">
        <v-sheet
          class="px-md-0 px-4 pb-6 pb-md-0 main__page__about-sheet rounded-xl"
          color="white"
        >
          <v-row class="mb-4 mb-md-0">
            <v-col
              cols="12"
              sm="6"
              class="px-4 pt-8 pb-1 px-md-12 pt-md-12 pb-md-12"
            >
              <h2 class="text-body-color font-weight-regular mb-4">
                {{ $t("index-page-block2-title") }}
              </h2>
              <p class="text-h6 text-body-color mb-0 mb-md-10">
                {{ $t("index-page-block2-description") }}
              </p>
              <v-btn
                @click="$router.push(localePath('/advertisement/list'))"
                class="d-none d-md-block text-none text-body-1 rounded-lg"
                size="x-large"
                elevation="0"
                >{{ $t("index-page-block2-button") }}</v-btn
              >
            </v-col>
            <v-col cols="12" sm="6" class="py-0">
              <v-img src="/main/about-map.svg" />
            </v-col>
          </v-row>
          <v-btn
            @click="$router.push(localePath('/advertisement/list'))"
            block
            class="d-block d-md-none text-none text-body-1 rounded-lg mt-4"
            size="x-large"
            elevation="0"
            >{{ $t("index-page-block2-button") }}</v-btn
          >
        </v-sheet>
      </v-container>
    </section>
    <section class="main__page__advantages mb-2 mb-md-6">
      <v-container class="px-0 px-md-4">
        <v-sheet class="rounded-xl px-4 py-6 px-md-12 py-md-12" color="white">
          <h2 class="mb-6 font-weight-regular">
            {{ $t("index-page-block3-title") }}
          </h2>
          <v-row>
            <v-col
              v-for="(card, index) in advantages"
              :key="`advantages-${index}`"
              cols="12"
              :md="advantages.length === index ? 12 : 6"
              lg="4"
            >
              <v-sheet
                class="main__page__advantages-card pa-6 rounded-xl h-100"
              >
                <v-img
                  :src="card.icon"
                  width="46"
                  height="46"
                  cover
                  class="mb-4"
                />
                <span class="text-h5 text-body-color mb-3 d-inline-block">{{
                  $t(card.title)
                }}</span>
                <p class="text-body-color font-weight-light">
                  {{ $t(card.subtitle) }}
                </p>
              </v-sheet>
            </v-col>
          </v-row>
        </v-sheet>
      </v-container>
    </section>
    <section class="main__page__questions">
      <v-container class="px-0 px-md-4">
        <v-sheet class="rounded-xl px-4 py-6 px-md-12 py-md-12" color="white">
          <h2 class="mb-6">{{ $t("index-page-block4-title") }}</h2>
          <ul class="main__page__questions-list">
            <li
              v-for="(question, index) in questions"
              :key="`question-${index}`"
              class="main__page__questions-list-item text-body-color mb-5 d-flex align-center"
            >
              <span
                class="main__page__questions-list-item-index text-body-1 mr-5"
                >{{ index + 1 }}</span
              >
              <p class="d-inline-block text-h6 text-md-h5">
                {{ $t(question) }}
              </p>
            </li>
          </ul>
        </v-sheet>
      </v-container>
    </section>
  </v-main>
</template>

<style lang="scss">
.main__page {
  padding-top: 0;
  padding-bottom: 24px;
  h2 {
    font-size: 28px;
    line-height: 33.6px;
    @media (min-width: 960px) {
      font-size: 40px;
      line-height: 48px;
    }
    @media (min-width: 600px) {
      font-size: 34px;
      line-height: normal;
    }
  }
  &__banner {
    padding-top: 62px;
    padding-bottom: -30px;
    @media (min-width: 960px) {
      padding-top: 117px;
      padding-bottom: 63px;
    }
    position: relative;
    @media (min-width: 1280px) {
      &:after {
        content: "";
        position: absolute;
        display: block;
        background: url("/main/banner.png") no-repeat;
        background-size: 100%;
        bottom: 0;
        width: 725px;
        height: 436px;
        left: 3%;
      }
    }
    h1 {
      margin-bottom: 4px;
      @media (min-width: 960px) {
        margin-bottom: 40px;
      }
      @media (min-width: 1280px) {
        margin-bottom: 131px;
      }
    }
    &-filters {
      margin-bottom: -26px;
      @media (min-width: 960px) {
        margin-bottom: 0;
      }
    }
  }
  &__demo {
    &-sheet {
      background: #424c60;
      border-radius: 16px;
    }
    h3 {
      color: #fff;
      line-height: 27.6px;
    }
    &-column-right {
      background: #38393d;
      border-radius: 16px;
      padding: 35px 56px 0 56px;
      @media (min-width: 960px) {
        padding: 42px 88px 0 88px;
      }
      &-image {
        @media (max-width: 600px) {
          max-width: 245px;
        }
      }
    }
  }
  &__about {
    &-sheet {
      .v-btn {
        background-color: #f2f5fa !important;
        color: #000000 !important;
      }
      .v-img {
        border-radius: 24px;
      }
    }
  }
  &__advantages {
    &-card {
      background: #f2f5fa;
      p {
        line-height: 19.2px;
      }
    }
  }
  &__questions {
    &-list {
      padding-left: 10px;
      &-item {
        &-index {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          &:after {
            content: "";
            position: absolute;
            z-index: -1;
            background: #f2f5fa;
            border-radius: 50px;
            width: 28px;
            height: 28px;
          }
        }
        .text-h6 {
          line-height: 24px;
        }
      }
    }
  }
}
</style>
