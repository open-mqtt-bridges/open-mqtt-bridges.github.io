<template>
  <div>
    <section class="hero-wrap" aria-labelledby="hero-title">
      <div class="hero-network" aria-hidden="true">
        <svg viewBox="0 0 1200 620" preserveAspectRatio="xMidYMid slice">
          <g class="network-track">
            <path
              d="M40 160H250L390 310H810L950 160H1160M0 425H240L390 310M1200 425H960L810 310M210 600V510L390 310M990 600V510L810 310M600 40V580"
            />
          </g>
          <g class="network-point">
            <rect x="16" y="136" width="48" height="48" rx="12" />
            <rect x="1136" y="136" width="48" height="48" rx="12" />
            <rect x="16" y="401" width="48" height="48" rx="12" />
            <rect x="1136" y="401" width="48" height="48" rx="12" />
            <rect x="186" y="552" width="48" height="48" rx="12" />
            <rect x="966" y="552" width="48" height="48" rx="12" />
          </g>
          <g class="network-signal">
            <circle cx="40" cy="160" r="5" />
            <circle cx="1160" cy="160" r="5" />
            <circle cx="40" cy="425" r="5" />
            <circle cx="1160" cy="425" r="5" />
          </g>
        </svg>
      </div>
      <UPageHero
        description="Lighting, appliances, networks and data. Open-source bridges that connect the hardware and services you use through MQTT."
        :ui="{ container: 'page-width py-20 sm:py-28', description: 'max-w-3xl mx-auto', title: 'hero-title' }"
      >
        <template #headline>
          <UBadge
            label="OPEN SOURCE · MQTT NATIVE"
            color="primary"
            variant="subtle"
            class="rounded-full px-4 py-2 text-[10px] tracking-widest"
          />
        </template>
        <template #title>
          <span id="hero-title">Your devices.<br /><span class="text-primary">One language.</span></span>
        </template>
        <template #links>
          <UButton to="#bridges" label="Explore bridges" trailing-icon="i-lucide-arrow-right" size="xl" />
          <UButton
            to="https://github.com/open-mqtt-bridges"
            label="View on GitHub"
            icon="i-lucide-github"
            color="neutral"
            variant="outline"
            size="xl"
          />
        </template>
        <template #bottom>
          <div class="relative -mt-10 pb-16 text-center sm:-mt-14">
            <p class="text-xs text-muted">Your setup stays yours. MQTT brings the connection.</p>
            <div class="mt-6 flex flex-wrap justify-center gap-2" aria-label="Bridge categories">
              <UBadge
                v-for="category in ['Lighting', 'Appliances', 'Networks', 'Data']"
                :key="category"
                color="neutral"
                variant="subtle"
                :label="category"
              />
            </div>
          </div>
        </template>
      </UPageHero>
    </section>

    <UContainer id="bridges" class="page-width border-t border-default py-14 sm:py-20" aria-labelledby="bridges-title">
      <div class="flex justify-between gap-4 text-xs">
        <p class="eyebrow">FIND YOUR CONNECTION</p>
        <span class="text-muted">09 active · 01 archived</span>
      </div>
      <div class="mt-5 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <h2 id="bridges-title" class="section-title">A bridge for your setup.</h2>
          <p class="mt-4 max-w-xl text-sm leading-7 text-muted">
            Find the devices and services you use. Their documentation gets you started.
          </p>
        </div>
        <form v-show="hydrated" class="w-full md:max-w-xs" role="search" data-search-form @submit.prevent>
          <label for="bridge-search" class="mb-2 block text-xs text-muted">Find a bridge</label>
          <UInput
            v-model="query"
            id="bridge-search"
            type="search"
            icon="i-lucide-search"
            placeholder="Try lighting, Modbus, data…"
            autocomplete="off"
            class="w-full"
            aria-controls="bridge-grid"
          />
          <UButton
            v-if="query.trim()"
            label="Clear search"
            color="neutral"
            variant="link"
            class="mt-2 px-0"
            @click="clearSearch"
          />
        </form>
      </div>
      <p class="mb-6 mt-5 text-xs text-muted" aria-live="polite" aria-atomic="true">
        {{ query.trim() ? `${visibleBridges.length} of ${bridgeCount} bridges` : `${bridgeCount} bridges to explore` }}
      </p>
      <UPageGrid id="bridge-grid">
        <UPageCard
          v-for="bridge in visibleBridges"
          :key="bridge.slug"
          as="article"
          variant="subtle"
          :description="bridge.description"
          data-bridge
          :data-bridge-slug="bridge.slug"
          :ui="{ container: 'h-full', wrapper: 'h-full flex flex-col', footer: 'mt-auto pt-5' }"
        >
          <template #header>
            <div class="flex items-center gap-3">
              <span class="grid size-10 place-items-center rounded-lg bg-primary/10 font-mono text-xs text-primary">{{
                bridge.initials
              }}</span>
              <span class="text-xs text-muted">{{ bridge.category }}</span>
            </div>
          </template>
          <template #title>
            <h3 class="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight">
              {{ bridge.name }}
              <UBadge v-if="bridge.archived" label="Archived" color="warning" variant="subtle" size="sm" />
            </h3>
          </template>
          <template #footer>
            <div class="flex justify-between gap-3 border-t border-default pt-4 text-xs">
              <a
                class="text-primary hover:underline"
                :href="bridge.documentation"
                :aria-label="`${bridge.name} ${bridge.documentationType === 'readme' ? 'README documentation' : 'documentation'}`"
                >{{ bridge.documentationType === 'readme' ? 'README docs' : 'Documentation' }}
                <span aria-hidden="true">↗</span></a
              >
              <a
                class="text-muted hover:text-highlighted"
                :href="bridge.repository"
                :aria-label="`${bridge.name} on GitHub`"
                >GitHub <span aria-hidden="true">↗</span></a
              >
            </div>
          </template>
        </UPageCard>
      </UPageGrid>
      <UAlert
        v-if="!visibleBridges.length"
        title="No matching bridges"
        description="Try a device name or a broader category."
        color="neutral"
        variant="subtle"
        class="mt-6"
      />
      <p class="mt-6 text-xs leading-6 text-muted">
        “README docs” links to documentation in the repository. Archived projects remain available as historical
        references.
      </p>
    </UContainer>

    <UPageSection
      title="Fits into your infrastructure."
      description="Each bridge has its own configuration and MQTT contract. Your broker is the common connection."
      :ui="{ container: 'page-width', title: 'section-title' }"
    >
      <UPageGrid>
        <UPageCard
          v-for="step in steps"
          :key="step.title"
          variant="outline"
          :title="step.title"
          :description="step.description"
          :icon="step.icon"
        />
      </UPageGrid>
    </UPageSection>

    <UContainer class="page-width max-w-3xl pb-20">
      <h2 class="section-title mb-8 text-center">A few things worth knowing.</h2>
      <details v-for="question in questions" :key="question.title" class="border-b border-default py-5">
        <summary class="cursor-pointer text-sm font-semibold">{{ question.title }}</summary>
        <p class="mt-4 text-sm leading-8 text-muted">{{ question.answer }}</p>
      </details>
    </UContainer>

    <UContainer id="contribute" class="page-width pb-20">
      <UPageCTA
        title="Make the next connection."
        description="Improve a bridge, sharpen the docs, or bring a new idea. Small contributions make a more connected setup."
        variant="subtle"
        :links="[
          {
            label: 'Get involved',
            to: 'https://github.com/open-mqtt-bridges/.github/blob/main/CONTRIBUTING.md',
            trailingIcon: 'i-lucide-arrow-right',
          },
        ]"
      />
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import catalog from '../../bridges.json';
import { filterBridges } from '#shared/bridges';

const bridgeCount = catalog.length;
const query = ref('');
const hydrated = ref(false);
const visibleBridges = computed(() => filterBridges(catalog, query.value));
onMounted(() => {
  hydrated.value = true;
});

/** Reset local results and restore the keyboard user's search focus. */
function clearSearch(): void {
  query.value = '';
  nextTick(() => document.getElementById('bridge-search')?.focus());
}

const steps = [
  {
    title: 'Choose your bridge',
    description: 'Open its documentation for supported devices, authentication and deployment instructions.',
    icon: 'i-lucide-plug',
  },
  {
    title: 'Connect your broker',
    description: 'Configure your MQTT connection and the device or service you want to bring into your setup.',
    icon: 'i-lucide-network',
  },
  {
    title: 'Build your automations',
    description: 'Use the documented topics, state updates and available commands in your own MQTT tools.',
    icon: 'i-lucide-workflow',
  },
];
const questions = [
  {
    title: 'What do I need to get started?',
    answer:
      'An MQTT broker, a supported device or service, and the configuration described in your chosen bridge’s documentation. Deployment requirements vary by project.',
  },
  {
    title: 'Do all bridges use the same configuration?',
    answer:
      'No. Each bridge documents its own configuration, topics, payloads and command behavior. Start with its documentation before building automations.',
  },
  {
    title: 'Are all bridges actively maintained?',
    answer:
      'Nine projects are active. IDM Energy is archived and remains listed as a historical reference. Each repository’s license and security policy apply independently.',
  },
];
useSeoMeta({
  title: 'Open MQTT Bridges — Your devices. One language.',
  description: 'Discover open-source MQTT bridges for lighting, appliances, networks and data.',
});
useHead({ link: [{ rel: 'canonical', href: 'https://open-mqtt-bridges.github.io/' }] });
</script>
