export const MSAL_CONFIG = {
    auth: {
      clientId: '07757311-4f6a-4958-9482-acfe9d31454e',
      authority: 'https://login.microsoftonline.com/d05d5e5b-385d-4774-b496-d0cf85bfa5f4',
      redirectUri: 'http://localhost:3000/auth/openid/return', // Update with your redirect URI
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
  };
  