// LinkedIn Contact Extractor - Popup Script
// Handles UI interactions and data display

(function() {
  'use strict';

  // Cross-browser compatibility
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  // State management
  let currentData = null;

  // DOM elements
  const elements = {
    status: document.getElementById('status'),
    statusMessage: document.querySelector('.status-message'),
    notLinkedIn: document.getElementById('not-linkedin'),
    extractSection: document.getElementById('extract-section'),
    extractBtn: document.getElementById('extract-btn'),
    dataDisplay: document.getElementById('data-display'),
    copyAllBtn: document.getElementById('copy-all-btn'),
    clearBtn: document.getElementById('clear-btn'),
    copyButtons: document.querySelectorAll('.copy-btn'),
    fields: {
      fullName: document.getElementById('field-fullName'),
      jobTitle: document.getElementById('field-jobTitle'),
      location: document.getElementById('field-location'),
      company: document.getElementById('field-company')
    }
  };

  /**
   * Show status message
   * @param {string} message - Message to display
   * @param {string} type - Type of message (info, success, error)
   */
  function showStatus(message, type = 'info') {
    elements.statusMessage.textContent = message;
    elements.status.className = `status ${type}`;
    elements.status.classList.remove('hidden');

    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        elements.status.classList.add('hidden');
      }, 3000);
    }
  }

  /**
   * Check if current tab is on LinkedIn Sales Navigator
   */
  async function checkCurrentTab() {
    try {
      const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      if (!currentTab || !currentTab.url) {
        showNotLinkedIn();
        return false;
      }

      const url = currentTab.url;
      const isLinkedIn = url.includes('linkedin.com/sales/');

      if (isLinkedIn) {
        showExtractSection();
        return true;
      } else {
        showNotLinkedIn();
        return false;
      }
    } catch (error) {
      console.error('Error checking tab:', error);
      showStatus('Error checking current tab', 'error');
      return false;
    }
  }

  /**
   * Show "not on LinkedIn" warning
   */
  function showNotLinkedIn() {
    elements.notLinkedIn.classList.remove('hidden');
    elements.extractSection.classList.add('hidden');
    elements.dataDisplay.classList.add('hidden');
  }

  /**
   * Show extract section
   */
  function showExtractSection() {
    elements.notLinkedIn.classList.add('hidden');
    elements.extractSection.classList.remove('hidden');
  }

  /**
   * Display extracted data
   * @param {Object} data - Contact data to display
   */
  function displayData(data) {
    currentData = data;

    // Populate fields
    elements.fields.fullName.value = data.fullName || 'Not found';
    elements.fields.jobTitle.value = data.jobTitle || 'Not found';
    elements.fields.location.value = data.location || 'Not found';
    elements.fields.company.value = data.company || 'Not found';

    // Show data display
    elements.dataDisplay.classList.remove('hidden');
    elements.extractSection.classList.add('hidden');

    // Check if any data was found
    const hasData = data.fullName || data.jobTitle || data.location || data.company;
    if (!hasData) {
      showStatus('No data found on this page. The page structure may have changed.', 'error');
    } else {
      showStatus('Contact information extracted successfully!', 'success');
    }
  }

  /**
   * Extract contact information from current tab
   */
  async function extractContact() {
    try {
      elements.extractBtn.disabled = true;
      const btnText = elements.extractBtn.querySelector('.btn-text');
      const originalText = btnText.textContent;
      btnText.textContent = 'Extracting...';

      showStatus('Extracting contact information...', 'info');

      // Get active tab
      const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      if (!currentTab || !currentTab.id) {
        throw new Error('No active tab found');
      }

      // Send message to content script
      const response = await browserAPI.tabs.sendMessage(currentTab.id, {
        action: 'extractContact'
      });

      if (response && response.success) {
        displayData(response.data);
      } else {
        throw new Error(response.error || 'Failed to extract data');
      }

    } catch (error) {
      console.error('Extraction error:', error);
      showStatus(
        error.message || 'Failed to extract contact information. Please refresh the page and try again.',
        'error'
      );
    } finally {
      elements.extractBtn.disabled = false;
      const btnText = elements.extractBtn.querySelector('.btn-text');
      btnText.textContent = 'Extract Contact Info';
    }
  }

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} - Success status
   */
  async function copyToClipboard(text) {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (error) {
      console.error('Copy error:', error);
      return false;
    }
  }

  /**
   * Copy individual field
   * @param {string} fieldName - Name of field to copy
   */
  async function copyField(fieldName) {
    if (!currentData) return;

    const value = currentData[fieldName];
    if (!value) {
      showStatus('No data to copy', 'error');
      return;
    }

    const success = await copyToClipboard(value);
    if (success) {
      showStatus(`${fieldName} copied to clipboard!`, 'success');
    } else {
      showStatus('Failed to copy to clipboard', 'error');
    }
  }

  /**
   * Copy all fields in a formatted way
   */
  async function copyAllFields() {
    if (!currentData) return;

    const formattedData = `
LinkedIn Contact Information
${'='.repeat(50)}

Full Name: ${currentData.fullName || 'N/A'}
Job Title: ${currentData.jobTitle || 'N/A'}
Location: ${currentData.location || 'N/A'}
Company: ${currentData.company || 'N/A'}

Extracted on: ${new Date(currentData.timestamp).toLocaleString()}
Source: ${currentData.url}
${'='.repeat(50)}
    `.trim();

    const success = await copyToClipboard(formattedData);
    if (success) {
      showStatus('All data copied to clipboard!', 'success');
    } else {
      showStatus('Failed to copy to clipboard', 'error');
    }
  }

  /**
   * Clear displayed data
   */
  function clearData() {
    currentData = null;
    elements.fields.fullName.value = '';
    elements.fields.jobTitle.value = '';
    elements.fields.location.value = '';
    elements.fields.company.value = '';
    elements.dataDisplay.classList.add('hidden');
    elements.extractSection.classList.remove('hidden');
    showStatus('Data cleared', 'info');
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Extract button
    elements.extractBtn.addEventListener('click', extractContact);

    // Copy individual field buttons
    elements.copyButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const fieldName = e.currentTarget.dataset.field;
        copyField(fieldName);
      });
    });

    // Copy all button
    elements.copyAllBtn.addEventListener('click', copyAllFields);

    // Clear button
    elements.clearBtn.addEventListener('click', clearData);

    // Listen for messages from content script
    browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'contactExtracted' && message.data) {
        displayData(message.data);
      }
    });
  }

  /**
   * Initialize popup
   */
  async function init() {
    console.log('LinkedIn Contact Extractor popup initialized');
    setupEventListeners();
    await checkCurrentTab();

    // Try to load any previously extracted data from storage
    try {
      const result = await browserAPI.storage.local.get('lastExtractedData');
      if (result.lastExtractedData) {
        const data = result.lastExtractedData;
        // Only show if from current URL
        const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
        if (tabs[0] && tabs[0].url === data.url) {
          displayData(data);
        }
      }
    } catch (error) {
      console.debug('No previous data found:', error);
    }
  }

  // Save data to storage when extracted
  const originalDisplayData = displayData;
  displayData = function(data) {
    originalDisplayData(data);
    browserAPI.storage.local.set({ lastExtractedData: data }).catch(console.error);
  };

  // Start the popup
  init();
})();
