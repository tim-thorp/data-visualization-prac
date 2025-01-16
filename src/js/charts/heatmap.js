function createHeatmap(data, config) {
    // Clear previous chart
    d3.select("#heatmap-container").selectAll("*").remove();

    const margin = { top: 40, right: 80, bottom: 90, left: 80 };
    const width = 1350 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom + 90;

    const svg = d3.select("#heatmap-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data for heatmap
    const heatmapData = processHeatmapData(data, config);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = d3.range(24);

    // Create scales
    const x = d3.scaleBand()
        .range([0, width])
        .domain(hours)
        .padding(0.01);

    const y = d3.scaleBand()
        .range([0, height])
        .domain(days)
        .padding(0.01);

    // Create color scale specific to this pollutant's data
    const colorScale = d3.scaleSequential()
        .interpolator(t => d3.interpolate("#ffffff", "#7570b3")(t))
        .domain([
            d3.min(heatmapData, d => d.value),
            d3.quantile(heatmapData.map(d => d.value), 0.95)
        ]);

    // Create tooltip
    const tooltip = createTooltip();

    // Add heatmap cells
    svg.selectAll("rect")
        .data(heatmapData)
        .join("rect")
        .attr("x", d => x(d.hour))
        .attr("y", d => y(d.day))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => colorScale(d.value))
        .on("mouseover", function(event, d) {
            const content = `${d.day} ${d.hour}:00<br/>Value: ${formatNumber(d.value)} µg/m³`;
            showTooltip(tooltip, event, content);
        })
        .on("mouseout", function() {
            hideTooltip(tooltip);
        });

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d => `${d}:00`));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add legend
    const legendWidth = width / 4;
    const legendHeight = 15;
    const legendY = height + 40;

    const legend = svg.append("g")
        .attr("transform", `translate(${width - legendWidth},${legendY})`);

    // Create gradient
    const gradientId = `heatmap-gradient-${Date.now()}`;
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("x2", "100%");

    // Add gradient stops
    linearGradient.selectAll("stop")
        .data([
            {offset: "0%", color: "#ffffff"},
            {offset: "100%", color: "#7570b3"}
        ])
        .enter()
        .append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // Add gradient rectangle
    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", `url(#${gradientId})`);

    // Add legend labels
    legend.append("text")
        .attr("x", 0)
        .attr("y", legendHeight + 15)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text("Less Polluted");

    legend.append("text")
        .attr("x", legendWidth)
        .attr("y", legendHeight + 15)
        .attr("text-anchor", "end")
        .style("font-size", "12px")
        .text("More Polluted");

    // Add title
    addChartTitle(svg, `Outdoor Pollution by Time and Day: ${config.title}`, width, margin);
}