// SEO Audit Content Script
// This script analyzes the page and stores SEO data

function analyzePage() {
  const seoData = {
    url: window.location.href,
    timestamp: new Date().toISOString(),

    // Meta Tags Analysis
    meta: {
      title: document.title,
      titleLength: document.title.length,
      description: document.querySelector('meta[name="description"]')?.content || 'Not found',
      descriptionLength: document.querySelector('meta[name="description"]')?.content?.length || 0,
      keywords: document.querySelector('meta[name="keywords"]')?.content || 'Not found',
      viewport: document.querySelector('meta[name="viewport"]')?.content || 'Not found',
      charset: document.characterSet || 'Not found',
      language: document.documentElement.lang || 'Not specified'
    },

    // Header Structure
    headers: {
      h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
      h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()),
      h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim()),
      h4: Array.from(document.querySelectorAll('h4')).map(h => h.textContent.trim()),
      h5: Array.from(document.querySelectorAll('h5')).map(h => h.textContent.trim()),
      h6: Array.from(document.querySelectorAll('h6')).map(h => h.textContent.trim())
    },

    // Link Analysis
    links: analyzeLinkStructure(),

    // Image Analysis
    images: analyzeImages(),

    // Page Speed Metrics
    performance: getPerformanceMetrics(),

    // Canonical Tag
    canonical: {
      url: document.querySelector('link[rel="canonical"]')?.href || 'Not found',
      exists: !!document.querySelector('link[rel="canonical"]')
    },

    // Robots Meta Tags
    robots: {
      content: document.querySelector('meta[name="robots"]')?.content || 'Not specified',
      noindex: document.querySelector('meta[name="robots"]')?.content?.includes('noindex') || false,
      nofollow: document.querySelector('meta[name="robots"]')?.content?.includes('nofollow') || false
    },

    // Open Graph Tags
    openGraph: {
      title: document.querySelector('meta[property="og:title"]')?.content || 'Not found',
      description: document.querySelector('meta[property="og:description"]')?.content || 'Not found',
      image: document.querySelector('meta[property="og:image"]')?.content || 'Not found',
      url: document.querySelector('meta[property="og:url"]')?.content || 'Not found'
    },

    // Twitter Card
    twitter: {
      card: document.querySelector('meta[name="twitter:card"]')?.content || 'Not found',
      title: document.querySelector('meta[name="twitter:title"]')?.content || 'Not found',
      description: document.querySelector('meta[name="twitter:description"]')?.content || 'Not found'
    },

    // Schema.org structured data
    structuredData: analyzeStructuredData(),

    // Word count
    wordCount: document.body.innerText.split(/\s+/).filter(word => word.length > 0).length
  };

  return seoData;
}

function analyzeLinkStructure() {
  const links = Array.from(document.querySelectorAll('a[href]'));
  const currentDomain = window.location.hostname;

  const linkData = {
    total: links.length,
    internal: 0,
    external: 0,
    nofollow: 0,
    dofollow: 0,
    broken: [],
    externalLinks: []
  };

  links.forEach(link => {
    const href = link.href;
    const rel = link.rel || '';

    // Check if internal or external
    try {
      const linkUrl = new URL(href);
      if (linkUrl.hostname === currentDomain) {
        linkData.internal++;
      } else {
        linkData.external++;
        linkData.externalLinks.push({
          url: href,
          text: link.textContent.trim().substring(0, 50),
          nofollow: rel.includes('nofollow')
        });
      }
    } catch (e) {
      // Relative URL - internal
      linkData.internal++;
    }

    // Check nofollow/dofollow
    if (rel.includes('nofollow')) {
      linkData.nofollow++;
    } else {
      linkData.dofollow++;
    }

    // Check for empty href or just #
    if (!href || href === '#' || href === 'javascript:void(0)') {
      linkData.broken.push(link.textContent.trim() || 'Empty link');
    }
  });

  return linkData;
}

function analyzeImages() {
  const images = Array.from(document.querySelectorAll('img'));

  const imageData = {
    total: images.length,
    withAlt: 0,
    withoutAlt: 0,
    missingAltImages: []
  };

  images.forEach(img => {
    const alt = img.alt;
    if (alt && alt.trim() !== '') {
      imageData.withAlt++;
    } else {
      imageData.withoutAlt++;
      imageData.missingAltImages.push({
        src: img.src.substring(img.src.lastIndexOf('/') + 1) || 'inline image',
        width: img.width,
        height: img.height
      });
    }
  });

  return imageData;
}

function getPerformanceMetrics() {
  const perfData = performance.getEntriesByType('navigation')[0];

  if (!perfData) {
    return {
      available: false,
      message: 'Performance data not available'
    };
  }

  return {
    available: true,
    domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
    loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
    domInteractive: Math.round(perfData.domInteractive - perfData.fetchStart),
    transferSize: perfData.transferSize ? Math.round(perfData.transferSize / 1024) : 'N/A',
    requestStart: Math.round(perfData.requestStart - perfData.fetchStart)
  };
}

function analyzeStructuredData() {
  const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));

  if (scripts.length === 0) {
    return {
      found: false,
      count: 0
    };
  }

  const structuredDataTypes = [];
  scripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent);
      if (data['@type']) {
        structuredDataTypes.push(data['@type']);
      } else if (Array.isArray(data)) {
        data.forEach(item => {
          if (item['@type']) {
            structuredDataTypes.push(item['@type']);
          }
        });
      }
    } catch (e) {
      // Invalid JSON
    }
  });

  return {
    found: true,
    count: scripts.length,
    types: structuredDataTypes
  };
}

// Store the analysis results
window.seoAuditData = analyzePage();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSEOData') {
    sendResponse(window.seoAuditData);
  }
  return true;
});
