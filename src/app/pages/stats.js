'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Card, CardContent, Typography, Grid, Box, Select, MenuItem, Paper, Divider, useTheme } from '@mui/material';
import axios from 'axios';

const StockMarketCard = () => {
  const theme = useTheme();
  const chartRef = useRef(null);
  const donutChartRef = useRef(null);
  const volumeChartRef = useRef(null);
  const [indices, setIndices] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIndices();
  }, []);

  useEffect(() => {
    if (selectedTicker && indices.length > 0) {
      const selectedStock = indices.find(stock => stock.ticker === selectedTicker);
      if (selectedStock) {
        generateChartData(selectedStock);
      }
    }
  }, [selectedTicker, indices]);

  const fetchIndices = async () => {
    try {
      setLoading(true);
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

  const generateChartData = (stock) => {
    const days = 30;
    const basePrice = 100 + Math.random() * 100;
    const volatility = 0.5 + Math.random() * 2;
    
    const timestamps = [];
    const prices = [];
    const volumes = [];
    const changes = [];
    
    let currentPrice = basePrice;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      timestamps.push(date);
      
      const changePercent = (Math.random() - 0.5) * volatility;
      currentPrice = currentPrice * (1 + changePercent / 100);
      prices.push(parseFloat(currentPrice.toFixed(2)));
      changes.push(parseFloat(changePercent.toFixed(2)));
      
      volumes.push(Math.floor(Math.random() * 10000000) + 1000000);
    }
    
    setChartData({
      timestamps,
      prices,
      volumes,
      changes,
      stockInfo: stock
    });
  };

  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    const chart = echarts.init(chartRef.current);
    
    const option = {
      backgroundColor: theme.palette.background.paper,
      title: {
        text: `${chartData.stockInfo.ticker} - ${chartData.stockInfo.name}`,
        subtext: `Exchange: ${chartData.stockInfo.primary_exchange}`,
        left: 'center',
        textStyle: { 
          fontWeight: 'bold', 
          fontSize: 18,
          color: theme.palette.text.primary
        },
        subtextStyle: {
          color: theme.palette.text.secondary
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        backgroundColor: theme.palette.background.paper,
        borderColor: theme.palette.divider,
        textStyle: {
          color: theme.palette.text.primary
        }
      },
      legend: {
        data: ['Price', 'Daily Change'],
        top: 40,
        textStyle: {
          color: theme.palette.text.primary
        }
      },
      grid: [
        {
          left: '10%',
          right: '8%',
          height: '50%',
        },
        {
          left: '10%',
          right: '8%',
          top: '70%',
          height: '15%',
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
            rotate: 45,
            color: theme.palette.text.secondary
          },
          axisLine: {
            lineStyle: {
              color: theme.palette.divider
            }
          }
        },
        {
          gridIndex: 1,
          type: 'category',
          data: chartData.timestamps.map(date => date.toLocaleDateString()),
          axisLabel: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: theme.palette.divider
            }
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
            formatter: '${value}',
            color: theme.palette.text.secondary
          },
          axisLine: {
            lineStyle: {
              color: theme.palette.divider
            }
          },
          splitLine: {
            lineStyle: {
              color: theme.palette.divider
            }
          }
        },
        {
          type: 'value',
          name: 'Daily Change (%)',
          axisLabel: {
            formatter: '{value}%',
            color: theme.palette.text.secondary
          },
          axisLine: {
            show: false
          },
          splitLine: {
            show: false
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
            },
            color: theme.palette.text.secondary
          },
          axisLine: {
            lineStyle: {
              color: theme.palette.divider
            }
          },
          splitLine: {
            lineStyle: {
              color: theme.palette.divider
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
            color: theme.palette.primary.main
          },
          itemStyle: {
            color: theme.palette.primary.main
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: theme.palette.primary.light },
              { offset: 1, color: theme.palette.primary.light + '00' }
            ])
          },
          markPoint: {
            data: [
              { type: 'max', name: 'Max', symbolSize: 60 },
              { type: 'min', name: 'Min', symbolSize: 60 }
            ],
            label: {
              color: theme.palette.text.primary
            }
          },
          markLine: {
            data: [{ type: 'average', name: 'Avg' }],
            label: {
              color: theme.palette.text.primary
            }
          }
        },
        {
          name: 'Daily Change',
          type: 'line',
          yAxisIndex: 1,
          data: chartData.changes,
          smooth: true,
          lineStyle: {
            width: 2,
            color: theme.palette.secondary.main
          },
          itemStyle: {
            color: theme.palette.secondary.main
          }
        },
        {
          name: 'Volume',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 2,
          data: chartData.volumes,
          itemStyle: {
            color: function(params) {
              if (params.dataIndex === 0) return theme.palette.success.main;
              return chartData.prices[params.dataIndex] > chartData.prices[params.dataIndex - 1] 
                ? theme.palette.success.main 
                : theme.palette.error.main;
            },
            opacity: 0.8
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
  }, [chartData, theme]);

  useEffect(() => {
    if (!donutChartRef.current || !chartData) return;

    const donutChart = echarts.init(donutChartRef.current);

    // More meaningful price ranges
    const minPrice = Math.min(...chartData.prices);
    const maxPrice = Math.max(...chartData.prices);
    const rangeSize = (maxPrice - minPrice) / 3;
    
    const priceRanges = [
      { range: 'Low', min: minPrice, max: minPrice + rangeSize },
      { range: 'Medium', min: minPrice + rangeSize, max: minPrice + rangeSize * 2 },
      { range: 'High', min: minPrice + rangeSize * 2, max: maxPrice },
    ];

    const rangeCounts = priceRanges.map((range) => {
      return chartData.prices.filter((price) => price >= range.min && price <= range.max).length;
    });

    const donutOption = {
      backgroundColor: theme.palette.background.paper,
      title: {
        text: 'Price Range Distribution',
        left: 'center',
        textStyle: { 
          fontWeight: 'bold', 
          fontSize: 16,
          color: theme.palette.text.primary
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: theme.palette.background.paper,
        borderColor: theme.palette.divider,
        textStyle: {
          color: theme.palette.text.primary
        },
        formatter: '{b}: {c} days ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        textStyle: {
          color: theme.palette.text.primary
        }
      },
      
      series: [
        {
          name: 'Price Range',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: theme.palette.background.paper,
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {d}%',
            color: theme.palette.text.primary
          },
          labelLine: {
            lineStyle: {
              color: theme.palette.divider
            }
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          data: priceRanges.map((range, index) => ({
            value: rangeCounts[index],
            name: `${range.range} ($${range.min.toFixed(2)}-$${range.max.toFixed(2)})`,
            itemStyle: {
              color: index === 0 ? theme.palette.error.main : 
                    index === 1 ? theme.palette.warning.main : 
                    theme.palette.success.main,
            },
          })),
        }
      ]
    };

    donutChart.setOption(donutOption);

    const handleResize = () => {
      donutChart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      donutChart.dispose();
    };
  }, [chartData, theme]);

  useEffect(() => {
    if (!volumeChartRef.current || !chartData) return;

    const volumeChart = echarts.init(volumeChartRef.current);

    const volumeOption = {
      backgroundColor: theme.palette.background.paper,
      title: {
        text: 'Volume Trend',
        left: 'center',
        textStyle: { 
          fontWeight: 'bold', 
          fontSize: 16,
          color: theme.palette.text.primary
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: theme.palette.background.paper,
        borderColor: theme.palette.divider,
        textStyle: {
          color: theme.palette.text.primary
        }
      },
      xAxis: {
        type: 'category',
        data: chartData.timestamps.map(date => date.toLocaleDateString()),
        axisLabel: {
          rotate: 45,
          color: theme.palette.text.secondary
        },
        axisLine: {
          lineStyle: {
            color: theme.palette.divider
          }
        }
      },
      yAxis: {
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
          },
          color: theme.palette.text.secondary
        },
        axisLine: {
          lineStyle: {
            color: theme.palette.divider
          }
        },
        splitLine: {
          lineStyle: {
            color: theme.palette.divider
          }
        }
      },
      series: [
        {
          data: chartData.volumes,
          type: 'bar',
          itemStyle: {
            color: function(params) {
              if (params.dataIndex === 0) return theme.palette.success.main;
              return chartData.prices[params.dataIndex] > chartData.prices[params.dataIndex - 1] 
                ? theme.palette.success.main 
                : theme.palette.error.main;
            },
            opacity: 0.8,
            borderRadius: [4, 4, 0, 0]
          },
          showBackground: true,
          backgroundStyle: {
            color: theme.palette.action.hover,
            opacity: 0.1
          }
        }
      ]
    };

    volumeChart.setOption(volumeOption);

    const handleResize = () => {
      volumeChart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      volumeChart.dispose();
    };
  }, [chartData, theme]);

  return (
    <Card sx={{ p: 2, height: '100%', bgcolor: 'background.paper' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Stock Market Stats
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Select
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            fullWidth
            size="small"
            sx={{
              bgcolor: 'background.paper',
              '& .MuiSelect-select': {
                py: 1.5
              }
            }}
            disabled={loading}
          >
            {indices.map((stock) => (
              <MenuItem key={stock.ticker} value={stock.ticker}>
                {stock.ticker} - {stock.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="300px">
            <Typography>Loading data...</Typography>
          </Box>
        ) : chartData ? (
          <Box>
            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <Typography variant="subtitle2">Current Price</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ${chartData.prices[chartData.prices.length - 1].toFixed(2)}
                    </Typography>
                    <Typography variant="caption">
                      {chartData.changes[chartData.changes.length - 1] >= 0 ? '+' : ''}
                      {chartData.changes[chartData.changes.length - 1].toFixed(2)}%
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="subtitle2">30-Day High</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ${Math.max(...chartData.prices).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Typography variant="subtitle2">30-Day Low</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ${Math.min(...chartData.prices).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="subtitle2">Average Price</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ${(chartData.prices.reduce((a, b) => a + b, 0) / chartData.prices.length).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <div ref={chartRef} style={{ width: '100%', height: '700px' }} />
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, height: '100%', bgcolor: 'background.default' }}>
                  <div ref={donutChartRef} style={{ width: '500px', height: '500px' }} />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, height: '100%', bgcolor: 'background.default' }}>
                  <div ref={volumeChartRef} style={{ width: '500px', height: '500px' }} />
                </Paper>
              </Grid>
            </Grid>

            <Paper elevation={0} sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Stock Details
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2">
                    <strong>Ticker:</strong> {chartData.stockInfo.ticker}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2">
                    <strong>Exchange:</strong> {chartData.stockInfo.primary_exchange}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2">
                    <strong>Currency:</strong> {chartData.stockInfo.currency_name.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2">
                    <strong>Market:</strong> {chartData.stockInfo.market}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="300px">
            <Typography>No data available</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StockMarketCard;