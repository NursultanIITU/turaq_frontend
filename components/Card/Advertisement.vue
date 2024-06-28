<script setup lang="ts">
import type { IAdvertisement } from "~/types/card/advertisement";
import { advPriceTariffType } from "~/utilities/helper";

interface IProps {
  card: IAdvertisement;
}

const props = defineProps<IProps>();
</script>

<template>
  <nuxt-link
    :to="localePath(`/advertisement/${card.slug}`)"
    class="text-decoration-none advertisement__card"
  >
    <v-card min-height="280" elevation="0" rounded="12" class="card pa-4">
      <header class="d-flex justify-space-between mb-4">
        <span class="text-body-1"
          >{{ new Intl.NumberFormat("kk-KZ").format(card?.price) }} ₸
          {{
            card?.tariff_type?.id &&
            "/" + $t(advPriceTariffType(card?.tariff_type?.id))
          }}</span
        >
        <span class="text-body-1 text-primary"
          >{{ card?.object_type.title ? `${card?.object_type.title} •` : "" }}
          {{ Number(card.area) ? Number(card.area).toFixed(0) : "" }}
          {{ $t("area_unit") }}</span
        >
      </header>
      <main :class="card.characteristics ? 'mb-5' : ''">
        <v-img
          :src="
            card.media[0].media_url ? card.media[0].media_url : '/no_image.jpeg'
          "
          height="150"
          width="100%"
          cover
          rounded="lg"
          class="mb-5"
        >
          <template v-slot:error>
            <v-img
              height="150"
              width="100%"
              cover
              src="/no_image.jpeg"
              class="error-image"
            ></v-img>
          </template>
        </v-img>
        <div class="d-flex flex-column">
          <span class="text-subtitle-2">{{ card.name }}</span>
          <span v-if="card?.city?.name" class="text-subtitle-2 text-gray">{{
            card?.city?.name
          }}</span>
        </div>
      </main>
      <footer>
        <v-chip-group class="py-0">
          <v-chip
            v-if="card.distance !== null"
            variant="elevated"
            class="rounded bg-chip-card card-chip"
            elevation="0"
          >
            <v-img
              :src="'/svgIcon/guide-line.svg'"
              class="mr-2"
              width="16"
              height="16"
            />
            <span class="text-caption"
              >{{ (card.distance / 1000).toFixed(2) }}
              {{ $t("distance-unit") }}</span
            >
          </v-chip>
          <!-- <v-chip
              v-else
              variant="elevated"
              v-for="(widget, index) in card.characteristics"
              :key="`widget-card-${index}`"
              class="rounded bg-chip-card card-chip"
              elevation="0"
          >
            <v-img
                :src="widget.title === 'Охраняемый' ? '/svgIcon/lock.svg' : '/svgIcon/home.svg'"
                class="mr-2"
                width="16"
                height="16"
            />
            <span class="text-caption">{{ widget.title }}</span>
          </v-chip> -->
        </v-chip-group>
      </footer>
    </v-card>
  </nuxt-link>
</template>

<style lang="scss">
.advertisement__card {
  .card {
    &-chip {
      margin: 4px 16px 4px 0;
    }
    .v-slide-group__container {
      display: block;
      flex: 1 1 auto;
    }
    .v-slide-group__content {
      display: block;
      flex: none;
      white-space: pre-wrap;
    }
  }
}
</style>
