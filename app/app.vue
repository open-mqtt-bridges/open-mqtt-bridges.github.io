<template>
  <UApp>
    <a href="#main" class="skip-link">Skip to content</a>
    <UHeader :toggle="false" :ui="{ container: 'page-width' }">
      <template #left>
        <NuxtLink to="/" class="brand" aria-label="Open MQTT Bridges home">
          <img src="/assets/logo.svg" width="36" height="36" alt="" />
          <span>Open MQTT Bridges</span>
        </NuxtLink>
      </template>
      <nav class="hidden items-center gap-7 text-sm text-muted md:flex" aria-label="Main navigation">
        <NuxtLink to="/#bridges" class="hover:text-highlighted">Bridges</NuxtLink>
        <NuxtLink to="/#contribute" class="hover:text-highlighted">Contribute</NuxtLink>
      </nav>
      <template #right>
        <UColorModeButton />
        <UButton
          to="https://github.com/open-mqtt-bridges"
          icon="i-lucide-github"
          color="neutral"
          variant="ghost"
          aria-label="Open MQTT Bridges on GitHub"
        />
      </template>
    </UHeader>
    <UMain id="main" tabindex="-1">
      <NuxtPage />
    </UMain>
    <UFooter class="border-t border-default" :ui="{ container: 'page-width' }">
      <template #top>
        <UContainer class="page-width flex flex-col justify-between gap-8 py-10 sm:flex-row">
          <div>
            <NuxtLink to="/" class="brand text-base">Open MQTT Bridges</NuxtLink>
            <p class="mt-3 text-sm text-muted">Independent projects. Shared protocol.</p>
          </div>
          <nav class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-muted" aria-label="Footer navigation">
            <NuxtLink to="/#bridges">Bridge directory</NuxtLink>
            <a href="https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io">Website source</a>
            <NuxtLink to="/imprint">Imprint</NuxtLink>
            <NuxtLink to="/privacy-policy">Privacy policy</NuxtLink>
            <a href="https://github.com/open-mqtt-bridges/.github/blob/main/SECURITY.md">Security</a>
            <a href="https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md">Contribute</a>
          </nav>
        </UContainer>
      </template>
      <template #left>
        <p class="text-xs text-muted">Built with Nuxt UI. Made for your infrastructure.</p>
      </template>
      <template #right>
        <a
          class="font-mono text-xs text-muted hover:text-primary"
          aria-label="Website deployment version"
          :href="commitUrl"
          :data-site-version="siteVersion"
        >
          {{ siteVersion }}
        </a>
      </template>
    </UFooter>
  </UApp>
</template>

<script setup lang="ts">
const { siteVersion, siteCommit } = useRuntimeConfig().public;
const commitUrl = siteCommit
  ? `https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io/commit/${siteCommit}`
  : 'https://github.com/open-mqtt-bridges/open-mqtt-bridges.github.io';
</script>
