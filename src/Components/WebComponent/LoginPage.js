import React, { useState, useEffect } from 'react';
import { Button, Container, Typography, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom'; 

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // Center horizontally
  },
  container: {
    padding: theme.spacing(4),
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
  },
  userDetailsContainer: {
    textAlign: 'center',
  },
}));

const LoginPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { instance } = useMsal();
  const [userDetails, setUserDetails] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [powerBiAccessToken, setPowerBiAccessToken] = useState(null);


  const loginRequest = {
    scopes: ['openid', 'profile', 'email', 'User.Read', 'https://south32.net/46f0d284-b8e9-4fcf-a6f8-e27a893e348d/user_impersonation'],
  };

  const handleLogin = async () => {
    try {
      const loginResponse = await instance.loginPopup(loginRequest);
      setUserDetails(loginResponse.account);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    instance.logout();
    setUserDetails(null);
    setTenantId(null);
    setClientId(null);
    setPowerBiAccessToken(null);
    // Clear local storage
    localStorage.removeItem('userDetails');
    localStorage.removeItem('powerBiAccessToken');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('clientId');
    console.log('Local storage cleared');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (userDetails) {
        try {
          // Acquire Power BI access token
          const tokenResponse = await instance.acquireTokenSilent({
            scopes: ['https://analysis.windows.net/powerbi/api/.default'],
            account: userDetails,
          });
  
          // Extract and save the Power BI access token
          const powerBiAccessToken = tokenResponse.accessToken;
          setTenantId(userDetails.tenantId);
          setClientId(userDetails.idTokenClaims.aud);
          setPowerBiAccessToken(powerBiAccessToken);
  
          // Save user details and Power BI access token to local storage
          localStorage.setItem('userDetails', JSON.stringify(userDetails));
          localStorage.setItem('powerBiAccessToken', powerBiAccessToken);
          localStorage.setItem('tenantId', userDetails.tenantId);
          localStorage.setItem('clientId', userDetails.idTokenClaims.aud);
  
          // Schedule token refresh every 20 minutes
          const refreshTokenInterval = setInterval(refreshToken, 20 * 60 * 1000);
  
          // Cleanup function to clear interval when component unmounts
          return () => clearInterval(refreshTokenInterval);
        } catch (error) {
          console.error('Failed to acquire Power BI access token:', error);
        }
      }
    };
  
    const refreshToken = async () => {
      try {
        const tokenResponse = await instance.acquireTokenSilent({
          scopes: ['https://analysis.windows.net/powerbi/api/.default'],
          account: userDetails,
        });
  
        const newAccessToken = tokenResponse.accessToken;
        setPowerBiAccessToken(newAccessToken);
        localStorage.setItem('powerBiAccessToken', newAccessToken);
      } catch (error) {
        console.error('Failed to refresh Power BI access token:', error);
      }
    };
  
    fetchData();
  }, [userDetails, instance]);
  

  useEffect(() => {
    // Retrieve data from local storage on component mount
    const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
    setUserDetails(storedUserDetails);
  }, []);

  return (
    <Container component="main" maxWidth="12" className={classes.root} style={{backgroundColor:'#ccbb21'}}>
      <div className={classes.container}>
        <Typography component="h1" variant="h4" className={classes.title}>
          {userDetails ? 'Welcome to IMC Enhance Web Display' : 'Please Signin'}
        </Typography>
        {userDetails ? (
          <Grid container spacing={2} direction="column" className={classes.userDetailsContainer}>
            <Grid item>
              <Typography variant="subtitle1">Name: {userDetails.name}</Typography>
              <Typography variant="subtitle1">User Name: {userDetails.username}</Typography>
            </Grid>
            <Grid item className={classes.buttonContainer}>
              <Button variant="contained" color="primary" onClick={handleLogout}>
                Sign Out
              </Button>
              <Button variant="contained" color="secondary" onClick={() => navigate('/dbManage')}>
                DB Manage
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Sign In
          </Button>
        )}
      </div>
    </Container>
  );
};

export default LoginPage;
