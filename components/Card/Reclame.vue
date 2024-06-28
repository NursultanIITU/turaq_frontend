<script setup lang="ts">
import { computed } from "vue";
import type { IReclame } from "~/types/card/reclame";

const { status } = useAuth()
interface IProps {
  card: IReclame
}

const props = defineProps<IProps>()

const AuthOrSubscribe = computed<{ path: string }>(() => {
  switch (status.value) {
    case "unauthenticated":
      return { path: '/login' };
    case "authenticated":
      return { path: '/cabinet' }
    default:
      throw new Error('unknown status')
  }
})
</script>

<template>
  <v-card width="100%" min-height="167" class="card__reclame pa-4 d-flex flex-column justify-space-between align-start">
    <h3 class="text-h6 text-white">{{ $t(card.title) }}</h3>
    <v-btn @click="$router.push(localePath(AuthOrSubscribe.path))" color="primary" elevation="0" class="text-none text-body-2" rounded="lg">
      {{$t('reclame-banner-button')}}
    </v-btn>
  </v-card>
</template>

<style lang="scss">
.card__reclame {
  border-radius: 16px !important;
  background: #867BFF;
  position: relative;
  z-index: 1;
  &:after {
    content: "";
    position: absolute;
    z-index: 3;
    bottom: -18px;
    right: 0;
    display: block;
    background: url("/tipochek.png") no-repeat;
    width: 200px;
    height: 100%;
  }
  h3 {
    line-height: 24px;
  }
  .v-card__underlay {
    display: none;
  }
}
</style>