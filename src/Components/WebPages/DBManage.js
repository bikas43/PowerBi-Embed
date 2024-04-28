import React from 'react';
import PowerBiReportsAdd from '../WebComponent/PowerBiReportsAdd';
import NavBar from '../Assets/NavBar';

export default function DBManage() {
  return (
    <div
      style={{
        width: '100%', // Ensure the container takes up the full width of the viewport
        height: '100%', // Ensure the container takes up the full height of the viewport
      }}
    >
      <div
        className="DashBoard"
        style={{
          width: '100VW', // Fixed width for the dashboard
          height: '100VH', // Fixed height for the dashboard
          /* Add any other styling for the dashboard */
        }}
      >
        <PowerBiReportsAdd />
      </div>
    </div>
  );
}
