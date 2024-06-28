<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useApi } from "~/composables/api";
import { useRouter } from "vue-router";
import { advPriceTariffType, statusChip } from "~/utilities/helper";

definePageMeta({ middleware: "auth" });

const router = useRouter();
const { $api } = useApi();
const { signOut, data } = useAuth();

const userData = ref();
const advertisements = ref();
const nameUser = ref<string>();
const loading = ref(false);
const timeout = ref(null);
const validationError = ref("");

const logout = async () => {
  try {
    await signOut();
  } catch (error) {
    localStorage.clear();
    router.push("/");
  }
};

function splitNameSurname(fullName: string) {
  const parts = fullName.trim().split(" ");
  return {
    name: parts[0] || "",
    surname: parts.slice(1).join(" ") || "",
  };
}

async function updateNameUser() {
  if (!nameUser.value) {
    validationError.value = "enter-your-fio-error";
    return;
  }
  const { name, surname } = splitNameSurname(nameUser.value);
  if (!name || !surname) {
    validationError.value = "enter-your-fio-error";
    return;
  }
  validationError.value = ""; // очистить ошибку, если все в порядке
  await $api("/profile/update", "POST", { name, surname });
}

watch(nameUser, (newVal, oldVal) => {
  if (oldVal === undefined) return;
  clearTimeout(timeout.value);

  timeout.value = setTimeout(async () => {
    await updateNameUser();
  }, 500);
});

onMounted(async () => {
  try {
    loading.value = true;
    const advertisementsData = await $api("/advertisements/my");
    advertisements.value = advertisementsData.data;
    userData.value = data?.value?.data;
    nameUser.value =
      userData.value.name && userData.value.surname
        ? `${userData.value.name} ${userData.value.surname}`
        : "";
    loading.value = false;
  } catch (error) {
    console.log(error);
    loading.value = false;
  }
});
</script>

<template>
  <v-main class="cabinet">
    <section class="cabinet__profile mb-0">
      <v-container>
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h6">{{ $t("personal-account") }}</h1>
          <v-btn @click="logout()" color="error" variant="outlined">{{
            $t("exit")
          }}</v-btn>
        </div>

        <v-sheet
          v-if="loading"
          color="white"
          rounded="12"
          min-height="87"
          :width="'100%'"
          class="d-flex align-end pa-4"
        >
          <v-skeleton-loader type="avatar"></v-skeleton-loader>
        </v-sheet>
        <v-sheet
          v-else
          color="white"
          rounded="12"
          min-height="87"
          :width="'100%'"
          class="d-flex align-end pa-4"
        >
          <v-img
            :src="'/cabinet/no-foto.png'"
            max-width="55"
            min-width="55"
            height="55"
            cover
            class="mr-4"
          />
          <div class="d-flex flex-column w-100">
            <span>id{{ userData?.phone }}</span>
            <input
              type="text"
              :placeholder="$t('enter-your-fio')"
              class="cabinet__profile-input"
              v-model="nameUser"
            />
            <transition name="fade" mode="out-in">
              <span class="error-message" v-if="validationError">{{
                $t(validationError)
              }}</span>
            </transition>
          </div>
        </v-sheet>
      </v-container>
    </section>

    <v-container v-if="loading">
      <v-skeleton-loader type="card, card, card, card"></v-skeleton-loader>
    </v-container>
    <section class="cabinet__not-advs" v-else-if="!advertisements?.length">
      <v-container>
        <h2 class="text-h6 mb-4">{{ $t("my-advertisements") }}</h2>
        <v-sheet
          class="pa-4 d-flex flex-column justify-space-between"
          height="236"
          rounded="12"
        >
          <p class="mb-2">{{ $t("post-your-first-ad") }}</p>
          <v-btn
            size="x-large"
            color="primary"
            rounded="lg"
            elevation="0"
            class="text-none"
            @click="$router.push(localePath('/cabinet/new'))"
          >
            <v-img src="/svgIcon/add.svg" width="20" height="20" class="mr-2" />
            {{ $t("create-advertisement") }}
          </v-btn>
        </v-sheet>
      </v-container>
    </section>
    <section class="cabinet__advs" v-else>
      <v-container>
        <h2 class="text-h6 mb-4">{{ $t("my-advertisements") }}</h2>
        <v-sheet
          v-for="(adv, index) in advertisements"
          :key="`adv-${index}`"
          color="white"
          width="100%"
          min-height="143"
          rounded="12"
          class="pa-4 d-flex align-start mb-3"
          @click="$router.push(localePath(`/advertisement/my/${adv.slug}`))"
        >
          <v-img
            v-if="adv.media[0] && adv.media[0]?.media_url"
            :src="
              adv.media[0]?.media_url
                ? adv.media[0]?.media_url
                : '/no_image.jpeg'
            "
            min-width="89"
            max-width="89"
            height="89"
            cover
            class="mr-4"
            rounded="12"
          >
            <template v-slot:error>
              <v-img
                height="89"
                width="89"
                cover
                src="/no_image.jpeg"
                class="error-image"
              ></v-img>
            </template>
          </v-img>
          <div class="d-flex flex-column align-start">
            <span class="text-body-2 mb-2">{{ adv.name }}</span>
            <span v-if="adv?.city" class="text-body-2 mb-2 text-gray">{{
              adv?.city?.name
            }}</span>
            <span class="text-body-2 mb-2 text-gray"
              >{{ new Intl.NumberFormat("kk-KZ").format(adv.price) }} ₸
              {{
                adv?.tariff_type?.id &&
                "/" + $t(advPriceTariffType(adv?.tariff_type?.id))
              }}</span
            >
            <v-chip
              :color="statusChip(adv.status).color"
              class="rounded"
              elevation="0"
              :variant="statusChip(adv.status).variant"
            >
              <v-img
                :src="statusChip(adv.status).icon"
                width="18"
                height="18"
                class="mr-2"
              />
              <span
                :class="`status-card-${adv.status}`"
                class="text-black text-caption"
                >{{ $t(statusChip(adv.status).text) }}</span
              >
            </v-chip>
          </div>
        </v-sheet>
        <v-btn
          size="x-large"
          color="primary"
          rounded="lg"
          elevation="0"
          class="text-none mt-4 w-100"
          @click="$router.push(localePath('/cabinet/new'))"
        >
          <v-img
            src="/svgIcon/add-white.svg"
            width="20"
            height="20"
            class="mr-2"
          />
          {{ $t("create-advertisement") }}
        </v-btn>
      </v-container>
    </section>
  </v-main>
</template>

<style lang="scss">
.cabinet {
  background: #eeecec;
  &__advs {
    .status-card-archive {
      opacity: 0.4;
    }
  }
  &__profile {
    position: relative;
    &-input {
      color: #b5b5b5;
      &:focus {
        background-color: transparent;
        outline: none;
      }
      &::placeholder {
        color: #b5b5b5;
      }
    }
    .fade-enter-active,
    .fade-leave-active {
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .fade-enter-from,
    .fade-leave-to {
      opacity: 0;
      transform: translateY(-10px);
    }
    .fade-enter-to,
    .fade-leave-from {
      opacity: 1;
      transform: translateY(0);
    }
    .error-message {
      position: absolute;
      color: rgb(var(--v-theme-error));
      font-size: 12px;
      bottom: 16px;
    }
  }
}
</style>
