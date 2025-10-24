# Text Extraction Tool with Google Sheets Integration

A React-based web application that extracts contact information from screenshots using Claude AI and automatically writes the results to Google Sheets.

## Features

- **Image Upload & Paste**: Upload images or paste screenshots directly
- **AI-Powered Extraction**: Uses Claude AI to extract:
  - Full Name
  - Job Title
  - Company Name
  - Location
- **Multiple People Detection**: Can extract information for multiple people in a single image
- **Google Sheets Integration**:
  - Automatically write extracted data to a new Google Sheet
  - Append data to an existing Google Sheet
  - Formatted headers with frozen rows
- **CSV Export**: Download extracted data as CSV
- **Batch Processing**: Process multiple images at once

## Prerequisites

Before you begin, make sure you have:

- Node.js (v16 or higher)
- npm or yarn package manager
- A Google Cloud account
- An Anthropic API account

## Setup Instructions

### 1. Clone the Repository

```bash
cd text-extraction-tool
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

#### Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key (you'll need this for `.env`)
4. (Optional but recommended) Restrict the API key:
   - Click on the API key
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API"
   - Save

#### Create OAuth 2.0 Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the app name, user support email, and developer contact
   - Add scopes: `https://www.googleapis.com/auth/spreadsheets`
   - Add your email as a test user
4. For Application type, choose "Web application"
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Add your production URL when deploying
6. Click "Create"
7. Copy the Client ID (you'll need this for `.env`)

### 4. Get Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (you'll need this for `.env`)

### 5. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
   VITE_GOOGLE_API_KEY=your_google_api_key_here
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
   ```

### 6. Run the Application

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

### 1. Sign in to Google

Click the "Sign in with Google" button in the top-right corner to authorize access to Google Sheets.

### 2. Upload Images

You can add images in two ways:
- **Click to Upload**: Click the upload area and select image files
- **Paste**: Click the paste area and press Ctrl+V (or Cmd+V on Mac) to paste a screenshot

### 3. Extract Information

Click "Extract Information" to process the images. The AI will extract contact information and display it in a table.

### 4. Export to Google Sheets

Once data is extracted, you have two options:

- **New Google Sheet**: Creates a new spreadsheet with the extracted data
- **Append to Sheet**: Adds the data to an existing spreadsheet (you'll need to provide the Spreadsheet ID)

To find a Spreadsheet ID:
1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
3. Copy the `SPREADSHEET_ID` portion

### 5. Alternative: Download CSV

Click "Download CSV" to export the data as a CSV file.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

To preview the production build:

```bash
npm run preview
```

## Troubleshooting

### Google Sign-In Issues

- Make sure your OAuth client ID includes the correct authorized JavaScript origins
- Check that the Google Sheets API is enabled in your Google Cloud project
- Verify that you've added yourself as a test user in the OAuth consent screen

### API Key Issues

- Ensure all API keys are correctly set in the `.env` file
- Don't commit the `.env` file to version control
- Make sure environment variables are prefixed with `VITE_` for Vite to expose them

### CORS Errors

- If you encounter CORS errors with the Anthropic API, make sure you're using the correct API endpoint
- The current implementation includes the API key in the frontend, which is suitable for development but should be moved to a backend in production

## Security Notes

**Important**: This application includes API keys in the frontend code, which is not recommended for production use. For a production deployment:

1. Create a backend API that handles:
   - Anthropic API calls
   - Google Sheets API calls (server-to-server)
2. Use environment variables only on the server
3. Implement proper authentication and rate limiting

## Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Google Sheets API v4**: Spreadsheet integration
- **Anthropic Claude API**: AI-powered text extraction

## License

MIT
