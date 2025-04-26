'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  InputAdornment
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import SearchIcon from '@mui/icons-material/Search';

export default function Dashboard() {
  const router = useRouter();
  const [indices, setIndices] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [chartData, setChartData] = useState(null);
  const [priceThreshold, setPriceThreshold] = useState('');
  const [condition, setCondition] = useState('above');
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchIndices();
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      // fetchChartData();
    }
  }, [selectedSymbol]);

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
    } catch (error) {
      console.error('Error fetching indices:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      const now = Math.floor(Date.now() / 1000);
      const oneMonthAgo = now - 30 * 24 * 60 * 60;
      
      const response = await axios.get('/stock/candle', {
        params: {
          symbol: selectedSymbol,
          resolution: 'D',
          from: oneMonthAgo,
          to: now,
        },
      });

      setChartData({
        timestamps: response.data.t.map(t => new Date(t * 1000)),
        prices: response.data.c,
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const handleSetAlert = async () => {
    try {
      await axios.post('/alerts', {
        symbol: selectedSymbol,
        price: parseFloat(priceThreshold),
        condition,
        email: user.email,
      });
      alert('Alert set successfully!');
    } catch (error) {
      console.error('Error setting alert:', error);
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter indices based on search term
  const filteredIndices = indices.filter((index) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      index.ticker.toLowerCase().includes(searchLower) ||
      index.name.toLowerCase().includes(searchLower) ||
      (index.primary_exchange && index.primary_exchange.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Stock Index Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedSymbol} Chart
              </Typography>
              {chartData ? (
                <LineChart
                  xAxis={[{
                    data: chartData.timestamps,
                    scaleType: 'time',
                  }]}
                  series={[{
                    data: chartData.prices,
                  }]}
                  height={400}
                />
              ) : (
                <Typography>Loading chart data...</Typography>
              )}
            </CardContent>
          </Card>
        </Grid> */}

        {/* <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Stock
              </Typography>
              <Select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                fullWidth
              >
                {indices.map((index) => (
                  <MenuItem key={index.ticker} value={index.ticker}>
                    {index.name} ({index.ticker})
                  </MenuItem>
                ))}
              </Select>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Set Price Alert
                </Typography>
                <TextField
                  label="Price Threshold"
                  type="number"
                  fullWidth
                  value={priceThreshold}
                  onChange={(e) => setPriceThreshold(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="above">Price goes above</MenuItem>
                  <MenuItem value="below">Price goes below</MenuItem>
                </Select>
                <Button
                  variant="contained"
                  onClick={handleSetAlert}
                  disabled={!priceThreshold}
                >
                  Set Alert
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid> */}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stock Indices
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by ticker, name or exchange"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ticker</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Exchange</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Currency</TableCell>
                      <TableCell>Active</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredIndices
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((index) => (
                        <TableRow 
                          key={index.ticker} 
                          hover
                          onClick={() => setSelectedSymbol(index.ticker)}
                          style={{ cursor: 'pointer' }}
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
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredIndices.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}