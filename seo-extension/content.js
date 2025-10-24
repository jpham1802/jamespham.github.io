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

function generateRecommendations(seoData) {
  const recommendations = [];

  // Priority levels: critical, high, medium, low

  // Meta Title Issues
  if (seoData.meta.titleLength === 0) {
    recommendations.push({
      priority: 'critical',
      issue: 'Missing Page Title',
      action: 'Add a unique, descriptive title to your page (30-60 characters recommended)',
      why: 'The title tag is the first thing people see in search results. Without it, your page won\'t rank well.'
    });
  } else if (seoData.meta.titleLength < 30) {
    recommendations.push({
      priority: 'high',
      issue: 'Page Title Too Short',
      action: 'Expand your title to at least 30 characters to better describe the page content',
      why: 'Short titles don\'t provide enough information to search engines and users.'
    });
  } else if (seoData.meta.titleLength > 60) {
    recommendations.push({
      priority: 'medium',
      issue: 'Page Title Too Long',
      action: 'Shorten your title to under 60 characters to prevent it from being cut off in search results',
      why: 'Google typically displays the first 50-60 characters. Longer titles get truncated with "..."'
    });
  }

  // Meta Description Issues
  if (seoData.meta.descriptionLength === 0) {
    recommendations.push({
      priority: 'critical',
      issue: 'Missing Meta Description',
      action: 'Write a compelling 120-160 character description that summarizes this page',
      why: 'The meta description appears under your title in search results. It\'s your chance to convince people to click.'
    });
  } else if (seoData.meta.descriptionLength < 120) {
    recommendations.push({
      priority: 'medium',
      issue: 'Meta Description Too Short',
      action: 'Expand your meta description to at least 120 characters',
      why: 'Longer descriptions provide more context and take up more space in search results.'
    });
  } else if (seoData.meta.descriptionLength > 160) {
    recommendations.push({
      priority: 'medium',
      issue: 'Meta Description Too Long',
      action: 'Shorten your meta description to under 160 characters',
      why: 'Descriptions longer than 160 characters will be cut off in search results.'
    });
  }

  // H1 Header Issues
  if (seoData.headers.h1.length === 0) {
    recommendations.push({
      priority: 'critical',
      issue: 'Missing H1 Heading',
      action: 'Add one H1 heading to your page that describes the main topic',
      why: 'The H1 tells both users and search engines what the page is about. Every page needs exactly one.'
    });
  } else if (seoData.headers.h1.length > 1) {
    recommendations.push({
      priority: 'high',
      issue: 'Multiple H1 Headings',
      action: 'Use only one H1 heading per page. Change the others to H2 or H3',
      why: 'Multiple H1s confuse search engines about which topic is most important.'
    });
  }

  // Image Alt Text Issues
  if (seoData.images.withoutAlt > 0) {
    const percentage = Math.round((seoData.images.withoutAlt / seoData.images.total) * 100);
    if (percentage > 50) {
      recommendations.push({
        priority: 'high',
        issue: `${seoData.images.withoutAlt} Images Missing Alt Text`,
        action: 'Add descriptive alt text to all images',
        why: 'Alt text helps visually impaired users and helps Google understand what your images show. This improves accessibility and SEO.'
      });
    } else {
      recommendations.push({
        priority: 'medium',
        issue: `${seoData.images.withoutAlt} Images Missing Alt Text`,
        action: 'Add descriptive alt text to the remaining images',
        why: 'Alt text improves accessibility and helps search engines understand your images.'
      });
    }
  }

  // Canonical URL Issues
  if (!seoData.canonical.exists) {
    recommendations.push({
      priority: 'medium',
      issue: 'Missing Canonical URL',
      action: 'Add a canonical tag to tell search engines the preferred version of this page',
      why: 'Without it, search engines might index duplicate versions of your page (www vs non-www, http vs https).'
    });
  }

  // Noindex Warning
  if (seoData.robots.noindex) {
    recommendations.push({
      priority: 'critical',
      issue: 'Page is Blocked from Search Engines',
      action: 'Remove the "noindex" tag if you want this page to appear in Google search results',
      why: 'This page is currently invisible to search engines. If this is intentional, you can ignore this.'
    });
  }

  // Open Graph Issues
  if (seoData.openGraph.title === 'Not found' && seoData.openGraph.description === 'Not found') {
    recommendations.push({
      priority: 'low',
      issue: 'Missing Social Media Tags',
      action: 'Add Open Graph tags so your page looks good when shared on Facebook, LinkedIn, etc.',
      why: 'Without these tags, social platforms will guess what to show, often with poor results.'
    });
  }

  // Structured Data
  if (!seoData.structuredData.found) {
    recommendations.push({
      priority: 'low',
      issue: 'No Structured Data Found',
      action: 'Consider adding Schema.org structured data to help search engines understand your content better',
      why: 'Structured data can enable rich snippets like star ratings, pricing, and event info in search results.'
    });
  }

  // Performance Issues
  if (seoData.performance.available && seoData.performance.domInteractive > 3000) {
    recommendations.push({
      priority: 'high',
      issue: 'Slow Page Load Time',
      action: 'Optimize images, reduce file sizes, and minimize scripts to improve page speed',
      why: 'Google uses page speed as a ranking factor. Slow pages also cause visitors to leave before the page loads.'
    });
  }

  // Internal Links
  if (seoData.links.internal < 3 && seoData.links.total > 0) {
    recommendations.push({
      priority: 'medium',
      issue: 'Few Internal Links',
      action: 'Add more links to other relevant pages on your website',
      why: 'Internal links help users navigate and help search engines understand your site structure.'
    });
  }

  // Word Count
  if (seoData.wordCount < 300) {
    recommendations.push({
      priority: 'medium',
      issue: 'Thin Content',
      action: 'Expand your content to at least 300 words for better SEO value',
      why: 'Pages with very little content are seen as low-quality by search engines.'
    });
  }

  // Language Tag
  if (seoData.meta.language === 'Not specified') {
    recommendations.push({
      priority: 'low',
      issue: 'No Language Specified',
      action: 'Add a language attribute to your HTML tag (e.g., <html lang="en">)',
      why: 'This helps search engines show your page to the right audience and helps screen readers.'
    });
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

// Store the analysis results
const pageData = analyzePage();
window.seoAuditData = {
  ...pageData,
  recommendations: generateRecommendations(pageData)
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSEOData') {
    sendResponse(window.seoAuditData);
  }
  return true;
});
