import { useRuntimeConfig } from "nuxt/app";

export default defineI18nLocale(async (locale) => {
  const config = useRuntimeConfig().public.apiUrl;
  const { data } = await $fetch(`${config}/localizations?locale=${locale}`, {
    headers: {
      "Accept-Language": locale,
    },
  });
  const dataObject = data.reduce((acc, item) => {
    acc[item.key] = item.content;
    return acc;
  }, {});
  return dataObject;
});
