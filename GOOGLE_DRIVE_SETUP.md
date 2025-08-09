# Google Drive Upload Integration Setup

## Overview
This implementation adds Google Drive file upload functionality to your CoolShirt.AI website, allowing users to select and upload images directly from their Google Drive.

## Files Created/Modified

### New Files:
1. **`src/config/googleDrive.ts`** - Configuration file for Google API credentials
2. **`src/services/googleDriveService.ts`** - Service class handling all Google Drive operations

### Modified Files:
1. **`src/components/RightPanel.tsx`** - Updated to integrate Google Drive upload functionality

## Setup Instructions

### Step 1: Get Google API Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google Drive API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click on it and press "Enable"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" for user type (unless you have a Google Workspace account)
   - Fill in the required fields:
     - App name: "CoolShirt.AI"
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes:
     - Click "Add or Remove Scopes"
     - Search and select: `https://www.googleapis.com/auth/drive.readonly`
   - Add test users (if in testing mode)

4. **Create OAuth 2.0 Client ID**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "CoolShirt.AI Web Client"
   - Authorized JavaScript origins:
     - Add: `http://localhost:3000` (for development)
     - Add: `http://localhost:5173` (for Vite dev server)
     - Add your production URL (e.g., `https://coolshirt.ai`)
   - Authorized redirect URIs:
     - Add the same URLs as above
   - Click "Create"
   - **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

5. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API key"
   - **Copy the API Key**
   - Click "Edit API key" to restrict it:
     - Application restrictions: "HTTP referrers"
     - Add the same URLs as in step 4
     - API restrictions: "Restrict key"
     - Select "Google Drive API"

### Step 2: Configure Your Application

1. **Update the configuration file**
   
   Open `src/config/googleDrive.ts` and replace the placeholder values:
   
   ```typescript
   export const GOOGLE_CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com';
   export const GOOGLE_API_KEY = 'YOUR_ACTUAL_API_KEY';
   ```

2. **Important Security Note**
   
   For production, you should:
   - Store these credentials in environment variables
   - Create a `.env` file in your project root:
   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   VITE_GOOGLE_API_KEY=your_api_key_here
   ```
   
   Then update `src/config/googleDrive.ts`:
   ```typescript
   export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
   export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
   ```

### Step 3: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your application and click on the "Upload" tool in the left toolbar

3. Click the "Upload from Drive" button

4. You'll be prompted to sign in to Google (first time only)

5. Grant the necessary permissions

6. The Google Drive picker will open, allowing you to select images

## Features Implemented

### Main Features:
- ✅ OAuth 2.0 authentication with Google
- ✅ Google Drive Picker for file selection
- ✅ File size validation (10MB limit)
- ✅ Image file type validation
- ✅ Download files as blob and convert to File objects
- ✅ Sign in/out functionality
- ✅ Loading states and error handling
- ✅ Fallback to URL input method if picker fails

### User Experience:
- Clean, integrated UI matching your existing design
- Gradient button styling consistent with your brand
- Loading spinner during authentication and file download
- Clear error messages for validation failures
- Sign out option for switching Google accounts

## How It Works

1. **First Click**: User clicks "Upload from Drive"
2. **Authentication**: If not signed in, prompts for Google sign-in
3. **Authorization**: User grants permission to read Drive files
4. **File Selection**: Google Picker opens showing only image files
5. **Validation**: Checks file size and type
6. **Download**: Downloads file as blob from Google Drive
7. **Upload**: Converts to File object and passes to your existing upload handler

## Troubleshooting

### Common Issues:

1. **"popup_closed_by_user" error**
   - User closed the sign-in popup
   - Solution: Try again and complete sign-in

2. **"idpiframe_initialization_failed" error**
   - Cookies are blocked or third-party cookies disabled
   - Solution: Enable third-party cookies for Google domains

3. **Picker doesn't open**
   - API key or Client ID might be incorrect
   - Solution: Verify credentials in Google Cloud Console

4. **"Failed to download file" error**
   - File might be too large or not an image
   - Solution: Select a smaller image file

5. **CORS errors**
   - Your domain isn't in the authorized origins
   - Solution: Add your domain to OAuth client settings

### Fallback Method:
If the Google Picker fails, the system automatically falls back to a URL input method where users can paste a Google Drive share link.

## Production Checklist

- [ ] Move API credentials to environment variables
- [ ] Add production domain to Google Cloud Console
- [ ] Test with multiple Google accounts
- [ ] Verify file size limits work correctly
- [ ] Test error handling scenarios
- [ ] Consider implementing request throttling
- [ ] Add analytics tracking for upload events

## Security Considerations

1. **API Key Restrictions**: Always restrict your API key to specific domains
2. **Scope Limitations**: Only request `drive.readonly` scope (minimum needed)
3. **Client-Side Only**: All operations happen client-side, no server storage
4. **Token Management**: Tokens are managed by Google's OAuth library
5. **HTTPS Required**: Google APIs require HTTPS in production

## Support

For issues or questions about the Google Drive integration:
1. Check the browser console for detailed error messages
2. Verify your Google Cloud Console settings
3. Ensure all domains are properly whitelisted
4. Test with a different Google account

## Next Steps

To enhance this integration, you could:
1. Add support for selecting multiple files
2. Implement drag-and-drop from Google Drive
3. Add recent files section
4. Cache frequently used images
5. Add Google Photos integration
6. Implement team drives support