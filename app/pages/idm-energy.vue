<template>
  <UContainer class="page-width max-w-3xl py-14 sm:py-20">
    <UPageHeader title="IDM Energy" description="Archived bridge for IDM heat pumps" />
    <article class="legal-content mt-10">
      <section>
        <h2>What this bridge did</h2>
        <p>
          The bridge read information from an IDM heat pump controller and sent it to MQTT, a messaging system often
          used by home automation tools. It shared readings such as energy use and accepted some commands, including
          changes to the hot-water temperature.
        </p>
      </section>
      <section>
        <h2>Archive status</h2>
        <p>
          This project is archived and no longer maintained. The original setup instructions are available for
          historical reference, not as a recommendation for new installations.
        </p>
        <a href="https://github.com/open-mqtt-bridges/idm-energy#readme">Read the original documentation on GitHub</a>
      </section>
      <NuxtLink to="/">Browse all bridges</NuxtLink>
    </article>
  </UContainer>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'IDM Energy (archived) — Open MQTT Bridges',
  description: 'Historical documentation for the archived IDM Energy MQTT bridge.',
});
useHead({ link: [{ rel: 'canonical', href: 'https://open-mqtt-bridges.github.io/idm-energy/' }] });
</script>
