// Reusable SEO module for Toppers Point
// Usage:
// import { applySEO } from '/js/seo.js';
// applySEO({ title, description, path, imageAbsolute, robots });
// - path: e.g. '/', '/contact.html' (will be prefixed with SITE_URL)
// - imageAbsolute: absolute URL to image; if omitted uses SITE_URL + '/images/logo.png'
// - robots: e.g. 'index, follow' or 'noindex, nofollow' (optional)

const SITE_URL = 'https://topperspoint.in';

function ensureTag(selector, createEl) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = createEl();
    document.head.appendChild(el);
  }
  return el;
}

function setMetaByName(name, content) {
  if (!content) return;
  const el = ensureTag(`meta[name="${name}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute('name', name);
    return m;
  });
  el.setAttribute('content', content);
}

function setMetaByProp(prop, content) {
  if (!content) return;
  const el = ensureTag(`meta[property="${prop}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute('property', prop);
    return m;
  });
  el.setAttribute('content', content);
}

function setCanonical(url) {
  const el = ensureTag('link[rel="canonical"]', () => {
    const l = document.createElement('link');
    l.setAttribute('rel', 'canonical');
    return l;
  });
  el.setAttribute('href', url);
}

function setTitle(title) {
  if (!title) return;
  document.title = title;
}

function setJSONLD(data) {
  if (!data) return;
  let el = document.head.querySelector('script[type="application/ld+json"][data-seo-generated="1"]');
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-seo-generated', '1');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function applySEO({ title, description, path = '/', imageAbsolute, robots } = {}) {
  const pageUrl = new URL(path || '/', SITE_URL).toString();
  const imageUrl = imageAbsolute || `${SITE_URL}/images/logo.png`;

  setTitle(title || document.title || 'Toppers Point Coaching');
  setCanonical(pageUrl);

  // Basic meta
  if (description) setMetaByName('description', description);
  if (robots) setMetaByName('robots', robots);

  // Open Graph
  setMetaByProp('og:type', 'website');
  if (title) setMetaByProp('og:title', title);
  if (description) setMetaByProp('og:description', description);
  setMetaByProp('og:url', pageUrl);
  setMetaByProp('og:image', imageUrl);

  // Twitter
  setMetaByName('twitter:card', 'summary_large_image');
  if (title) setMetaByName('twitter:title', title);
  if (description) setMetaByName('twitter:description', description);
  setMetaByName('twitter:image', imageUrl);

  // JSON-LD (EducationalOrganization)
  setJSONLD({
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Toppers Point Coaching',
    url: pageUrl,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/images/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Toppers Point Bajarnag colony near sony ladge Ashta (M.P)',
      addressLocality: 'Ashta',
      addressRegion: 'MP',
      addressCountry: 'IN'
    },
    telephone: '+91 7869703381',
    sameAs: [
      'https://www.instagram.com/toppers_point_coaching_ashta/?__pwa=1#',
      'https://www.facebook.com/mewadajai777',
      'https://wa.me/917869703381'
    ]
  });
}
