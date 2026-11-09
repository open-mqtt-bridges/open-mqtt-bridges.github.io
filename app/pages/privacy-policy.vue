<template>
  <LegalArticle
    title="Privacy policy"
    description="Last updated: November 9, 2026. Applies to this GitHub Pages website."
  >
    <section>
      <h2>Controller and contact</h2>
      <address>
        Tobias Wälde<br />Sandhübel 8<br />66640 Namborn<br />Germany<br /><a href="mailto:business@tobiaswaelde.com"
          >business@tobiaswaelde.com</a
        >
      </address>
      <p>Further contact information is available in the <NuxtLink to="/imprint">imprint</NuxtLink>.</p>
    </section>
    <section>
      <h2>Hosting and technical requests</h2>
      <p>
        This website is hosted by GitHub Pages. GitHub states that visitors’ IP addresses are logged and stored for
        security purposes, whether or not they are signed in. Delivering pages also requires technical request data,
        such as the requested URL and browser connection information. The website operator does not run a separate
        application server or visitor analytics service.
      </p>
      <p>
        Our purpose is to provide a reliable, secure public project website. Where processing is our responsibility, the
        legal basis is our legitimate interest under Article 6(1)(f) GDPR. GitHub processes hosting data under its
        applicable terms and privacy statement; GitHub controls its own logging and retention, which we do not set.
      </p>
      <p>
        See
        <a href="https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages"
          >GitHub Pages data collection</a
        >
        and the
        <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
          >GitHub Privacy Statement</a
        >
        for provider identity, recipients, international processing, safeguards and retention information. Processing
        may occur outside the European Economic Area, including in the United States.
      </p>
    </section>
    <section>
      <h2>Local preferences and search</h2>
      <p>
        The color-mode control stores your display preference in your browser’s local storage under
        <code>omb-color-mode</code>. It lets the site remember system, light or dark mode and is not used for tracking.
        The preference stays in your browser until you clear site data or change it. Processing serves the requested
        display function; the applicable basis is Article 6(1)(f) GDPR and, where strictly necessary for a service you
        explicitly request, Section 25(2)(2) TDDDG.
      </p>
      <p>
        Bridge search runs locally against the included catalog. Search text is not sent to a search provider or
        backend. This site does not add advertising, analytics, account cookies, externally loaded fonts or embedded
        third-party media. Icons and branding are served with the website. GitHub’s hosting practices are described
        separately above.
      </p>
    </section>
    <section>
      <h2>Email contact and external links</h2>
      <p>
        If you contact us by email, we process the contact details and message you provide to handle your request.
        Depending on its purpose, the basis is Article 6(1)(b) or Article 6(1)(f) GDPR. We retain correspondence only as
        needed to handle the matter or meet applicable legal retention obligations; access is limited to the handling of
        your request.
      </p>
      <p>
        Links to GitHub repositories, documentation and other websites take you to services with their own privacy
        policies. Following a link sends a request to that destination. Do not include credentials or personal device
        data in public issues.
      </p>
    </section>
    <section>
      <h2>Your rights</h2>
      <p>
        Subject to the GDPR’s conditions, you may request access, rectification, erasure, restriction of processing and
        data portability. You may object to processing based on legitimate interests for reasons arising from your
        situation. Where processing is based on consent, you may withdraw it for the future.
      </p>
      <p>
        Contact the controller above to exercise your rights. You may also complain to a competent data-protection
        supervisory authority, including the
        <a href="https://www.datenschutz.saarland.de/">Independent Data Protection Center Saarland</a>. The GDPR is
        available in the <a href="https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng">official EU text</a>.
      </p>
    </section>
  </LegalArticle>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Privacy policy — Open MQTT Bridges' });
useHead({ link: [{ rel: 'canonical', href: 'https://open-mqtt-bridges.github.io/privacy-policy' }] });
</script>
