'use client'
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Card, CardContent, Typography, Grid, Box, Select, MenuItem } from '@mui/material';
import axios from 'axios';

const StockMarketCard = () => {
  const chartRef = useRef(null);
  const [indices, setIndices] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchIndices();
  }, []);

  useEffect(() => {
    if (selectedTicker && indices.length > 0) {
      // Simulate chart data based on selected ticker
      const selectedStock = indices.find(stock => stock.ticker === selectedTicker);
      if (selectedStock) {
        generateChartData(selectedStock);
      }
    }
  }, [selectedTicker, indices]);

  const fetchIndices = async () => {
    try {
      // This would be your actual API call
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
      
      // For demo purposes, using the provided response data
    //   const demoData = [
    //     {
    //       "ticker": "A",
    //       "name": "Agilent Technologies Inc.",
    //       "market": "stocks",
    //       "locale": "us",
    //       "primary_exchange": "XNYS",
    //       "type": "CS",
    //       "active": true,
    //       "currency_name": "usd",
    //       "cik": "0001090872",
    //       "composite_figi": "BBG000C2V3D6",
    //       "share_class_figi": "BBG001SCTQY4",
    //       "last_updated_utc": "2025-02-27T00:00:00Z"
    //     },
    //     {
    //       "ticker": "AAPL",
    //       "name": "Apple Inc.",
    //       "market": "stocks",
    //       "locale": "us",
    //       "primary_exchange": "XNAS",
    //       "type": "CS",
    //       "active": true,
    //       "currency_name": "usd",
    //       "cik": "0000320193",
    //       "composite_figi": "BBG000B9XRY4",
    //       "share_class_figi": "BBG001S5N8V8",
    //       "last_updated_utc": "2025-04-25T00:00:00Z"
    //     },
    //     {
    //       "ticker": "ABBV",
    //       "name": "ABBVIE INC.",
    //       "market": "stocks",
    //       "locale": "us",
    //       "primary_exchange": "XNYS",
    //       "type": "CS",
    //       "active": true,
    //       "currency_name": "usd",
    //       "cik": "0001551152",
    //       "composite_figi": "BBG0025Y4RY4",
    //       "share_class_figi": "BBG0025Y4RZ3",
    //       "last_updated_utc": "2025-04-25T00:00:00Z"
    //     }
    //   ];
    //   setIndices(demoData);
    } catch (error) {
      console.error('Error fetching indices:', error);
    }
  };

  const generateChartData = (stock) => {
    // Generate mock price data for the last 30 days
    const days = 30;
    const basePrice = 100 + Math.random() * 100; // Random base price between 100-200
    const volatility = 0.5 + Math.random() * 2; // Random volatility
    
    const timestamps = [];
    const prices = [];
    const volumes = [];
    
    let currentPrice = basePrice;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      timestamps.push(date);
      
      // Random price movement
      const changePercent = (Math.random() - 0.5) * volatility;
      currentPrice = currentPrice * (1 + changePercent / 100);
      prices.push(parseFloat(currentPrice.toFixed(2)));
      
      // Random volume
      volumes.push(Math.floor(Math.random() * 10000000) + 1000000);
    }
    
    setChartData({
      timestamps,
      prices,
      volumes,
      stockInfo: stock
    });
  };
console.log(indices)
  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    const chart = echarts.init(chartRef.current);
    
    const option = {
      title: {
        text: `${chartData.stockInfo.ticker} - ${chartData.stockInfo.name}`,
        subtext: `Exchange: ${chartData.stockInfo.primary_exchange}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['Price', 'Volume'],
        top: 40
      },
      grid: [
        {
          left: '10%',
          right: '8%',
          height: '50%'
        },
        {
          left: '10%',
          right: '8%',
          top: '70%',
          height: '15%'
        }
      ],
      xAxis: [
        {
          type: 'category',
          data: chartData.timestamps.map(date => date.toLocaleDateString()),
          axisPointer: {
            type: 'shadow'
          },
          axisLabel: {
            rotate: 45
          }
        },
        {
          gridIndex: 1,
          type: 'category',
          data: chartData.timestamps.map(date => date.toLocaleDateString()),
          axisLabel: {
            show: false
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Price ($)',
          min: Math.min(...chartData.prices) * 0.95,
          max: Math.max(...chartData.prices) * 1.05,
          axisLabel: {
            formatter: '${value}'
          }
        },
        {
          gridIndex: 1,
          type: 'value',
          name: 'Volume',
          axisLabel: {
            formatter: (value) => {
              if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
              }
              if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}K`;
              }
              return value;
            }
          }
        }
      ],
      series: [
        {
          name: 'Price',
          type: 'line',
          data: chartData.prices,
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#1976d2'
          },
          itemStyle: {
            color: '#1976d2'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(25, 118, 210, 0.7)' },
              { offset: 1, color: 'rgba(25, 118, 210, 0.1)' }
            ])
          },
          markPoint: {
            data: [
              { type: 'max', name: 'Max' },
              { type: 'min', name: 'Min' }
            ]
          },
          markLine: {
            data: [{ type: 'average', name: 'Avg' }]
          }
        },
        {
          name: 'Volume',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: chartData.volumes,
          itemStyle: {
            color: function(params) {
              // Color bars green/red based on price change
              if (params.dataIndex === 0) return '#4caf50';
              return chartData.prices[params.dataIndex] > chartData.prices[params.dataIndex - 1] 
                ? '#4caf50' 
                : '#f44336';
            }
          }
        }
      ]
    };

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [chartData]);

  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Stock Market Overview
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Select
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            fullWidth
            size="small"
          >
            {indices.map((stock) => (
              <MenuItem key={stock.ticker} value={stock.ticker}>
                {stock.ticker} - {stock.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
        
        {chartData ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                <strong>Exchange:</strong> {chartData.stockInfo.primary_exchange}
              </Typography>
              <Typography variant="body2">
                <strong>Currency:</strong> {chartData.stockInfo.currency_name.toUpperCase()}
              </Typography>
              <Typography variant="body2">
                <strong>Last Updated:</strong> {new Date(chartData.stockInfo.last_updated_utc).toLocaleDateString()}
              </Typography>
            </Box>
            
            <div ref={chartRef} style={{ width: '100%', height: '1200px' }} />
            
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" align="center">
                    <strong>Current Price</strong><br />
                    ${chartData.prices[chartData.prices.length - 1].toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" align="center">
                    <strong>30-Day High</strong><br />
                    ${Math.max(...chartData.prices).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" align="center">
                    <strong>30-Day Low</strong><br />
                    ${Math.min(...chartData.prices).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        ) : (
          <Typography>Loading chart data...</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StockMarketCard;