import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import {
  Menu,
  MenuItem,
  IconButton,
  makeStyles,
  Grid
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { useMsal } from '@azure/msal-react';

const useStyles = makeStyles((theme) => ({
  // styles here as [er the requirement]
}));

function NavBar() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const { instance } = useMsal();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Fetch user details from local storage on component mount
    const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
    setUserDetails(storedUserDetails);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleLogout = () => {
    navigate('/LoginPage');
    instance.logout();
    setUserDetails(null);
    // Clear local storage
    localStorage.removeItem('userDetails');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('clientId');
    handleCloseDialog();
    
  };

  const handleSignIn = () => {
    handleCloseDialog(); // Close the dialog box
    navigate('/LoginPage'); // Navigate to LoginPage
  };
  

  return (
    <Grid container justifyContent={'flex-start'} alignItems='flex-start' lg={12} style={{position:'absolute', left:'35%', top:'2%'}}>
    <nav className={classes.navbar}>
      <IconButton
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        className={classes.iconButton}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={handleClose}
          component={Link}
          to="/LoginPage"
          className={classes.menuItem}
        >
          User Profile
        </MenuItem>
        <MenuItem
          onClick={handleClose}
          component={Link}
          to="/DBManage"
          className={classes.menuItem}
        >
          DB Manage
        </MenuItem>
        <MenuItem
          onClick={handleClose}
          component={Link}
          to="/Display"
          className={classes.menuItem}
        >
          DisplayPort
        </MenuItem>
      </Menu>
    </nav>

    </Grid>
  );
}

export default NavBar;
