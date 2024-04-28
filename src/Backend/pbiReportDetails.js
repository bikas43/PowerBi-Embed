const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
    try {
        const { reports, powerBiAccessToken } = req.body;

        if (!powerBiAccessToken) {
            throw new Error('No Power BI access token provided');
        }

        console.log('Power BI Access Token:', powerBiAccessToken);

        const reportDetails = await Promise.all(reports.map(async (reportRequest, index) => {
            const { workspaceId, reportId } = reportRequest;

            console.log('Fetching report details for workspace ID:', workspaceId, 'and report ID:', reportId);

            const apiUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`;
            const response = await axios.get(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${powerBiAccessToken}`
                }
            });

            const modifiedReport = { ...response.data, id: index, reportId }; // Add id field with indexing
            return modifiedReport;
        }));

        console.log('All report details fetched:', reportDetails);
        res.json(reportDetails);
    } catch (error) {
        console.error('Error fetching report details:', error.message);
        res.status(500).json({ message: 'Error fetching report details' });
    }
});

module.exports = router;
