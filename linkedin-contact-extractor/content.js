// LinkedIn Sales Navigator Contact Extractor - Content Script
// This script runs on LinkedIn Sales Navigator pages and extracts contact information

(function() {
  'use strict';

  // Cross-browser compatibility for Chrome and Firefox
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  // Configuration for DOM selectors - multiple fallbacks for robustness
  const SELECTORS = {
    fullName: [
      '.profile-topcard-person-entity__name',
      '.artdeco-entity-lockup__title',
      'h1.text-heading-xlarge',
      'h1.profile-title',
      '[data-x--profile-header-card]//h1',
      '.pv-text-details__left-panel h1'
    ],
    jobTitle: [
      '.profile-topcard-person-entity__title',
      '.artdeco-entity-lockup__subtitle',
      '.text-body-medium.break-words',
      '[data-x--profile-header-card] .text-body-medium',
      '.pv-text-details__left-panel .text-body-medium'
    ],
    location: [
      '.profile-topcard-person-entity__location',
      '.artdeco-entity-lockup__caption',
      '.text-body-small.inline',
      '[data-x--profile-header-card] .text-body-small',
      '.pv-text-details__left-panel .text-body-small.inline'
    ],
    company: [
      '.profile-topcard__summary-position-title a',
      '.inline-show-more-text--is-collapsed',
      '[data-x--current-positions] a',
      '.pv-text-details__left-panel .inline-show-more-text',
      '.experience-item__title',
      'a[href*="/company/"]'
    ]
  };

  /**
   * Extract text from element using multiple selector strategies
   * @param {Array<string>} selectors - Array of CSS selectors to try
   * @param {Element} context - Context element to search within (default: document)
   * @returns {string} - Extracted text or empty string
   */
  function extractText(selectors, context = document) {
    for (const selector of selectors) {
      try {
        const element = context.querySelector(selector);
        if (element && element.textContent.trim()) {
          return element.textContent.trim();
        }
      } catch (e) {
        console.debug(`Selector failed: ${selector}`, e);
      }
    }
    return '';
  }

  /**
   * Extract company name with additional logic
   * @param {Element} context - Context element to search within
   * @returns {string} - Extracted company name
   */
  function extractCompany(context = document) {
    // Try standard selectors first
    let company = extractText(SELECTORS.company, context);

    // If not found, try to find first company link
    if (!company) {
      const companyLinks = context.querySelectorAll('a[href*="/company/"], a[href*="/school/"]');
      for (const link of companyLinks) {
        const text = link.textContent.trim();
        if (text && text.length > 1 && text.length < 100) {
          company = text;
          break;
        }
      }
    }

    return company;
  }

  /**
   * Clean and normalize extracted text
   * @param {string} text - Text to clean
   * @returns {string} - Cleaned text
   */
  function cleanText(text) {
    return text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/\n/g, ' ')   // Remove newlines
      .trim();
  }

  /**
   * Extract all contact information from the current page
   * @returns {Object} - Contact information object
   */
  function extractContactInfo() {
    console.log('Extracting contact information from Sales Navigator...');

    const data = {
      fullName: cleanText(extractText(SELECTORS.fullName)),
      jobTitle: cleanText(extractText(SELECTORS.jobTitle)),
      location: cleanText(extractText(SELECTORS.location)),
      company: cleanText(extractCompany()),
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    console.log('Extracted data:', data);
    return data;
  }

  /**
   * Create and inject extraction button into the page
   */
  function createExtractionButton() {
    // Check if button already exists
    if (document.getElementById('linkedin-extractor-btn')) {
      return;
    }

    const button = document.createElement('button');
    button.id = 'linkedin-extractor-btn';
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 11a5 5 0 110-10 5 5 0 010 10z"/>
        <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z"/>
      </svg>
      Extract Contact
    `;
    button.title = 'Extract contact information';
    button.className = 'linkedin-extractor-button';

    // Add click handler
    button.addEventListener('click', async () => {
      button.disabled = true;
      button.textContent = 'Extracting...';

      try {
        const data = extractContactInfo();

        // Send data to popup
        browserAPI.runtime.sendMessage({
          action: 'contactExtracted',
          data: data
        });

        // Visual feedback
        button.textContent = 'Extracted!';
        button.style.backgroundColor = '#057642';

        setTimeout(() => {
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 11a5 5 0 110-10 5 5 0 010 10z"/>
              <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z"/>
            </svg>
            Extract Contact
          `;
          button.style.backgroundColor = '';
          button.disabled = false;
        }, 2000);
      } catch (error) {
        console.error('Extraction error:', error);
        button.textContent = 'Error!';
        button.style.backgroundColor = '#cc1016';

        setTimeout(() => {
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 11a5 5 0 110-10 5 5 0 010 10z"/>
              <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z"/>
            </svg>
            Extract Contact
          `;
          button.style.backgroundColor = '';
          button.disabled = false;
        }, 2000);
      }
    });

    // Find a good place to inject the button
    const tryInjectButton = () => {
      const targets = [
        '.profile-topcard',
        '.artdeco-card',
        '.scaffold-layout__main',
        'main'
      ];

      for (const selector of targets) {
        const target = document.querySelector(selector);
        if (target) {
          target.insertBefore(button, target.firstChild);
          console.log('Extraction button injected successfully');
          return true;
        }
      }
      return false;
    };

    // Try to inject immediately
    if (!tryInjectButton()) {
      // If not found, wait for DOM to be ready
      setTimeout(tryInjectButton, 1000);
    }
  }

  /**
   * Listen for messages from popup
   */
  browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'extractContact') {
      try {
        const data = extractContactInfo();
        sendResponse({ success: true, data: data });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }
    return true; // Keep message channel open for async response
  });

  /**
   * Initialize the extension
   */
  function init() {
    // Check if we're on a Sales Navigator profile page
    if (window.location.href.includes('linkedin.com/sales/')) {
      console.log('LinkedIn Contact Extractor: Initializing on Sales Navigator page');

      // Wait for page to load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createExtractionButton);
      } else {
        createExtractionButton();
      }

      // Re-inject button on navigation (for SPAs)
      let lastUrl = location.href;
      new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          setTimeout(createExtractionButton, 1000);
        }
      }).observe(document, { subtree: true, childList: true });
    }
  }

  // Start the extension
  init();
})();
