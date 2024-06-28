<script setup lang="ts">

</script>

<template>
  <v-footer class="position-static footer px-0 py-2 py-md-5">
    <v-container>
      <v-row>
        <v-col cols="12" class="d-flex flex-column flex-md-row align-md-center ga-5 ga-md-8">
          <span class="text-body-color-2 font-weight-semi-bold text-h6">Turaq.kz</span>
          <ul class="d-flex flex-column flex-md-row align-md-center ga-5 ga-md-8">
            <li class="d-flex align-center">
              <v-img src="/svgIcon/location.svg" max-width="14" width="14px" height="14" cover class="mr-3"/>
              <p class="text-body-color-2 text-body-1">{{$t('main-address')}}</p>
            </li>
            <li class="d-flex align-center">
              <v-img src="/svgIcon/mail.svg" max-width="14" width="14px" height="14" cover class="mr-3"/>
              <p class="text-body-color-2 text-body-1">
                {{$t('support-mail-title')}}
                <label for="">
                  <a :href="`mailto:${$t('support-mail').replace('/', '@')}`" class="text-link text-decoration-none">{{$t('support-mail').replace('/', '@')}}</a>
                </label>
              </p>
            </li>
          </ul>
        </v-col>
        <v-col cols="12" class="d-flex flex-column flex-md-row align-md-center ga-4 ga-md-5">
          <a :href="$t('privacy-policy-link')" target="_blank" rel="noopener noreferrer" class="text-decoration-underline text-body-color-2">{{$t('privacy-policy')}}</a>
          <a :href="$t('terms-of-use-link')" target="_blank" rel="noopener noreferrer" class="text-decoration-underline text-body-color-2">{{$t('terms-of-use')}}</a>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<style lang="scss">
.footer {
  background: #B6BECD;
}
</style>