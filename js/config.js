// Pollutant configuration for trend analysis
const pollutantConfig = {
    pm25: {
        external: "EXT_PM2.5",
        internal: ["PM2.5_DEVICE_1", "PM2.5_DEVICE_2", "PM2.5_DEVICE_3", "PM2.5_DEVICE_4", "PM2.5_DEVICE_5"],
        label: "PM2.5 (µg/m³)",
        title: "PM2.5",
        limits: { who: 15, who_yearly: 5 },
        period: "24-hour"
    },
    pm10: {
        external: "EXT_PM10",
        internal: ["PM10_DEVICE_1", "PM10_DEVICE_2", "PM10_DEVICE_3", "PM10_DEVICE_4", "PM10_DEVICE_5"],
        label: "PM10 (µg/m³)",
        title: "PM10",
        limits: { who: 45, who_yearly: 15 },
        period: "24-hour"
    },
    no2: {
        external: "EXT_NO2",
        internal: ["NO2_DEVICE_1", "NO2_DEVICE_2", "NO2_DEVICE_3", "NO2_DEVICE_4", "NO2_DEVICE_5"],
        label: "NO₂ (µg/m³)",
        title: "NO₂",
        limits: { who: 25, who_yearly: 10 },
        period: "24-hour"
    }
};

// Configuration for ventilation analysis
const ventilationPollutantConfig = {
    pm25: {
        internal: ["PM2.5_DEVICE_1", "PM2.5_DEVICE_2", "PM2.5_DEVICE_3", "PM2.5_DEVICE_4", "PM2.5_DEVICE_5"],
        label: "PM2.5 (µg/m³)",
        title: "PM2.5",
        limits: { who: 15 }
    },
    pm10: {
        internal: ["PM10_DEVICE_1", "PM10_DEVICE_2", "PM10_DEVICE_3", "PM10_DEVICE_4", "PM10_DEVICE_5"],
        label: "PM10 (µg/m³)",
        title: "PM10",
        limits: { who: 45 }
    },
    no2: {
        internal: ["NO2_DEVICE_1", "NO2_DEVICE_2", "NO2_DEVICE_3", "NO2_DEVICE_4", "NO2_DEVICE_5"],
        label: "NO₂ (µg/m³)",
        title: "NO₂",
        limits: { who: 25 }
    }
};

// Information about each pollutant
const pollutantInfo = {
    pm25: {
        info: "PM2.5 are microscopic particles (2.5 micrometers or smaller) that primarily come from vehicle emissions and industrial processes. In Barcelona, traffic is a major contributor. These particles can penetrate deep into the lungs and enter the bloodstream, causing respiratory and cardiovascular problems. Short-term exposure irritates the eyes, nose, and throat, while long-term exposure can lead to chronic bronchitis and reduced lung function. Children, older adults, and those with existing heart or lung conditions are most vulnerable."
    },
    pm10: {
        info: "PM10 particles (10 micrometers or smaller) come from road dust, construction sites, and in Barcelona, natural sources like sea salt and Saharan dust. While larger than PM2.5, these particles enter the respiratory system and can cause breathing difficulties, coughing, and wheezing. They particularly affect people with asthma and bronchitis, and pose higher risks to children and the elderly. Unlike PM2.5, PM10 particles typically don't reach the bloodstream but can cause significant respiratory irritation."
    },
    no2: {
        info: "Nitrogen dioxide (NO₂) is a gas primarily from vehicle exhaust and fuel burning. In Barcelona's urban environment, high levels typically occur in high-traffic areas and during peak commuting hours. NO₂ exposure irritates airways and worsens respiratory conditions, especially asthma. Long-term exposure may lead to asthma development and increased susceptibility to respiratory infections. Recent research also suggests links to cardiovascular problems. Children and people with respiratory conditions are particularly vulnerable."
    }
};