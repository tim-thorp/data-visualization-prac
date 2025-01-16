// Update pollutant information panel
function updatePollutantInfo(pollutant) {
    const info = pollutantInfo[pollutant];
    const container = d3.select("#pollutant-info");

    container.html("");

    const infoSection = container.append("div")
        .attr("class", "info-section");

    infoSection.append("h3")
        .text(pollutantConfig[pollutant].title);

    infoSection.append("p")
        .text(info.info);
}

// Main visualization update function
function updateVisualization() {
    const activeTab = document.querySelector('.tab-button.active').dataset.tab;
    const activePollutant = document.querySelector('.control-button.active').dataset.pollutant;

    // Load and process data for the active visualization
    d3.csv("data/all_devices_merged.csv").then(data => {
        switch(activeTab) {
            case 'trends':
                const config = pollutantConfig[activePollutant];
                createLineChart("main-chart", data, config.external, config.internal,
                    config.label, config.title, config.limits, config);
                break;
            case 'ventilation':
                createViolinPlot(data, ventilationPollutantConfig[activePollutant]);
                break;
            case 'patterns':
                createHeatmap(data, pollutantConfig[activePollutant]);
                break;
        }
        updatePollutantInfo(activePollutant);
    });
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            // Update active tab button
            document.querySelectorAll('.tab-button').forEach(btn =>
                btn.classList.remove('active'));
            button.classList.add('active');

            // Update active tab content
            document.querySelectorAll('.tab-content').forEach(content =>
                content.classList.remove('active'));
            document.getElementById(button.dataset.tab).classList.add('active');

            // Update visualization
            updateVisualization();
        });
    });

    // Pollutant selection
    document.querySelectorAll('.control-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.control-button').forEach(btn =>
                btn.classList.remove('active'));
            button.classList.add('active');
            updateVisualization();
        });
    });

    // Initial visualization
    updateVisualization();
});