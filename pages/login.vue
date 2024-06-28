<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { vMask } from "@opentf/vue-input-mask";
import { useApi } from "~/composables/api";

const router = useRouter();
const { signIn, token, status, data } = useAuth();
const route = useRoute();
const { $api } = useApi();

const drawer = ref<boolean>(true);
const subscribe = ref<boolean>(false);
const newAdv = ref<boolean>(false);
const phone = ref<string | undefined>();
const code = ref<string | undefined>();
const validFormPhone = ref<boolean>(true);
const validFormCode = ref<boolean>(false);
const tokenPhone = ref<string>("");
const errorCode = ref<boolean>(false);

async function formPhone(
  isValid: boolean = false,
  phoneValue: string | undefined
) {
  const cleanPhoneValue = phoneValue?.replace(/\D/g, "");
  if (isValid) {
    try {
      const { data } = await $api("/auth/send-code", "POST", {
        phone: cleanPhoneValue,
      });
      tokenPhone.value = data.token_id;
      // console.log(token)
      startCountdown();
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      validFormPhone.value = false;
      validFormCode.value = true;
      startCountdown();
    }
  }
}

async function newCode() {
  try {
    const { data } = await $api("/auth/reset-code", "GET");
    // tokenPhone.value = data.token_id
    // // console.log(token)
    // startCountdown()
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    startCountdown();
  }
}

async function formCode(
  isValid: boolean = false,
  codeValue: string | undefined
) {
  try {
    await signIn(
      { code: codeValue, token_id: tokenPhone.value },
      {
        external: false,
        callbackUrl: subscribe.value
          ? "/login"
          : newAdv.value
          ? "/cabinet/new"
          : "/cabinet",
      }
    );
  } catch (e) {
    console.log(e);
    errorCode.value = true;
    throw e;
  } finally {
    if (!errorCode.value) {
      validFormCode.value = false;
      drawer.value = false;
    }
  }
}

function onSubscribe(statusAuth: string) {
  switch (statusAuth) {
    case "unauthenticated":
      return;
    case "authenticated":
      return;
  }
}

onMounted(() => {
  onSubscribe(route.query.statusAuth);
  subscribe.value = Boolean(route.query?.subscribe);
  newAdv.value = Boolean(route.query?.new);
  drawer.value = !token.value;
  // if (subscribe.value === true && status) {
  //   console.log('Подписка!!! api');
  // }
});

//countDown start
const countdownTime = 30; // Время обратного отсчета в секундах
const timer = ref(countdownTime);
const isDisabled = ref(false);
const intervalId = ref(null);

const buttonText = computed(() => {
  if (isDisabled.value) {
    const minutes = Math.floor(timer.value / 60);
    const seconds = timer.value % 60;
    return `Получить новый код ${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }
  return "Получить новый код";
});

const startCountdown = () => {
  if (isDisabled.value) return;

  isDisabled.value = true;
  timer.value = countdownTime;

  intervalId.value = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) {
      clearInterval(intervalId.value);
      isDisabled.value = false;
    }
  }, 1000);
};
//countDown finish
</script>

<template>
  <v-overlay v-model="drawer" height="100%" width="100%">
    <v-navigation-drawer
      v-model="drawer"
      class="w-100 h-100 login__drawer"
      location="top"
      style="top: 0"
    >
      <v-toolbar
        @click="$router.push(localePath('/advertisement/list'))"
        color="white"
      >
        <v-container class="d-flex align-center justify-start">
          <v-img
            src="/svgIcon/arrow-left.svg"
            cover
            max-width="7"
            height="12"
            class="ml-4 mr-5"
          />
          <h3 class="text-body-1">{{ $t("go_back") }}</h3>
        </v-container>
      </v-toolbar>

      <v-container
        class="login__drawer__container d-flex justify-center align-center flex-column"
      >
        <div class="login__drawer__content">
          <h3 class="text-h6 mb-5">{{ $t("Turaq") }}</h3>

          <v-form
            ref="phoneForm"
            @submit.prevent="formPhone($refs.phoneForm.isValid, phone)"
            v-if="validFormPhone"
          >
            <p v-if="subscribe" class="mb-7">
              {{ $t("phone-for-login-and-subscribe") }}
            </p>
            <p v-else class="mb-7">
              {{ $t("phone-for-login") }}
            </p>
            <v-text-field
              class="mb-4"
              single-line
              color="primary"
              variant="outlined"
              v-model="phone"
              :rules="[
                (v) => !!v || $t('enter-phone'),
                (v) =>
                  (v && v.replace(/\D/g, '').length === 11) ||
                  $t('enter-phone'),
              ]"
              v-mask="{ mask: '+7 (###) ###-##-##' }"
            />
            <v-btn
              class="text-none mb-5"
              color="primary"
              block
              size="x-large"
              rounded="lg"
              type="submit"
            >
              {{ subscribe ? $t("continue") : $t("enter") }}
            </v-btn>
            <p
              class="login__drawer__content-rules text-body-2 opacity-80"
              style="color: #1c1c1c"
            >
              {{ $t("agree-with") }}
              <a href="#" style="color: currentColor" class="">{{
                $t("terms-of-use")
              }}</a>
            </p>
          </v-form>
          <v-form
            ref="codeForm"
            @submit.prevent="formCode($refs.codeForm.isValid, code)"
            v-if="validFormCode"
          >
            <p class="mb-4">
              {{ $t("enter-code") }}
            </p>
            <v-otp-input
              :length="6"
              v-model="code"
              :error="errorCode"
              rounded="xl"
              height="69"
            />
            <span v-if="errorCode" class="d-inline-block text-error">{{
              $t("invalid-code")
            }}</span>
            <v-btn
              class="text-none text-body-1 mt-8"
              color="primary"
              block
              size="x-large"
              :disabled="code?.length !== 6"
              rounded="lg"
              type="submit"
            >
              {{ $t("send") }}
            </v-btn>
            <v-btn
              class="text-none text-body-1 mt-4"
              color="primary"
              variant="tonal"
              block
              size="x-large"
              :disabled="isDisabled"
              rounded="lg"
              @click="newCode"
              type="button"
            >
              {{ buttonText }}
            </v-btn>
          </v-form>
        </div>
      </v-container>
    </v-navigation-drawer>
  </v-overlay>
  <section class="login__section" v-if="!drawer && subscribe">
    <v-container class="d-flex flex-column justify-center align-center">
      <v-sheet class="login__section__sheet bg-transparent">
        <h3 class="mb-7 text-h6">{{ $t("ready") }}</h3>
        <p class="mb-16 pb-4">{{ $t("subscribe-is-ready") }}</p>
        <v-btn
          elevation="0"
          color="chip-card"
          class="text-none text-primary"
          rounded="lg"
          size="x-large"
          block
          @click="$router.push(localePath('/'))"
          >{{ $t("go-index-page") }}</v-btn
        >
      </v-sheet>
    </v-container>
  </section>
</template>

<style lang="scss">
.login__drawer {
  &__container {
    height: 90vh;
  }
  &__content {
    max-width: 272px;
    width: 100%;
    .v-otp-input__content {
      gap: 16px;
      padding: 0.5rem 0;
    }
    .v-otp-input {
      .v-field {
        border-radius: 8px;
      }
    }
    &-rules {
    }
  }
}
.login__section {
  .v-container {
    height: 100vh;
  }
  &__sheet {
    max-width: 272px;
  }
}
</style>
