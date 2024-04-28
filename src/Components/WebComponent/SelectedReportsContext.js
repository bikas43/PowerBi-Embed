import React, { createContext, useContext, useState } from 'react';

const SelectedReportsContext = createContext();

export const useSelectedReports = () => {
  return useContext(SelectedReportsContext);
};

export const SelectedReportsProvider = ({ children }) => {
  const [selectedReports, setSelectedReports] = useState([]);

  const addSelectedReport = (reportId) => {
    setSelectedReports((prevSelectedReports) => [
      ...prevSelectedReports,
      reportId,
    ]);
  };

  const removeSelectedReport = (reportId) => {
    setSelectedReports((prevSelectedReports) =>
      prevSelectedReports.filter((id) => id !== reportId)
    );
  };

  return (
    <SelectedReportsContext.Provider
      value={{
        selectedReports,
        addSelectedReport,
        removeSelectedReport,
      }}
    >
      {children}
    </SelectedReportsContext.Provider>
  );
};
