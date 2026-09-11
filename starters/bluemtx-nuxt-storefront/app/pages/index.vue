<script setup lang="ts">
import { createStorefrontClient } from '@bluemtx/storefront-sdk'

const config = useRuntimeConfig()
const client = createStorefrontClient({
  baseUrl: String(config.public.commerceBaseUrl),
  storeSlug: String(config.public.storeSlug),
})

const { data } = await useAsyncData('home', async () => {
  const contract = await client.getStorefrontContract()
  const catalog = await client.listCatalog({ limit: 12 })
  return { contract, catalog }
})

useSeoMeta({
  title: () => data.value?.contract?.store?.name || 'Store',
  description: () => 'BlueMTX headless storefront starter',
})
</script>

<template>
  <div style="font-family: Georgia, serif; max-width: 960px; margin: 0 auto; padding: 2rem">
    <header>
      <h1>{{ data?.contract?.store?.name }}</h1>
      <p>{{ data?.contract?.locale?.current }} · {{ data?.contract?.store?.base_currency }}</p>
    </header>
    <section>
      <h2>Catalog</h2>
      <ul>
        <li v-for="item in (data?.catalog?.items || data?.catalog || [])" :key="item.id || item.slug">
          {{ item.title || item.name || item.slug }}
        </li>
      </ul>
    </section>
  </div>
</template>
