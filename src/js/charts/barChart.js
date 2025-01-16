function createBarChart(svgId, processedData, yLabel, config, maxValue) {
    // Clear previous chart
    d3.select("#" + svgId).selectAll("*").remove();

    const margin = {top: 40, right: 30, bottom: 50, left: 60};
    const width = 260 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#" + svgId)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate averages
    const averages = [
        {
            type: "Outdoor",
            value: d3.mean(processedData.map(d => d.external).filter(v => v !== null)),
            color: "#1b9e77"
        },
        {
            type: "Indoor",
            value: d3.mean(processedData.map(d => d.internal).filter(v => v !== null)),
            color: "#7570b3"
        }
    ];

    // Create scales
    const x = d3.scaleBand()
        .domain(averages.map(d => d.type))
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, maxValue])
        .range([height, 0]);

    // Create tooltip
    const tooltip = createTooltip();

    // Add bars with tooltip interactions
    svg.selectAll(".bar")
        .data(averages)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.type))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => d.color)
        .on("mouseover", function(event, d) {
            const content = `${d.type}: ${formatNumber(d.value)} µg/m³`;
            showTooltip(tooltip, event, content);
        })
        .on("mouseout", function() {
            hideTooltip(tooltip);
        });

    // Add axes and labels
    addAxes(svg, x, y, width, height, margin, null, yLabel);

    // Add title
    addChartTitle(svg, "Overall Mean Values", width, margin);

    // Add WHO annual guideline if available
    if (config.limits?.who_yearly) {
        svg.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(config.limits.who_yearly))
            .attr("y2", y(config.limits.who_yearly))
            .attr("stroke", "#d95f02")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");

        svg.append("text")
            .attr("x", width/2)
            .attr("y", y(config.limits.who_yearly) - 5)
            .attr("text-anchor", "middle")
            .attr("fill", "#d95f02")
            .style("font-size", "12px")
            .text("WHO annual limit");
    }
}