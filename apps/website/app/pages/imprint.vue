<template>
  <LegalArticle title="Imprint" description="Publisher information for the Open MQTT Bridges website.">
    <section>
      <h2>Service provider</h2>
      <p>Information pursuant to Section 5 of the German Digital Services Act (DDG).</p>
      <address>Tobias Wälde<br />Sandhübel 8<br />66640 Namborn<br />Germany</address>
    </section>
    <section>
      <h2>Contact</h2>
      <p>
        Phone: <a href="tel:+4917656799893">+49 176 56799893</a><br />Email:
        <a href="mailto:business@tobiaswaelde.com">business@tobiaswaelde.com</a><br />Website:
        <a href="https://tobiaswaelde.com">tobiaswaelde.com</a>
      </p>
    </section>
    <section>
      <h2>Project information</h2>
      <p>
        Open MQTT Bridges is a directory of independent open-source integrations. Each repository documents its own
        license, supported devices, deployment requirements and security policy. Third-party product names identify the
        systems supported by those projects.
      </p>
    </section>
    <NuxtLink to="/privacy-policy">Read the privacy policy</NuxtLink>
  </LegalArticle>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Imprint — Open MQTT Bridges' });
useHead({ link: [{ rel: 'canonical', href: 'https://open-mqtt-bridges.github.io/imprint' }] });
</script>
