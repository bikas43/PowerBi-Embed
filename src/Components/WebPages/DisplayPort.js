import React, { useEffect, useState } from 'react';
import PowerBiEmbedReport from '../WebComponent/PowerBiEmbedReport';

function DisplayPort() {
  const [selectedReports, setSelectedReports] = useState([]);
  const [reportDetails, setReportDetails] = useState([]);
  const [tenantId, setTenantId] = useState('');
  const [clientId, setClientId] = useState('');
  const [powerBiAccessToken, setPowerBiAccessToken] = useState('');

  useEffect(() => {
    // Fetch data from the API
    fetch('http://localhost:3001/api/reports')
      .then((response) => response.json())
      .then((data) => {
        // Filter the data to include only selected reports
        const selectedData = data.filter((report) => report.Selected === 'Yes');
        setSelectedReports(selectedData.map(report => ({
          ...report,
          URL: report.URL.replace(/^file:\/\/\//, 'http://localhost:8080')
        })));
      })
      .catch((error) => console.error('Error fetching data:', error));

    // Fetch accessToken, PowebiAccessToken, tenantId, and clientId from local storage
    const storedTenantId = localStorage.getItem('tenantId');
    const storedClientId = localStorage.getItem('clientId');
    const storedPowerBiAccessToken = localStorage.getItem('powerBiAccessToken');

    if (storedTenantId && storedClientId && storedPowerBiAccessToken) {
      setTenantId(storedTenantId);
      setClientId(storedClientId);
      setPowerBiAccessToken(storedPowerBiAccessToken);
    }
  }, []);

  useEffect(() => {
    // Function to fetch report details from backend
    const fetchReportDetails = async (reportData) => {
      try {
        console.log('Sending data to backend:', {
          reports: reportData,
          tenantId,
          clientId,
          powerBiAccessToken
        }); // Log data being sent to backend
        const response = await fetch(`http://localhost:3001/api/report-details`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reports: reportData,
            tenantId,
            clientId,
            powerBiAccessToken
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Received data from backend:', data); // Log received data from backend
          setReportDetails(data);
        } else {
          console.error('Error fetching report details:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching report details:', error.message);
      }
    };

    // Filter selectedReports to remove items without reportId or workspaceId
    const filteredReports = selectedReports.filter(report => report.URL.includes('reports/') && report.URL.includes('groups/'));

    // Create an array of objects containing workspaceId and reportId
    const reportDataArray = filteredReports.map((report) => {
      const reportIdIndex = report.URL.indexOf('reports/') + 'reports/'.length;
      const reportId = report.URL.substring(reportIdIndex, reportIdIndex + 36);
      const workspaceIdIndex = report.URL.indexOf('groups/') + 'groups/'.length;
      const workspaceId = report.URL.substring(workspaceIdIndex, workspaceIdIndex + 36);
      return { workspaceId, reportId };
    });

    // Call fetchReportDetails with the array of report data
    fetchReportDetails(reportDataArray);

    // Function to refresh reports based on the scheduled time
    const refreshReportsAtScheduledTime = () => {
      const now = new Date();
      const currentUTC = now.getUTCHours() * 60 + now.getUTCMinutes();

      // Iterate through each report to check if it's time to refresh
      selectedReports.forEach((report, index) => {
        const { 'Refresh Window Start Time (24H clock)': refreshStartTime, 'Refresh Window End Time (24H clock)': refreshEndTime } = report;
        const [startHour, startMinute] = refreshStartTime.split(':').map(val => parseInt(val));
        const [endHour, endMinute] = refreshEndTime.split(':').map(val => parseInt(val));
        const startUTC = startHour * 60 + startMinute;
        const endUTC = endHour * 60 + endMinute;

        if (currentUTC >= startUTC && currentUTC <= endUTC) {
          // Refresh the report if current time is within the refresh window
          fetchReportDetails([reportDataArray[index]]);
        }
      });
    };

    // Refresh reports every minute to check if it's time to refresh
    const refreshInterval = setInterval(refreshReportsAtScheduledTime, 60000);

    // Call refreshReportsAtScheduledTime immediately to check if any reports need to be refreshed at the start
    refreshReportsAtScheduledTime();

    return () => clearInterval(refreshInterval); // Clear interval on component unmount
  }, [selectedReports, tenantId, clientId, powerBiAccessToken]); // Include dependencies in the array

  return (
    <>
      {/* Render the grid for each selected report */}
      {selectedReports.map((report, index) => {
        const reportIdIndex = report.URL.indexOf('reports/') + 'reports/'.length;
        const reportId = report.URL.substring(reportIdIndex, reportIdIndex + 36);
        const hasReportIdAndWorkspaceId = reportId && report.URL.includes('groups/');

        if (hasReportIdAndWorkspaceId) {
          return (
            <div
              key={report.id}
              className="grid"
              style={{
                position: 'absolute',
                top: `${report.Y}px`,
                left: `${report.X}px`,
                width: `${report.Width}px`,
                height: `${report.Height}px`,
                border: '1px solid black',
                backgroundColor: 'lightblue',
              }}
            >
              {reportDetails[index] && (
                <PowerBiEmbedReport
                  key={report.id}
                  width={report.Width}
                  height={report.Height}
                  reportId={reportDetails[index].reportId}
                  embedUrl={reportDetails[index].embedUrl}
                  accessToken={powerBiAccessToken}
                />
              )}
            </div>
          );
        } else {
          return (
            <div
              key={report.id}
              className="grid"
              style={{
                position: 'absolute',
                top: `${report.Y}px`,
                left: `${report.X}px`,
                width: `${report.Width}px`,
                height: `${report.Height}px`,
                border: '1px solid black',
                backgroundColor: 'lightblue',
              }}
              dangerouslySetInnerHTML={{ __html: report.URL }}
            />
          );
        }
      })}
    </>
  );
}

export default DisplayPort;
