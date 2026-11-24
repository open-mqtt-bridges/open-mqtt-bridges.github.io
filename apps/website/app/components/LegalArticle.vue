<template>
  <UContainer class="page-width max-w-3xl py-14 sm:py-20">
    <UPageHeader :title="title" :description="description" />
    <article class="legal-content mt-10">
      <slot />
    </article>
  </UContainer>
</template>

<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>
