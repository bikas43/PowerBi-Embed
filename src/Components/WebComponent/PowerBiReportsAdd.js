import React, { useState, useEffect } from 'react';
import { useSelectedReports } from '../WebComponent/SelectedReportsContext';
import { Snackbar, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Grid, IconButton, Container, Paper, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox } from '@material-ui/core';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import * as XLSX from 'xlsx'; // Importing xlsx library
import AddIcon from '@material-ui/icons/Add';
import GetAppIcon from '@material-ui/icons/GetApp';
import Logo from '../../logo-01.png';
import '../Assets/Assets.css';

function PowerBiReportsAdd() {
  const { selectedReports, addSelectedReport, removeSelectedReport } = useSelectedReports();

  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newReport, setNewReport] = useState({
    id: Date.now().toString(),
    Source: '',
    SITE: '',
    'Report Name': '',
    'Report Name and Link': '',
    URL: '',
    'Desktop Name': '',
    X: '',
    Y: '',
    Width: '',
    Height: '',
    'Refresh Mins': '',
    'Refresh Start Time (24Hr': '00:00',
    'Refresh End Time (24Hr)': '00:00',
    Selected: 'No',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null); // To store the selected report for editing
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar for success message
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false); // Snackbar for error message

  const toggleDialogVisibility = () => {
    setIsDialogOpen((prevState) => !prevState);
    // Reset newReport state to blank values when closing the dialog
    if (!isDialogOpen) {
      setNewReport({
        id: Date.now().toString(),
        Source: '',
        SITE: '',
        'Report Name': '',
        URL: '',
        'Desktop Name': '',
        X: '',
        Y: '',
        Width: '',
        Height: '',
        'Refresh Mins': '',
        'Refresh Window Start Time (24H clock)': '00:00',
        'Refresh Window End Time (24H clock)': '00:00',
        Selected: 'No',
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/reports')
      .then((response) => response.json())
      .then((data) => {
        const selectedIds = data.filter((report) => report.Selected === 'Yes').map((report) => report.id);
        selectedIds.forEach(addSelectedReport);

        setReports(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    console.log("Search Query:", e.target.value);
  };

  const filteredReports = reports.filter(report =>
    Object.values(report).some(value =>
      typeof value === 'string' && value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

   const handleAddNew = () => {
    // Check if mandatory fields are filled
    if (
      newReport.Source &&
      newReport.SITE &&
      newReport['Report Name'] &&
      newReport.URL &&
      newReport.X &&
      newReport.Y &&
      newReport.Width &&
      newReport['Refresh Window Start Time (24H clock)']
    ) {
      // Check if X, Y, Width, and Height are numeric
      if (!isNaN(newReport.X) && !isNaN(newReport.Y) && !isNaN(newReport.Width) && !isNaN(newReport.Height)) {
        // Add validation if necessary
        fetch('http://localhost:3001/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newReport),
        })
          .then((response) => response.json())
          .then((data) => {
            setSnackbarOpen(true); // Show success Snackbar
            setNewReport({
              id: Date.now().toString(),
              Source: '',
              SITE: '',
              'Report Name': '',
              URL: '',
              'Desktop Name': '',
              X: '',
              Y: '',
              Width: '',
              Height: '',
              'Refresh Mins': '',
              'Refresh Window Start Time (24H clock)': '00:00',
              'Refresh Window End Time (24H clock)': '00:00',
              Selected: 'No',
            });
            setIsDialogOpen(false);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      } else {
        setErrorSnackbarOpen(true); // Show error Snackbar for non-numeric input
      }
    } else {
      setErrorSnackbarOpen(true); // Show error Snackbar for missing mandatory fields
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleErrorSnackbarClose = () => {
    setErrorSnackbarOpen(false);
  };

  const handleEdit = (report) => {
    // Find the complete report object from the reports array
    const fullReport = reports.find(r => r.id === report.id);

    // Check if the full report object is found
    if (fullReport) {
      console.log("Selected Report:", fullReport);
      setSelectedReport(fullReport);
      setIsEditDialogOpen(true);
    } else {
      console.error("Failed to find the complete report object for editing.");
    }
  };

  const handleUpdate = () => {
    // Update report logic
    fetch(`http://localhost:3001/api/reports/${selectedReport.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedReport),
    })
      .then((response) => response.json())
      .then((updatedReport) => {
        const updatedReports = reports.map((report) =>
          report.id === updatedReport.id ? updatedReport : report
        );
        setReports(updatedReports);
        setIsEditDialogOpen(false);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleDelete = (id) => {
    setDeleteId(id); // Set the ID of the report to delete
    setIsDeleteDialogOpen(true); // Open the delete confirmation dialog
  };

  const confirmDelete = (id) => {
    // Send request to delete the report
    fetch(`http://localhost:3001/api/reports/${id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          // Remove the report from the local state
          const updatedReports = reports.filter(report => report.id !== id);
          setReports(updatedReports);
          console.log(`Report with ID ${id} has been deleted.`);
        } else {
          console.error(`Failed to delete report with ID ${id}.`);
        }
        setIsDeleteDialogOpen(false); // Close the delete confirmation dialog
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsDeleteDialogOpen(false); // Close the delete confirmation dialog
      });
  };

  const handleCheckboxChange = (event, row) => {
    const updatedReports = reports.map(report =>
      report.id === row.id ? { ...report, Selected: event.target.checked ? 'Yes' : 'No' } : report
    );
    setReports(updatedReports);

    // Send request to update backend data
    fetch(`http://localhost:3001/api/reports/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...row, Selected: event.target.checked ? 'Yes' : 'No' }),
    })
      .then((response) => response.json())
      .then((updatedReport) => {
        // Optional: handle response if necessary
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80, headerClassName: 'custom-header-class' },
    { field: 'Source', headerName: 'Source', width: 170, headerClassName: 'custom-header-class' },
    { field: 'SITE', headerName: 'SITE', width: 100, headerClassName: 'custom-header-class' },
    { field: 'Report Name', headerName: 'Report Name', width: 250, headerClassName: 'custom-header-class' },
    { field: 'URL', headerName: 'URL', width: 250, headerClassName: 'custom-header-class' },
    { field: 'Desktop Name', headerName: 'Desktop Name', width: 150, headerClassName: 'custom-header-class' },
    { field: 'X', headerName: 'X', width: 80, headerClassName: 'custom-header-class' },
    { field: 'Y', headerName: 'Y', width: 80, headerClassName: 'custom-header-class' },
    { field: 'Width', headerName: 'Width', width: 80, headerClassName: 'custom-header-class' },
    { field: 'Height', headerName: 'Height', width: 80, headerClassName: 'custom-header-class' },
    { field: 'Refresh Mins', headerName: 'Refresh Mins', width: 100, headerClassName: 'custom-header-class' },
    { field: 'Refresh Window Start Time (24H clock)', headerName: 'Refresh Start', width: 120, headerClassName: 'custom-header-class' },
    { field: 'Refresh Window End Time (24H clock)', headerName: 'Refresh End', width: 120, headerClassName: 'custom-header-class' },
    {
      field: 'Selected',
      headerName: 'View',
      width: 100,
      renderCell: (params) => (
        <div>
          <Checkbox
            checked={params.row.Selected === 'Yes'}
            onChange={(event) => handleCheckboxChange(event, params.row)}
            style={{ width: '22px', height: '22px' }} // Adjust the width and height as needed
          />
        </div>
      ),
      headerClassName: 'custom-header-class' // Custom class for header style
    },

    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <div>
          <IconButton color="primary" aria-label="edit" style={{ width: '30px' }} onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="secondary" aria-label="delete" style={{ width: '30px' }} onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </div>
      ),
      headerClassName: 'custom-header-class' // Custom class for header style
    },
  ];

  // Function to export data to Excel
  const handleExportToExcel = () => {
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const fileName = 'reports';

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(filteredReports);

    // Create workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');

    // Save the file
    XLSX.writeFile(wb, `${fileName}${fileExtension}`);
  };

  return (
    <Container maxWidth>
      <Grid container justifyContent={'center'} alignItems='center' lg={12}>

        <Grid container lg={12} justifyContent='space-between' alignItems='center' spacing={5}>
        <Grid item lg={4} container alignItems='center'>
        <img src={Logo} alt="Company Logo" style={{ width: '30px', marginRight: '10px' }} />
        <span style={{ fontSize: '35px', fontWeight: '600',color:'#303f9f', letterSpacing:3 }}>IMC ENHANCE WEB DISPLAY</span>
      </Grid>

          <Grid item lg={4} alignItems='center'>
            <TextField
              label="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid alignItems='center'>
            <Button
              variant="contained"
              color="primary"
              onClick={toggleDialogVisibility}
              startIcon={<AddIcon />} // Add icon to the left of the text
              style={{ marginRight: '10px', height: '56px', width: '200px' }} // Add some gap between the buttons
            >
              Add Embed Report
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleExportToExcel}
              endIcon={<GetAppIcon />} // Add icon to the right of the text
              style={{ height: '56px', width: '200px' }}
            >
              Export to Excel
            </Button>
          </Grid>
        </Grid>

      </Grid>
      <Grid lg={12} justifyContent='center' alignContent='center' alignItems='center'>
        <div style={{ height: 800, width: '100%', overflowY: 'scroll' }}> {/* Adjust height as per your requirement */}
          <DataGrid
            autoHeight
            rows={filteredReports}
            columns={columns}
            stickyHeader
          />
        </div>
      </Grid>

      <Dialog open={isDialogOpen} onClose={toggleDialogVisibility} fullWidth maxWidth="md">
        <DialogTitle>Add Report</DialogTitle>
        <DialogContent>
          <form>
          <Grid container spacing={2}>
          {Object.keys(newReport).map((header) => (
            <Grid item xs={
              header === 'id' ? 2 :
                    header === 'Source' ? 2 :
                      header === 'SITE' ? 3 :
                        header === 'Report Name' ? 5 :
                          header === 'URL' ? 12 :
                            header === 'Desktop Name' ? 4 :
                              header === 'X' ? 2 :
                                header === 'Y' ? 2 :
                                  header === 'Height' ? 2 :
                                    header === 'Width' ? 2 : 3} key={header}>
              {header === 'id' ? (
                <TextField
                  label={header}
                  value={newReport[header]}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                />
              ) : header === 'Selected' ? (
                <FormControl variant="outlined" fullWidth margin="normal">
                  <InputLabel id="selected-label">Selected</InputLabel>
                  <Select
                    labelId="selected-label"
                    value={newReport[header]}
                    onChange={(e) => setNewReport({ ...newReport, [header]: e.target.value })}
                    required
                    label="Selected"
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label={header}
                  type={header.includes('Time') ? 'time' : 'text'}
                  value={newReport[header]}
                  onChange={(e) => setNewReport({ ...newReport, [header]: e.target.value })}
                  required={header === 'Source' || header === 'SITE' || header === 'Report Name' || header === 'URL' || header === 'X' || header === 'Y' || header === 'Width' ||header === 'Height' || header === 'Refresh Window Start Time (24H clock)'}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ inputProps: { pattern: /^\d*$/ } }} // Allow only numeric input for X, Y, Width, and Height
                />
              )}
            </Grid>
          ))}
        </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleDialogVisibility} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddNew} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>


      {/* Snackbar for success message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="Report Details Added Successfully"
      />

      {/* Snackbar for error message */}
      <Snackbar
        open={errorSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleErrorSnackbarClose}
        message="Please Enter Numeric Values for X, Y, Width, Height and Fill All The Mandetory Fields (*)"
      />
      
       {/* Snackbar for success message */}
       <Snackbar
       open={snackbarOpen}
       autoHideDuration={6000}
       onClose={handleSnackbarClose}
       message="Report Details Added Successfully"
     />

      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Edit Report</DialogTitle>
        <DialogContent>
          <form>
            <Grid container spacing={2}>
              {selectedReport && Object.keys(selectedReport).map((header) => (
                <Grid item xs={12} lg={
                  header === 'id' ? 2 :
                    header === 'Source' ? 2 :
                      header === 'SITE' ? 3 :
                        header === 'Report Name' ? 5 :
                          header === 'URL' ? 12 :
                            header === 'Desktop Name' ? 4 :
                              header === 'X' ? 2 :
                                header === 'Y' ? 2 :
                                  header === 'Height' ? 2 :
                                    header === 'Width' ? 2 : 3} key={header}>
                  {header === 'Selected' ? (
                    <FormControl variant="outlined" fullWidth margin="normal">
                      <InputLabel id="selected-label">Selected</InputLabel>
                      <Select
                        labelId="selected-label"
                        value={selectedReport[header]}
                        onChange={(e) => setSelectedReport({ ...selectedReport, [header]: e.target.value })}
                        label="Selected"
                      >
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      label={header}
                      type={header.includes('Time') ? 'time' : 'text'}
                      value={selectedReport[header]}
                      onChange={(e) => setSelectedReport({ ...selectedReport, [header]: e.target.value })}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this report?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => confirmDelete(deleteId)} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PowerBiReportsAdd;
