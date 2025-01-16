function createLineChart(svgId, data, externalColumn, internalColumns, yLabel, chartTitle, limits, config) {
    // Clear previous chart
    d3.select("#" + svgId).selectAll("*").remove();
    d3.select("#bar-chart").selectAll("*").remove();

    const fullChartTitle = `${chartTitle} Concentration (${config.period} Rolling Mean)`;
    const margin = {top: 40, right: 30, bottom: 100, left: 60};
    const extra_space_for_legend = 50;
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom + extra_space_for_legend;

    const svg = d3.select("#" + svgId)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data
    const processedData = processTimeSeriesData(data, externalColumn, internalColumns);
    const rollingAverages = calculateRollingAverages(processedData);

    // Find gaps in data for visualization
    const gaps = findDataGaps(rollingAverages);

    // Calculate max value for y-axis
    const maxValue = Math.max(
        d3.max(rollingAverages, d => d.external || 0),
        d3.max(rollingAverages, d => d.internal || 0),
        limits?.who || 0
    ) * 1.1;

    // Create scales
    const x = d3.scaleTime()
        .domain(d3.extent(rollingAverages, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, maxValue])
        .range([height, 0]);

    // Add missing data background
    svg.selectAll(".gap")
        .data(gaps)
        .enter()
        .append("rect")
        .attr("class", "gap")
        .attr("x", d => x(d.start))
        .attr("y", 0)
        .attr("width", d => x(d.end) - x(d.start))
        .attr("height", height)
        .attr("fill", "#f5f5f5");

    // Create line generators
    const externalLine = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.external))
        .defined(d => d.external !== null);

    const internalLine = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.internal))
        .defined(d => d.internal !== null);

    // Add the lines
    svg.append("path")
        .datum(rollingAverages)
        .attr("class", "line-external")
        .attr("fill", "none")
        .attr("stroke", "#1b9e77")
        .attr("stroke-width", 1.5)
        .attr("d", externalLine);

    svg.append("path")
        .datum(rollingAverages)
        .attr("class", "line-internal")
        .attr("fill", "none")
        .attr("stroke", "#7570b3")
        .attr("stroke-width", 1.5)
        .attr("d", internalLine);

    // Create tooltip
    const tooltip = createTooltip();

    // Add hover effects
    function addHoverArea(className, color) {
        svg.append("path")
            .datum(rollingAverages)
            .attr("class", `hover-area ${className}`)
            .attr("fill", "none")
            .attr("stroke", "transparent")
            .attr("stroke-width", 10)
            .attr("d", className === "external" ? externalLine : internalLine)
            .style("pointer-events", "all")
            .on("mouseover", function() {
                d3.select(`.line-${className}`).style("stroke-width", 3);
            })
            .on("mouseout", function() {
                d3.select(`.line-${className}`).style("stroke-width", 1.5);
                hideTooltip(tooltip);
            })
            .on("mousemove", function(event) {
                const [mouseX] = d3.pointer(event);
                const bisectDate = d3.bisector(d => d.date).left;
                const x0 = x.invert(mouseX);
                const i = bisectDate(rollingAverages, x0, 1);
                const d0 = rollingAverages[i - 1];
                const d1 = rollingAverages[i];
                if (!d0 || !d1) return;

                const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                const value = className === "external" ? d.external : d.internal;

                if (value !== null) {
                    const content = `Date: ${d.date.toLocaleDateString()}<br/>
                        ${className === "external" ? "Outdoor" : "Indoor"}: ${formatNumber(value)} µg/m³`;
                    showTooltip(tooltip, event, content);
                }
            });
    }

    // Add hover areas
    addHoverArea("external", "#1b9e77");
    addHoverArea("internal", "#7570b3");

    // Add axes and labels
    addAxes(svg, x, y, width, height, margin, null, yLabel);

    // Add title
    addChartTitle(svg, fullChartTitle, width, margin);

    // Add WHO guideline
    addWHOGuideline(svg, config, x, y, width);

    // Add legend
    const legendSpacing = 120;
    const totalLegendWidth = legendSpacing * 2;
    const legendStartX = (width - totalLegendWidth) / 2;

    const legendGroup = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${legendStartX}, ${height + 60})`);

    // Add legend items
    const legendData = [
        { label: "Outdoor", color: "#1b9e77" },
        { label: "Indoor", color: "#7570b3" },
        { label: "Missing data", color: "#f5f5f5", border: true }
    ];

    legendData.forEach((item, i) => {
        const legendItem = legendGroup.append("g")
            .attr("transform", `translate(${legendSpacing * i}, 0)`);

        legendItem.append("rect")
            .attr("width", 16)
            .attr("height", 16)
            .attr("fill", item.color)
            .attr("stroke", item.border ? "#ddd" : "none")
            .attr("stroke-width", item.border ? 1 : 0);

        legendItem.append("text")
            .attr("x", 24)
            .attr("y", 12)
            .text(item.label);
    });

    // Create bar chart with the same data
    createBarChart("bar-chart", rollingAverages, yLabel, config, maxValue);
}