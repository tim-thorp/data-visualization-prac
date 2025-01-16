// Process time series data for line and bar charts
function processTimeSeriesData(data, externalColumn, internalColumns) {
    return data.map(d => {
        const internalValues = internalColumns.map(col => {
            const val = d[col];
            return (val === '' || val === undefined || val === null) ? null : +val;
        }).filter(val => val !== null);

        return {
            date: new Date(d['date_bin']),
            external: (d[externalColumn] === '' || d[externalColumn] === undefined || d[externalColumn] === null) ?
                null : +d[externalColumn],
            internal: internalValues.length >= 2 ? d3.median(internalValues) : null
        };
    }).filter(d => d.date && !isNaN(d.date.getTime()))
        .sort((a, b) => a.date - b.date);
}

// Calculate rolling averages for time series data
function calculateRollingAverages(data, windowHours = 24) {
    const windowMilliseconds = windowHours * 60 * 60 * 1000;

    return data.map((currentPoint, i) => {
        const currentTime = currentPoint.date.getTime();
        let windowStart = i;

        while (windowStart > 0 &&
        (currentTime - data[windowStart - 1].date.getTime()) <= windowMilliseconds) {
            windowStart--;
        }

        const windowData = data.slice(windowStart, i + 1);
        const timeSpan = currentTime - windowData[0].date.getTime();
        const coverage = timeSpan / windowMilliseconds;

        const internal = windowData
            .filter(d => d.internal !== null)
            .map(d => d.internal);

        const external = windowData
            .filter(d => d.external !== null)
            .map(d => d.external);

        return {
            date: currentPoint.date,
            internal: coverage >= 0.75 && internal.length > 0 ?
                d3.mean(internal) : null,
            external: coverage >= 0.75 && external.length > 0 ?
                d3.mean(external) : null
        };
    });
}

// Process data for ventilation analysis
function processVentilationData(data, config) {
    const MIN_DURATION = 30;
    const ventData = {};

    data.forEach(d => {
        config.internal.forEach((col, deviceIndex) => {
            const value = parseFloat(d[col]);
            const ventType = d[`VENT_TYPE_DEVICE_${deviceIndex + 1}`];
            const ventTime = d[`VENT_TIME_DEVICE_${deviceIndex + 1}`];

            if (!isNaN(value) && value > 0 && ventType && ventType !== "" && ventTime >= MIN_DURATION) {
                if (!ventData[ventType]) {
                    ventData[ventType] = Array(config.internal.length).fill().map(() => []);
                }
                ventData[ventType][deviceIndex].push(value);
            }
        });
    });

    return ventData;
}

// Remove statistical outliers using Tukey's method
function removeOutliers(arr) {
    if (arr.length === 0) return arr;
    const sortedArr = arr.sort((a, b) => a - b);
    const q1 = d3.quantile(sortedArr, 0.25);
    const q3 = d3.quantile(sortedArr, 0.75);
    const iqr = q3 - q1;
    const validRange = [q1 - 2.0 * iqr, q3 + 2.0 * iqr];
    return arr.filter(d => d >= validRange[0] && d <= validRange[1]);
}

// Process data for heatmap
function processHeatmapData(data, config) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = d3.range(24);
    const timeData = {};

    // Collect values for each day-hour combination
    data.forEach(d => {
        const date = new Date(d.date_bin);
        let dayIndex = date.getDay() - 1;
        if (dayIndex < 0) dayIndex = 6;
        const day = days[dayIndex];
        const hour = date.getHours();
        const key = `${day}-${hour}`;

        if (!timeData[key]) {
            timeData[key] = {
                deviceValues: Array(config.internal.length).fill([])
            };
        }

        config.internal.forEach((col, deviceIndex) => {
            const value = parseFloat(d[col]);
            if (!isNaN(value) && value > 0) {
                timeData[key].deviceValues[deviceIndex] =
                    timeData[key].deviceValues[deviceIndex].concat(value);
            }
        });
    });

    // Calculate final heatmap data with medians
    const heatmapData = [];
    days.forEach(day => {
        hours.forEach(hour => {
            const key = `${day}-${hour}`;
            const timeSlot = timeData[key];

            if (timeSlot) {
                const hasAllDevices = timeSlot.deviceValues.every(deviceData => deviceData.length > 0);

                if (hasAllDevices) {
                    const deviceMedians = timeSlot.deviceValues.map(deviceData =>
                        d3.median(deviceData)
                    );

                    const overallMedian = d3.median(deviceMedians);

                    heatmapData.push({
                        day: day,
                        hour: hour,
                        value: overallMedian,
                        count: timeSlot.deviceValues.length
                    });
                }
            }
        });
    });

    return heatmapData;
}

// Find data gaps for visualization
function findDataGaps(data) {
    const gaps = [];
    let currentGap = null;

    data.forEach((point, i) => {
        if (point.external === null || point.internal === null) {
            if (!currentGap) {
                currentGap = { start: point.date };
            }
        } else if (currentGap) {
            currentGap.end = point.date;
            gaps.push(currentGap);
            currentGap = null;
        }
    });

    if (currentGap) {
        currentGap.end = data[data.length - 1].date;
        gaps.push(currentGap);
    }

    return gaps;
}