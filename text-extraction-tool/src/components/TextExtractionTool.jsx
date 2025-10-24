import React, { useState, useEffect } from 'react';
import { Upload, Loader2, X, Download, Clipboard, FileSpreadsheet, LogOut, LogIn } from 'lucide-react';
import * as GoogleSheets from '../services/googleSheets';

export default function TextExtractionTool() {
  const [images, setImages] = useState([]);
  const [extractedData, setExtractedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showPasteHint, setShowPasteHint] = useState(false);
  const [pasteAreaFocused, setPasteAreaFocused] = useState(false);

  // Google Sheets states
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [isWritingToSheet, setIsWritingToSheet] = useState(false);
  const [sheetSuccess, setSheetSuccess] = useState(null);
  const [showSpreadsheetModal, setShowSpreadsheetModal] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState('');

  useEffect(() => {
    // Load Google API script
    const script1 = document.createElement('script');
    script1.src = 'https://apis.google.com/js/api.js';
    script1.async = true;
    script1.defer = true;
    script1.onload = () => {
      GoogleSheets.initializeGapi();
    };
    document.body.appendChild(script1);

    // Load Google Identity Services script
    const script2 = document.createElement('script');
    script2.src = 'https://accounts.google.com/gsi/client';
    script2.async = true;
    script2.defer = true;
    script2.onload = () => {
      GoogleSheets.initializeGis((resp) => {
        if (resp.error !== undefined) {
          throw (resp);
        }
        setIsGoogleSignedIn(true);
      });
    };
    document.body.appendChild(script2);

    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  const handleGoogleSignIn = () => {
    GoogleSheets.requestAccessToken((resp) => {
      if (resp.error !== undefined) {
        setError('Failed to sign in to Google');
        return;
      }
      setIsGoogleSignedIn(true);
    });
  };

  const handleGoogleSignOut = () => {
    GoogleSheets.revokeToken();
    setIsGoogleSignedIn(false);
    setSheetSuccess(null);
  };

  const handlePaste = async (event) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const blob = item.getAsFile();

        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const file = new File([blob], `pasted-image-${timestamp}.png`, { type: blob.type });

          setImages(prev => [...prev, file]);
          setError(null);
          setShowPasteHint(true);
          setTimeout(() => setShowPasteHint(false), 2000);
        }
      }
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setError('Please upload valid image files');
      return;
    }

    setImages(prev => [...prev, ...imageFiles]);
    setError(null);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const extractText = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setIsProcessing(true);
    setError(null);
    const results = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const base64Data = await convertToBase64(image);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: image.type,
                      data: base64Data,
                    },
                  },
                  {
                    type: 'text',
                    text: `Extract ALL people's information from this image. For each person, extract:
- Full Name
- Job Title (ONLY the title before the word "at", do NOT include company name)
- Company Name (the text that appears after the word "at" in the job title)
- Location

CRITICAL INSTRUCTIONS:
1. Your ENTIRE response must be ONLY a valid JSON array
2. DO NOT include any text before or after the JSON
3. DO NOT wrap the JSON in markdown code blocks or backticks
4. If there are MULTIPLE people in the image, return an array with multiple objects
5. If there is only ONE person, still return an array with one object
6. Use exactly this format:

[
  {
    "fullName": "extracted name or empty string",
    "jobTitle": "extracted job title BEFORE 'at' or empty string",
    "companyName": "extracted company name AFTER 'at' or empty string",
    "location": "extracted location or empty string"
  }
]

If any information is not found, use an empty string "". DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON ARRAY.`,
                  },
                ],
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        let responseText = data.content[0].text;

        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const extractedInfo = JSON.parse(responseText);

        const infoArray = Array.isArray(extractedInfo) ? extractedInfo : [extractedInfo];

        infoArray.forEach(info => {
          results.push({
            fileName: image.name,
            ...info,
          });
        });
      }

      setExtractedData(results);
    } catch (err) {
      setError(`Error processing images: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const writeToNewSheet = async () => {
    if (extractedData.length === 0) {
      setError('No data to write. Please extract data first.');
      return;
    }

    if (!isGoogleSignedIn) {
      setError('Please sign in to Google first.');
      return;
    }

    setIsWritingToSheet(true);
    setError(null);
    setSheetSuccess(null);

    try {
      const timestamp = new Date().toLocaleString();
      const result = await GoogleSheets.createAndWriteToSheet(
        `Extracted Data - ${timestamp}`,
        extractedData
      );

      setSheetSuccess({
        message: 'Successfully created new Google Sheet!',
        url: `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}`,
      });
    } catch (err) {
      setError(`Error writing to Google Sheets: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setIsWritingToSheet(false);
    }
  };

  const appendToExistingSheet = async () => {
    if (extractedData.length === 0) {
      setError('No data to write. Please extract data first.');
      return;
    }

    if (!isGoogleSignedIn) {
      setError('Please sign in to Google first.');
      return;
    }

    if (!spreadsheetId.trim()) {
      setError('Please enter a Spreadsheet ID.');
      return;
    }

    setIsWritingToSheet(true);
    setError(null);
    setSheetSuccess(null);

    try {
      await GoogleSheets.appendToSheet(spreadsheetId.trim(), extractedData);

      setSheetSuccess({
        message: 'Successfully appended data to existing Google Sheet!',
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId.trim()}`,
      });
      setShowSpreadsheetModal(false);
      setSpreadsheetId('');
    } catch (err) {
      setError(`Error appending to Google Sheets: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setIsWritingToSheet(false);
    }
  };

  const downloadCSV = () => {
    if (extractedData.length === 0) return;

    const headers = ['Full Name', 'Job Title', 'Company Name', 'Location'];
    const csvContent = [
      headers.join(','),
      ...extractedData.map(row =>
        [row.fullName, row.jobTitle, row.companyName, row.location]
          .map(cell => `"${cell.replace(/"/g, '""')}"`)
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setImages([]);
    setExtractedData([]);
    setError(null);
    setSheetSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header with Google Sign In */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Text Extraction Tool</h1>
              <p className="text-gray-600">Upload screenshots to extract Name, Job Title, Company Name, and Location information</p>
            </div>
            <div>
              {isGoogleSignedIn ? (
                <button
                  onClick={handleGoogleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in with Google
                </button>
              )}
            </div>
          </div>

          {showPasteHint && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
              <Clipboard className="w-5 h-5" />
              <span>Image pasted successfully!</span>
            </div>
          )}

          {sheetSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <p className="font-semibold mb-2">{sheetSuccess.message}</p>
              <a
                href={sheetSuccess.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Open Google Sheet
              </a>
            </div>
          )}

          {/* Upload Section */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Click to Upload */}
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Click to upload</span>
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
              />
            </label>

            {/* Paste Area */}
            <div
              className={`relative flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg transition cursor-pointer ${
                pasteAreaFocused
                  ? 'border-indigo-500 bg-indigo-100'
                  : 'border-indigo-300 bg-indigo-50'
              }`}
              onClick={() => document.getElementById('pasteInput').focus()}
            >
              <textarea
                id="pasteInput"
                onPaste={handlePaste}
                onFocus={() => setPasteAreaFocused(true)}
                onBlur={() => setPasteAreaFocused(false)}
                placeholder="Click here, then paste (Ctrl+V)"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer resize-none"
              />
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <Clipboard className="w-10 h-10 text-indigo-500 mb-2" />
                <p className="text-sm text-gray-700 font-semibold">
                  {pasteAreaFocused ? 'Ready to Paste!' : 'Click & Paste Screenshot'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Ctrl+V</kbd>
                </p>
              </div>
            </div>
          </div>

          {/* Uploaded Images Preview */}
          {images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Uploaded Images ({images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">{image.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={extractText}
              disabled={isProcessing || images.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Extract Information'
              )}
            </button>

            {images.length > 0 && (
              <button
                onClick={clearAll}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Results Table */}
          {extractedData.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Extracted Data ({extractedData.length} records)
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV
                  </button>
                  {isGoogleSignedIn && (
                    <>
                      <button
                        onClick={writeToNewSheet}
                        disabled={isWritingToSheet}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                      >
                        {isWritingToSheet ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Writing...
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="w-4 h-4" />
                            New Google Sheet
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowSpreadsheetModal(true)}
                        disabled={isWritingToSheet}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Append to Sheet
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                        Full Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                        Job Title
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                        Company Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">
                          {row.fullName || '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {row.jobTitle || '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {row.companyName || '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {row.location || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for entering Spreadsheet ID */}
      {showSpreadsheetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Append to Existing Sheet</h3>
            <p className="text-gray-600 mb-4">
              Enter the Spreadsheet ID from the URL of your Google Sheet:
            </p>
            <p className="text-sm text-gray-500 mb-2 font-mono bg-gray-100 p-2 rounded">
              https://docs.google.com/spreadsheets/d/<span className="bg-yellow-200">SPREADSHEET_ID</span>/edit
            </p>
            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="Paste Spreadsheet ID here"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSpreadsheetModal(false);
                  setSpreadsheetId('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={appendToExistingSheet}
                disabled={!spreadsheetId.trim() || isWritingToSheet}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {isWritingToSheet ? 'Appending...' : 'Append Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
