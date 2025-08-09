import { GOOGLE_CLIENT_ID, GOOGLE_API_KEY, SCOPES, DISCOVERY_DOCS } from '../config/googleDrive';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

class GoogleDriveService {
  private isInitialized: boolean = false;
  private isSignedIn: boolean = false;
  private gapi: any = null;
  private pickerApiLoaded: boolean = false;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (window.gapi) {
        this.loadGapiClient().then(resolve).catch(reject);
        return;
      }

      // Load Google API
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.loadGapiClient().then(resolve).catch(reject);
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  private async loadGapiClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      window.gapi.load('client:auth2:picker', async () => {
        try {
          await window.gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            clientId: GOOGLE_CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
          });
          
          this.gapi = window.gapi;
          this.isInitialized = true;
          this.pickerApiLoaded = true;
          
          // Listen for sign-in state changes
          this.gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn: boolean) => {
            this.isSignedIn = isSignedIn;
          });
          
          this.isSignedIn = this.gapi.auth2.getAuthInstance().isSignedIn.get();
          resolve();
        } catch (error) {
          console.error('Error initializing Google API:', error);
          reject(error);
        }
      });
    });
  }

  async signIn(): Promise<any> {
    if (!this.isInitialized) {
      await this.init();
    }
    return this.gapi.auth2.getAuthInstance().signIn();
  }

  async signOut(): Promise<any> {
    if (this.isInitialized) {
      return this.gapi.auth2.getAuthInstance().signOut();
    }
  }

  getIsSignedIn(): boolean {
    return this.isSignedIn;
  }

  createPicker(callback: (data: any) => void): void {
    if (!this.isSignedIn) {
      throw new Error('User must be signed in to use picker');
    }

    const accessToken = this.gapi.auth.getToken().access_token;
    
    const picker = new window.google.picker.PickerBuilder()
      .setOAuthToken(accessToken)
      .addView(window.google.picker.ViewId.DOCS_IMAGES)
      .addView(new window.google.picker.DocsUploadView())
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback(callback)
      .build();
    
    picker.setVisible(true);
  }

  async downloadFile(fileId: string): Promise<{ metadata: any; content: any }> {
    try {
      // Get file metadata
      const metadataResponse = await this.gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'name, mimeType, size, webContentLink, thumbnailLink'
      });

      // Get file content
      const contentResponse = await this.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      return {
        metadata: metadataResponse.result,
        content: contentResponse.body
      };
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  async getFileAsBlob(fileId: string): Promise<Blob> {
    const accessToken = this.gapi.auth.getToken().access_token;
    
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    return response.blob();
  }

  async getFileMetadata(fileId: string): Promise<any> {
    try {
      const response = await this.gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'name, mimeType, size'
      });
      return response.result;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }
}

export default new GoogleDriveService();