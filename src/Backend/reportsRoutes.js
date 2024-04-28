const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Define the file path for 'ConsolidatedReport.json' using an absolute path
const filePath = path.join(__dirname, 'ConsolidatedReportJson', 'ConsolidatedReport.json');

// Middleware to set Content Security Policy (CSP) headers
router.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 'frame-ancestors self https://app.powerbi.com');
  next();
});

// API endpoint to fetch all reports
router.get('/', (req, res) => {
  try {
    const reports = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.setHeader('Content-Type', 'application/json'); // Set Content-Type header
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

// API endpoint to add a new report
router.post('/', (req, res) => {
    try {
      const newReport = req.body;
      let existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
      // Generate a unique ID for the new report
      newReport.id = Date.now().toString();
      
      // Add the new report to the existing data
      existingData.push(newReport);
  
      // Write the updated data back to the JSON file
      fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
  
      res.json(newReport);
    } catch (error) {
      console.error('Error adding report:', error);
      res.status(500).json({ message: 'Error adding report' });
    }
  });
  

// API endpoint to update an existing report
router.put('/:id', (req, res) => {
    try {
      const reportId = req.params.id;
      const updatedReport = req.body;
      let existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
      // Find the index of the report to update
      const reportIndex = existingData.findIndex((report) => report.id === reportId);
  
      if (reportIndex === -1) {
        return res.status(404).json({ message: 'Report not found' });
      }
  
      // Update the report
      existingData[reportIndex] = { ...existingData[reportIndex], ...updatedReport };
      fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
  
      res.json(existingData[reportIndex]);
    } catch (error) {
      console.error('Error updating report:', error);
      res.status(500).json({ message: 'Error updating report' });
    }
  });
  

/// API endpoint to delete an existing report
router.delete('/:id', (req, res) => {
    try {
      const reportId = req.params.id;
      let existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
      // Filter out the report to delete
      const updatedData = existingData.filter((report) => report.id !== reportId);
  
      // If the report doesn't exist, no changes are made
      if (existingData.length === updatedData.length) {
        return res.status(404).json({ message: 'Report not found' });
      }
  
      // Write the updated data back to the JSON file
      fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
  
      res.status(204).send(); // 204 No Content response
    } catch (error) {
      console.error('Error deleting report:', error);
      res.status(500).json({ message: 'Error deleting report' });
    }
  });
  

module.exports = router;
