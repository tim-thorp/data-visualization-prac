# PRAC: Visualization Project 

An interactive visualization dashboard for analyzing indoor and outdoor air quality measurements from multiple sensors in Barcelona's Sants neighborhood. The dashboard provides insights into pollution patterns, ventilation effectiveness, and temporal trends for key air quality indicators.

## Features

- Comparative analysis of indoor vs. outdoor air quality trends
- Ventilation effectiveness analysis across different methods
- Daily and weekly pollution patterns visualization
- Interactive visualizations for PM2.5, PM10, and NO₂

## Project Structure

```
project/
├── index.html                  # Main HTML file
├── css/
│   ├── styles.css              # Main styles
│   └── components/
│       ├── nav.css             # Navigation styles
│       └── charts.css          # Chart and tooltip styles
├── js/
│   ├── main.js                 # Main application logic and initialization
│   ├── config.js               # Configuration objects and constants
│   ├── utils/
│   │   ├── dataProcessing.js   # Data processing utilities
│   │   └── chartUtils.js       # Shared chart utilities
│   └── charts/
│       ├── lineChart.js        # Line chart implementation
│       ├── barChart.js         # Bar chart implementation
│       ├── heatmap.js          # Heatmap implementation
│       └── violinPlot.js       # Violin plot implementation
└── data/
    ├── all_devices_merged.csv  # Main dataset used by the application
    ├── device1.csv             # Original data from device 1
    ├── device2.csv             # Original data from device 2
    ├── device3.csv             # Original data from device 3
    ├── device4.csv             # Original data from device 4
    ├── device5.csv             # Original data from device 5
    └── data_preparation.ipynb  # Data cleaning and merging notebook
```

## Dependencies

- D3.js

## Data Processing

The dashboard uses data from five different air quality monitoring devices. The data processing workflow is as follows:

1. Raw data is collected from individual devices (device1.csv through device5.csv)
2. Data is cleaned and merged using the Jupyter notebook (data_preparation.ipynb)
3. The resulting merged dataset (`all_devices_merged.csv`) is used by the dashboard


## Usage

The dashboard provides three main views:

1. **Indoor vs. Outdoor Air Trends**
    - Compare indoor and outdoor pollution levels
    - View rolling averages and overall means
    - Identify data gaps and patterns

2. **Indoor Air by Ventilation Method**
    - Analyze effectiveness of different ventilation strategies
    - Compare pollution levels across ventilation types
    - View statistical distributions using violin plots

3. **Outdoor Air Daily Patterns**
    - Explore temporal patterns in outdoor pollution
    - Identify peak pollution hours
    - Compare weekday vs. weekend patterns

Use the top navigation to switch between views and the pollutant selector to change between PM2.5, PM10, and NO₂ measurements.

## Acknowledgments

- Air quality data provided by 16TIMES (https://www.16times.com/)
- Built with D3.js (https://d3js.org/)
- Color schemes from ColorBrewer (https://colorbrewer2.org/)