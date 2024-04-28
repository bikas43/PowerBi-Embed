// Import necessary packages/modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const reportsRoutes = require('./reportsRoutes');
const pbiReportDetails = require('./pbiReportDetails');

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware configurations
app.use(cors());
app.use(bodyParser.json());

// Define routes

app.use('/api/reports', reportsRoutes); // Mount reports routes under '/api/reports'
app.use('/api/report-details', pbiReportDetails); // Mount report details routes under '/api/report-details'


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
