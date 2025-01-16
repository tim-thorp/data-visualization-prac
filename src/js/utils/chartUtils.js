// Create and manage tooltips
function createTooltip() {
    return d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
}

function showTooltip(tooltip, event, content) {
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);

    tooltip.html(content)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
}

function hideTooltip(tooltip) {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}

// Add WHO guideline line to charts
function addWHOGuideline(svg, config, x, y, width) {
    if (config.limits?.who) {
        const whoGroup = svg.append("g");

        whoGroup.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(config.limits.who))
            .attr("y2", y(config.limits.who))
            .attr("stroke", "#d95f02")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");

        whoGroup.append("text")
            .attr("x", 5)
            .attr("y", y(config.limits.who) - 5)
            .attr("fill", "#d95f02")
            .style("font-size", "12px")
            .text("WHO 24-hour limit");
    }
}

// Add chart title
function addChartTitle(svg, title, width, margin) {
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(title);
}

// Add axes with labels
function addAxes(svg, x, y, width, height, margin, xLabel, yLabel) {
    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)");

    // Add Y axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add Y axis label
    if (yLabel) {
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(yLabel);
    }

    // Add X axis label
    if (xLabel) {
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .attr("text-anchor", "middle")
            .text(xLabel);
    }
}

// Format numbers for display
const formatNumber = d3.format(".1f");