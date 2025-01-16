function createViolinPlot(data, config) {
    // Clear previous chart
    d3.select("#ventilation-chart").selectAll("*").remove();

    const margin = {top: 50, right: 50, bottom: 80, left: 200};
    const width = 1200 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#ventilation-chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data for violin plot
    const ventData = processVentilationData(data, config);

    // Process data: remove outliers and calculate device medians
    const processedVentData = {};
    Object.entries(ventData).forEach(([ventType, deviceArrays]) => {
        const hasAllDevices = deviceArrays.every(arr => arr.length > 0);
        if (hasAllDevices) {
            const cleanedDeviceArrays = deviceArrays.map(arr => removeOutliers(arr));
            processedVentData[ventType] = cleanedDeviceArrays.map(arr => arr.sort(d3.ascending));
        }
    });

    const ventTypes = ["no ventilation", "1 window", "2 windows"];
    const allValues = Object.values(processedVentData).flat(2);

    // Create scales
    const y = d3.scaleBand()
        .range([height, 0])
        .domain(ventTypes)
        .padding(0.2);

    const x = d3.scaleLinear()
        .range([0, width])
        .domain([0, d3.max(allValues)]);

    // Create tooltip
    const tooltip = createTooltip();

    // Draw violin plots for each ventilation type
    ventTypes.forEach(ventType => {
        const deviceArrays = processedVentData[ventType];
        if (!deviceArrays) return;

        const yPos = y(ventType);
        const height = y.bandwidth();

        // Combine data from all devices with equal weighting
        const combinedValues = [];
        const deviceSampleSize = Math.min(...deviceArrays.map(arr => arr.length));

        deviceArrays.forEach(deviceData => {
            const sampledData = d3.shuffle(deviceData).slice(0, deviceSampleSize);
            combinedValues.push(...sampledData);
        });

        // Generate violin plot points
        const binCount = 50;
        const bandwidth = (x.domain()[1] - x.domain()[0]) / binCount;
        const violinPoints = [];
        const bins = d3.range(x.domain()[0], x.domain()[1], bandwidth);

        bins.forEach(bin => {
            const count = combinedValues.filter(v => v >= bin && v < bin + bandwidth).length;
            violinPoints.push([bin, count / combinedValues.length / bandwidth]);
        });

        // Scale violin height
        const maxDensity = d3.max(violinPoints, d => d[1]);
        const violinScale = d3.scaleLinear()
            .domain([0, maxDensity])
            .range([0, height/2]);

        // Draw violin
        const area = d3.area()
            .x(d => x(d[0]))
            .y0(d => yPos + height/2 - violinScale(d[1]))
            .y1(d => yPos + height/2 + violinScale(d[1]))
            .curve(d3.curveBasis);

        svg.append("path")
            .datum(violinPoints)
            .attr("class", "violin")
            .attr("d", area)
            .style("fill", "#e6e6e6")
            .style("opacity", 0.6);

        // Calculate box plot statistics
        const stats = {
            q1: d3.quantile(combinedValues, 0.25),
            median: d3.quantile(combinedValues, 0.5),
            q3: d3.quantile(combinedValues, 0.75),
            min: d3.min(combinedValues),
            max: d3.max(combinedValues)
        };

        // Draw box
        svg.append("rect")
            .attr("x", x(stats.q1))
            .attr("y", yPos + height/4)
            .attr("width", x(stats.q3) - x(stats.q1))
            .attr("height", height/2)
            .attr("stroke", "black")
            .attr("fill", "#7570b3")
            .attr("opacity", 0.7)
            .style("cursor", "pointer")
            .on("mouseover", function(event) {
                const content = `
                    Q1: ${formatNumber(stats.q1)} µg/m³<br/>
                    Median: ${formatNumber(stats.median)} µg/m³<br/>
                    Q3: ${formatNumber(stats.q3)} µg/m³
                `;
                showTooltip(tooltip, event, content);
            })
            .on("mouseout", () => hideTooltip(tooltip));

        // Draw median line
        svg.append("line")
            .attr("x1", x(stats.median))
            .attr("x2", x(stats.median))
            .attr("y1", yPos + height/4)
            .attr("y2", yPos + 3*height/4)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("mouseover", function(event) {
                showTooltip(tooltip, event, `Median: ${formatNumber(stats.median)} µg/m³`);
            })
            .on("mouseout", () => hideTooltip(tooltip));

        // Draw whiskers
        const whiskers = [
            {type: "min", value: stats.min},
            {type: "max", value: stats.max}
        ];

        whiskers.forEach(w => {
            const x1 = w.type === "min" ? x(stats.min) : x(stats.q3);
            const x2 = w.type === "min" ? x(stats.q1) : x(stats.max);

            // Horizontal whisker line
            svg.append("line")
                .attr("x1", x1)
                .attr("x2", x2)
                .attr("y1", yPos + height/2)
                .attr("y2", yPos + height/2)
                .attr("stroke", "black")
                .style("cursor", "pointer")
                .on("mouseover", function(event) {
                    showTooltip(tooltip, event,
                        `${w.type === "min" ? "Min" : "Max"}: ${formatNumber(w.value)} µg/m³`);
                })
                .on("mouseout", () => hideTooltip(tooltip));

            // Vertical whisker end
            svg.append("line")
                .attr("x1", w.type === "min" ? x1 : x2)
                .attr("x2", w.type === "min" ? x1 : x2)
                .attr("y1", yPos + height/3)
                .attr("y2", yPos + 2*height/3)
                .attr("stroke", "black");
        });
    });

    // Add axes with custom y-axis font size
    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font-size", "14px");

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Add X axis label if provided
    if (config.label) {
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .attr("text-anchor", "middle")
            .text(config.label);
    }

    // Add title
    addChartTitle(svg, `Indoor Air Pollution by Ventilation Method: ${config.title}`, width, margin);
}