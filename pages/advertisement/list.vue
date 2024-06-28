<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import type { IAdvertisement } from "~/types/card/advertisement";
import type { IReclame } from "~/types/card/reclame";
import { useRouter, useRoute } from "vue-router";
import { useApi } from "~/composables/api";
import { useAdvStore } from "~/stores/advertisement";

const { status, data } = useAuth()
const router = useRouter()
const route = useRoute()
const { $api } = useApi()
const adv_store = useAdvStore()
const { fetchSearchAdv } = adv_store
const { advSearch, loading } = storeToRefs(adv_store);


const cards = ref([])
const cardReclame: IReclame[] = ([
  {
    type: 'Reclame',
    title: 'reclame-banner-text'
  },
])

const mixedCards = computed(() => {
  const output = [...advSearch.value];
  let reclameIndex = 0;
  // for (let i = 3; i < output.length; i += 5) {
  for (let i = 3; i < 4; i += 5) {
    if (cardReclame[reclameIndex] && (window as any)?.innerWidth < 1024) {
      output.splice(i, 0, cardReclame[reclameIndex]);
      reclameIndex = (reclameIndex + 1) % cardReclame.length;
    }
  }
  return output;
});

const AuthOrSubscribe = computed(() => {
  switch (status.value) {
    case "unauthenticated":
      return { path: '/login', query: { statusAuth: status.value, subscribe: 'true' } };
    case "authenticated":
      return { path: '/login', query: { statusAuth: status.value, subscribe: 'true' } }
    default:
      throw new Error('unknown status')
  }
})

onMounted(async () => {
  await fetchSearchAdv()
})
</script>

<template>
  <v-main class="list__page pt-0">
    <section>
      <v-container class="pt-11 list__page-not-cards px-11 px-md-4" v-if="!advSearch?.length && !loading">
        <h3 class="text-h6 mb-7">
          {{$t('nothing-was-found')}}
        </h3>
        <v-btn color="white" rounded="lg" elevation="0" class="text-none d-flex align-center" size="x-large" @click="router.push(AuthOrSubscribe)">
          <v-img src="/svgIcon/bell.svg" width="19" height="19" class="mr-1" />
          <span class="text-primary text-body-2">{{$t('subscribe-to-notifications')}}</span>
        </v-btn>
      </v-container>
      <v-container v-else-if="loading">
            <v-skeleton-loader type="card, card, card, card"></v-skeleton-loader>
        </v-container>
      <v-container class="mt-0 mt-md-15" v-else>
        <h2 class="d-none d-md-block mb-8">{{$t('search-results')}}</h2>
        <v-row>
          <v-col
              v-for="(card, index) in mixedCards"
              :key="`card-advertisement-${index}`"
              cols="12"
              sm="6"
              md="4"
              lg="4"
              xl="3"
          >
            <CardAdvertisement
                :card="card"
                v-if="card.type !== 'Reclame'"
            />
            <CardReclame
                class="d-flex d-md-none"
                v-else
                :card="card"
            />
          </v-col>
        </v-row>
      </v-container>
    </section>
  </v-main>
</template>

<style lang="scss">
.list__page {
  @media(max-width: 600px) {
    // background: #EEECEC;
  }
  &-not-cards {
    h3 {
      line-height: 28px;
      max-width: 220px;
    }
    span {
      line-height: normal;
    }
  }
}
</style>