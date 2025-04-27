'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  InputAdornment,
  CircularProgress,
  IconButton,
  Button,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { API_BASE_URL, CREATE_ALERT_ROUTE, GET_ALERTS_ROUTE, DELETE_ALERT_ROUTE, UPDATE_ALERT_ROUTE } from '../apiRoutes';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import CloseIcon from '@mui/icons-material/Close';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Dashboard() {
  const router = useRouter();
  const [indices, setIndices] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortColumn, setSortColumn] = useState('ticker');
  const [openModal, setOpenModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState('above');
  const [alertEmail, setAlertEmail] = useState('');
  const [userAlerts, setUserAlerts] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [userId ,setUserId]=useState('')

  useEffect(() => {
    fetchIndices();
    fetchUserAlerts();
  }, []);

  
  // const {user}=useAuth()
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUserId(user.uid)
      });
  
      return () => unsubscribe();
    }, []);
  const fetchIndices = async () => {
    try {
      const response = await axios.get('https://api.polygon.io/v3/reference/tickers', {
        params: {
          market: 'stocks',
          active: true,
          order: 'asc',
          limit: 100,
          sort: 'ticker',
          apiKey: 'wsdI9w4vitC__jYP2n6hNQubOU4QlpIC',
        },
      });
      setIndices(response.data.results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching indices:', error);
      setLoading(false);
    }
  };

  const fetchUserAlerts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${GET_ALERTS_ROUTE}`)
      setUserAlerts(response.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch alerts',
        severity: 'error',
      });
    }
  };

  const handleCreateAlert = async () => {
    if (!selectedSymbol || !alertPrice || !alertEmail) {
      setSnackbar({
        open: true,
        message: 'Please fill all fields',
        severity: 'error',
      });
      return;
    }
  
    try {
      await axios.post(`${API_BASE_URL}${CREATE_ALERT_ROUTE}`
        , {
        userId:userId,
        threshold
        : parseFloat(alertPrice),
        comparison
        : alertCondition,
        email: alertEmail,
      });
      setSnackbar({
        open: true,
        message: 'Alert created successfully!',
        severity: 'success',
      });
      setOpenModal(false);
      fetchUserAlerts(); // Fetch alerts after creating a new one
    } catch (error) {
      console.error('Error creating alert:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create alert',
        severity: 'error',
      });
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await axios.delete(`${API_BASE_URL}${DELETE_ALERT_ROUTE}/${alertId}`

      );
      setSnackbar({
        open: true,
        message: 'Alert deleted successfully!',
        severity: 'success',
      });
      fetchUserAlerts(); // Refresh the alert list after deletion
    } catch (error) {
      console.error('Error deleting alert:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete alert',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (column) => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(column);
  };

  const sortedIndices = [...indices].sort((a, b) => {
    if (sortColumn === 'ticker') {
      return sortDirection === 'asc' ? a.ticker.localeCompare(b.ticker) : b.ticker.localeCompare(a.ticker);
    }
    if (sortColumn === 'name') {
      return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    return 0;
  });

  const filteredIndices = sortedIndices.filter((index) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      index.ticker.toLowerCase().includes(searchLower) ||
      index.name.toLowerCase().includes(searchLower) ||
      (index.primary_exchange && index.primary_exchange.toLowerCase().includes(searchLower))
    );
  });
console.log(userAlerts,'userAlerts')
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, height: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        📈 Stock Index Dashboard
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} sx={{ width: '100%' }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  🔍 Browse Stock Indices
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddAlertIcon />}
                  onClick={() => setOpenModal(true)}
                  sx={{ borderRadius: 3 }}
                >
                  Create Alert
                </Button>
              </Box>

              {/* Search input */}
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by ticker, name, or exchange..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                  maxWidth: 400,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Loader and table */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <CircularProgress />
                </Box>
              ) : filteredIndices.length === 0 ? (
                <Typography variant="h6" sx={{ textAlign: 'center', mt: 3 }}>
                  No data available
                </Typography>
              ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, width: '100%' }}>
                  <Table stickyHeader tablelayout="auto">
                    <TableHead>
                      <TableRow>
                        {['Ticker', 'Name', 'Exchange', 'Type', 'Currency', 'Active'].map((header) => (
                          <TableCell
                            key={header}
                            sx={{
                              backgroundColor: '#f0f4f8',
                              fontWeight: 'bold',
                              fontSize: '15px',
                              minWidth: 120,
                            }}
                          >
                            <Box
                              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                              onClick={() => handleSort(header.toLowerCase())}
                            >
                              {header}
                              {sortColumn === header.toLowerCase() && (
                                <IconButton size="small" sx={{ ml: 1 }}>
                                  {sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {filteredIndices
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((index, idx) => (
                          <TableRow
                            key={`${index.ticker}-${idx}`}
                            hover
                            onClick={() => setSelectedSymbol(index.ticker)}
                            sx={{
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                              '&:hover': {
                                backgroundColor: '#e3f2fd',
                              },
                            }}
                          >
                            <TableCell>{index.ticker}</TableCell>
                            <TableCell>{index.name}</TableCell>
                            <TableCell>{index.primary_exchange}</TableCell>
                            <TableCell>{index.type}</TableCell>
                            <TableCell>{index.currency_name}</TableCell>
                            <TableCell>{index.active ? 'Yes' : 'No'}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredIndices.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* User Alerts Section */}
        {/* <Grid item xs={12}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                🔔 Your Price Alerts
              </Typography>
              {userAlerts.length === 0 ? (
                <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
                  No alerts set up yet. Create one to get notified about price changes.
                </Typography>
              ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Symbol</TableCell>
                        <TableCell>Condition</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userAlerts.map((alert) => (
                        <TableRow key={alert._id}>
                          <TableCell>{alert.symbol}</TableCell>
                          <TableCell>{alert.condition === 'above' ? 'Above' : 'Below'}</TableCell>
                          <TableCell>{alert.price}</TableCell>
                          <TableCell>{alert.email}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleDeleteAlert(alert._id)}>
                              <CloseIcon color="error" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>

      {/* Create Alert Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={3}>
            Create Price Alert
          </Typography>
          <TextField
            fullWidth
            label="Symbol"
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={alertEmail}
            onChange={(e) => setAlertEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={alertPrice}
            onChange={(e) => setAlertPrice(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Condition</InputLabel>
            <Select
              value={alertCondition}
              label="Condition"
              onChange={(e) => setAlertCondition(e.target.value)}
            >
              <MenuItem value="above">Price goes above</MenuItem>
              <MenuItem value="below">Price goes below</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleCreateAlert}>
              Create Alert
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}