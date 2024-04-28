import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './Components/Assets/NavBar';
import LoginPage from './Components/WebComponent/LoginPage';
import DBManage from './Components/WebPages/DBManage';
import DisplayPort from './Components/WebPages/DisplayPort';

function AppRoutes({ isAuthenticated }) {
  const location = useLocation();
  const hideNavBar = location.pathname === '/LoginPage' || location.pathname === '/';

  return (
    <>
      {!hideNavBar && <NavBar />} {/* Conditionally render NavBar */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/DBManage" element={<DBManage />} />
        <Route path="/Display" element={<DisplayPort />} />
      </Routes>
    </>
  );
}

export default AppRoutes;
