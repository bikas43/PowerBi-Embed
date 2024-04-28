import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser'; // Adjusted import
import AppRoutes from './AppRoutes';
import { SelectedReportsProvider } from '../src/Components/WebComponent/SelectedReportsContext';
import './App.css';

const msalConfig = {
  auth: {
    clientId: '07757311-4f6a-4958-9482-acfe9d31454e',
    authority: 'https://login.microsoftonline.com/d05d5e5b-385d-4774-b496-d0cf85bfa5f4',
    redirectUri: 'http://localhost:3000/auth/openid/return',
  },
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pca, setPca] = useState(null);

  useEffect(() => {
    const pcaInstance = new PublicClientApplication(msalConfig);
    setPca(pcaInstance);

    async function initializeMsal() {
      try {
        await pcaInstance.handleRedirectPromise();
        setIsAuthenticated(!!pcaInstance.getActiveAccount());
      } catch (error) {
        console.error('MSAL initialization error:', error);
      }
    }

    initializeMsal();
  }, []);

  if (!pca) {
    return <div>Loading MSAL...</div>;
  }

  return (
    <MsalProvider instance={pca}>
      <Router>
        <SelectedReportsProvider>
          <AppRoutes isAuthenticated={isAuthenticated} />
        </SelectedReportsProvider>
      </Router>
    </MsalProvider>
  );
}

export default App;
