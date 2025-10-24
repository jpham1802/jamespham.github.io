/* global gapi */

const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient;
let gapiInited = false;
let gisInited = false;

/**
 * Initialize Google API (gapi) client
 */
export const initializeGapi = () => {
  return new Promise((resolve) => {
    gapi.load('client', async () => {
      await gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      });
      gapiInited = true;
      resolve();
    });
  });
};

/**
 * Initialize Google Identity Services (GIS) client
 */
export const initializeGis = (callback) => {
  return new Promise((resolve) => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: callback,
    });
    gisInited = true;
    resolve();
  });
};

/**
 * Check if both APIs are initialized
 */
export const isInitialized = () => gapiInited && gisInited;

/**
 * Request access token
 */
export const requestAccessToken = (callback) => {
  if (gapi.client.getToken() === null) {
    tokenClient.callback = callback;
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    tokenClient.callback = callback;
    tokenClient.requestAccessToken({ prompt: '' });
  }
};

/**
 * Revoke access token
 */
export const revokeToken = () => {
  const cred = gapi.client.getToken();
  if (cred !== null) {
    google.accounts.oauth2.revoke(cred.access_token);
    gapi.client.setToken('');
  }
};

/**
 * Check if user is signed in
 */
export const isSignedIn = () => {
  return gapi.client.getToken() !== null;
};

/**
 * Create a new Google Sheet
 */
export const createSpreadsheet = async (title = 'Extracted Data') => {
  try {
    const response = await gapi.client.sheets.spreadsheets.create({
      properties: {
        title: title,
      },
    });
    return response.result;
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    throw error;
  }
};

/**
 * Write data to a Google Sheet
 * @param {string} spreadsheetId - The ID of the spreadsheet
 * @param {Array} data - Array of objects with fullName, jobTitle, companyName, location
 * @param {string} range - The range to write to (default: Sheet1!A1)
 */
export const writeToSheet = async (spreadsheetId, data, range = 'Sheet1!A1') => {
  try {
    // Prepare the data for the sheet
    const headers = ['Full Name', 'Job Title', 'Company Name', 'Location'];
    const rows = data.map(item => [
      item.fullName || '',
      item.jobTitle || '',
      item.companyName || '',
      item.location || '',
    ]);

    const values = [headers, ...rows];

    const response = await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: range,
      valueInputOption: 'RAW',
      resource: {
        values: values,
      },
    });

    return response.result;
  } catch (error) {
    console.error('Error writing to sheet:', error);
    throw error;
  }
};

/**
 * Append data to a Google Sheet
 * @param {string} spreadsheetId - The ID of the spreadsheet
 * @param {Array} data - Array of objects with fullName, jobTitle, companyName, location
 * @param {string} range - The range to append to (default: Sheet1!A:D)
 */
export const appendToSheet = async (spreadsheetId, data, range = 'Sheet1!A:D') => {
  try {
    const rows = data.map(item => [
      item.fullName || '',
      item.jobTitle || '',
      item.companyName || '',
      item.location || '',
    ]);

    const response = await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: range,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: rows,
      },
    });

    return response.result;
  } catch (error) {
    console.error('Error appending to sheet:', error);
    throw error;
  }
};

/**
 * Format the header row of the sheet
 * @param {string} spreadsheetId - The ID of the spreadsheet
 */
export const formatHeaderRow = async (spreadsheetId) => {
  try {
    const response = await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.2,
                    green: 0.2,
                    blue: 0.8,
                  },
                  textFormat: {
                    foregroundColor: {
                      red: 1.0,
                      green: 1.0,
                      blue: 1.0,
                    },
                    fontSize: 11,
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId: 0,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      },
    });

    return response.result;
  } catch (error) {
    console.error('Error formatting header:', error);
    throw error;
  }
};

/**
 * Create a new sheet and write data to it
 * @param {string} title - The title of the new spreadsheet
 * @param {Array} data - Array of objects to write
 */
export const createAndWriteToSheet = async (title, data) => {
  try {
    // Create new spreadsheet
    const spreadsheet = await createSpreadsheet(title);
    const spreadsheetId = spreadsheet.spreadsheetId;

    // Write data to the sheet
    await writeToSheet(spreadsheetId, data);

    // Format the header row
    await formatHeaderRow(spreadsheetId);

    return {
      spreadsheetId,
      spreadsheetUrl: spreadsheet.spreadsheetUrl,
    };
  } catch (error) {
    console.error('Error creating and writing to sheet:', error);
    throw error;
  }
};
