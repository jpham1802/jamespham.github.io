// Popup JavaScript for SEO Audit Tool

document.addEventListener('DOMContentLoaded', function() {
  loadSEOData();

  // Refresh button handler
  document.getElementById('refreshBtn').addEventListener('click', function() {
    location.reload();
  });
});

async function loadSEOData() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: 'getSEOData' }, function(response) {
      if (chrome.runtime.lastError) {
        showError('Please refresh the page and try again.');
        return;
      }

      if (response) {
        displaySEOData(response);
      } else {
        showError('No data received. Please refresh the page.');
      }
    });
  } catch (error) {
    showError('Error loading SEO data: ' + error.message);
  }
}

function displaySEOData(data) {
  // Hide loading, show content
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('content').classList.remove('hidden');

  // Meta Tags
  displayMetaTags(data.meta);

  // Headers
  displayHeaders(data.headers);

  // Links
  displayLinks(data.links);

  // Images
  displayImages(data.images);

  // Performance
  displayPerformance(data.performance);

  // Canonical & Robots
  displayCanonicalAndRobots(data.canonical, data.robots);

  // Open Graph & Twitter
  displaySocialTags(data.openGraph, data.twitter);

  // Structured Data
  displayStructuredData(data.structuredData);

  // Additional Info
  document.getElementById('wordCount').textContent = data.wordCount.toLocaleString();
  document.getElementById('pageUrl').textContent = data.url;
}

function displayMetaTags(meta) {
  document.getElementById('metaTitle').textContent = meta.title || 'Not found';
  document.getElementById('titleLength').textContent = `${meta.titleLength} characters`;

  // Add status indicator for title length
  const titleLengthEl = document.getElementById('titleLength');
  if (meta.titleLength < 30 || meta.titleLength > 60) {
    titleLengthEl.classList.add('warning');
    titleLengthEl.textContent += ' ⚠️ (Recommended: 30-60)';
  } else {
    titleLengthEl.classList.add('success');
    titleLengthEl.textContent += ' ✓';
  }

  document.getElementById('metaDescription').textContent = meta.description;
  document.getElementById('descriptionLength').textContent = `${meta.descriptionLength} characters`;

  // Add status indicator for description length
  const descLengthEl = document.getElementById('descriptionLength');
  if (meta.descriptionLength === 0) {
    descLengthEl.classList.add('error');
    descLengthEl.textContent += ' ❌ Missing!';
  } else if (meta.descriptionLength < 120 || meta.descriptionLength > 160) {
    descLengthEl.classList.add('warning');
    descLengthEl.textContent += ' ⚠️ (Recommended: 120-160)';
  } else {
    descLengthEl.classList.add('success');
    descLengthEl.textContent += ' ✓';
  }

  document.getElementById('language').textContent = meta.language || 'Not specified';
  document.getElementById('charset').textContent = meta.charset;
}

function displayHeaders(headers) {
  const headersDiv = document.getElementById('headers');
  headersDiv.innerHTML = '';

  const headerTypes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

  headerTypes.forEach(type => {
    if (headers[type].length > 0) {
      const headerSection = document.createElement('div');
      headerSection.className = 'header-section';

      const headerTitle = document.createElement('div');
      headerTitle.className = 'header-title';
      headerTitle.textContent = `${type.toUpperCase()} (${headers[type].length})`;

      // Add warning if multiple H1s
      if (type === 'h1' && headers[type].length > 1) {
        headerTitle.innerHTML += ' <span class="warning-badge">⚠️ Multiple H1s</span>';
      } else if (type === 'h1' && headers[type].length === 0) {
        headerTitle.innerHTML += ' <span class="error-badge">❌ Missing H1</span>';
      }

      headerSection.appendChild(headerTitle);

      const headerList = document.createElement('ul');
      headerList.className = 'header-list';

      headers[type].forEach(text => {
        const li = document.createElement('li');
        li.textContent = text.substring(0, 100) + (text.length > 100 ? '...' : '');
        headerList.appendChild(li);
      });

      headerSection.appendChild(headerList);
      headersDiv.appendChild(headerSection);
    }
  });

  // If no H1 found, show warning
  if (headers.h1.length === 0) {
    const warning = document.createElement('div');
    warning.className = 'warning-message';
    warning.textContent = '⚠️ No H1 heading found on this page!';
    headersDiv.insertBefore(warning, headersDiv.firstChild);
  }
}

function displayLinks(links) {
  document.getElementById('totalLinks').textContent = links.total;
  document.getElementById('internalLinks').textContent = links.internal;
  document.getElementById('externalLinks').textContent = links.external;
  document.getElementById('nofollowLinks').textContent = links.nofollow;

  // Display external links
  const externalListDiv = document.getElementById('externalLinksList');
  if (links.externalLinks.length > 0) {
    const title = document.createElement('h3');
    title.textContent = 'External Links:';
    title.className = 'subsection-title';
    externalListDiv.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'link-list';

    links.externalLinks.slice(0, 10).forEach(link => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="link-text">${link.text || 'No text'}</span>
        <span class="link-url">${link.url}</span>
        ${link.nofollow ? '<span class="nofollow-badge">nofollow</span>' : ''}
      `;
      list.appendChild(li);
    });

    if (links.externalLinks.length > 10) {
      const more = document.createElement('li');
      more.className = 'more-items';
      more.textContent = `... and ${links.externalLinks.length - 10} more`;
      list.appendChild(more);
    }

    externalListDiv.appendChild(list);
  }
}

function displayImages(images) {
  document.getElementById('totalImages').textContent = images.total;
  document.getElementById('imagesWithAlt').textContent = images.withAlt;
  document.getElementById('imagesMissingAlt').textContent = images.withoutAlt;

  // Display images missing alt text
  const missingAltDiv = document.getElementById('missingAltList');
  if (images.missingAltImages.length > 0) {
    const title = document.createElement('h3');
    title.textContent = '⚠️ Images Missing Alt Text:';
    title.className = 'subsection-title warning';
    missingAltDiv.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'image-list';

    images.missingAltImages.slice(0, 5).forEach(img => {
      const li = document.createElement('li');
      li.textContent = `${img.src} (${img.width}x${img.height})`;
      list.appendChild(li);
    });

    if (images.missingAltImages.length > 5) {
      const more = document.createElement('li');
      more.className = 'more-items';
      more.textContent = `... and ${images.missingAltImages.length - 5} more`;
      list.appendChild(more);
    }

    missingAltDiv.appendChild(list);
  }
}

function displayPerformance(perf) {
  const perfDiv = document.getElementById('performance');

  if (!perf.available) {
    perfDiv.innerHTML = '<div class="info-message">Performance data not available</div>';
    return;
  }

  perfDiv.innerHTML = `
    <div class="perf-grid">
      <div class="perf-item">
        <div class="perf-label">DOM Interactive</div>
        <div class="perf-value">${perf.domInteractive}ms</div>
      </div>
      <div class="perf-item">
        <div class="perf-label">DOM Content Loaded</div>
        <div class="perf-value">${perf.domContentLoaded}ms</div>
      </div>
      <div class="perf-item">
        <div class="perf-label">Load Complete</div>
        <div class="perf-value">${perf.loadComplete}ms</div>
      </div>
      <div class="perf-item">
        <div class="perf-label">Transfer Size</div>
        <div class="perf-value">${perf.transferSize} KB</div>
      </div>
    </div>
  `;
}

function displayCanonicalAndRobots(canonical, robots) {
  const canonicalEl = document.getElementById('canonical');
  if (canonical.exists) {
    canonicalEl.textContent = canonical.url;
    canonicalEl.classList.add('success');
  } else {
    canonicalEl.textContent = 'Not found ⚠️';
    canonicalEl.classList.add('warning');
  }

  document.getElementById('robots').textContent = robots.content || 'Not specified';

  const indexStatusEl = document.getElementById('indexStatus');
  if (robots.noindex) {
    indexStatusEl.innerHTML = '❌ NOINDEX - Page blocked from search engines';
    indexStatusEl.classList.add('error');
  } else {
    indexStatusEl.innerHTML = '✓ Indexable';
    indexStatusEl.classList.add('success');
  }
}

function displaySocialTags(og, twitter) {
  document.getElementById('ogTitle').textContent = og.title;
  document.getElementById('ogDescription').textContent = og.description;
  document.getElementById('ogImage').textContent = og.image;
  document.getElementById('twitterCard').textContent = twitter.card;
}

function displayStructuredData(structured) {
  const structuredDiv = document.getElementById('structuredData');

  if (!structured.found) {
    structuredDiv.innerHTML = '<div class="warning-message">⚠️ No structured data found</div>';
    return;
  }

  structuredDiv.innerHTML = `
    <div class="info-message success">
      ✓ Found ${structured.count} structured data block(s)
    </div>
  `;

  if (structured.types.length > 0) {
    const typesList = document.createElement('div');
    typesList.className = 'value';
    typesList.textContent = 'Types: ' + structured.types.join(', ');
    structuredDiv.appendChild(typesList);
  }
}

function showError(message) {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('content').innerHTML = `
    <div class="error-message">
      <h3>⚠️ Error</h3>
      <p>${message}</p>
    </div>
  `;
  document.getElementById('content').classList.remove('hidden');
}
