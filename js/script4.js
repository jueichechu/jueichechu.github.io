const csvFilePath = 'https://jueichechu.github.io/data_and_preprocessing/data.csv';

const margin = { top: 20, right: 140, bottom: 60, left: 80 };
const width = 1100 - margin.left - margin.right;
const height = 650 - margin.top - margin.bottom;

// general function to create scatterplot
async function createScatterPlot4(containerId, xField, yField) {
    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", width + 2 * margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (margin.left - 20) + "," + (margin.top) + ")");

    const data = await d3.csv(csvFilePath);

    // scales and size of scatterplot points
    const x = d3.scaleLinear().domain([0, d3.max(data, d => +d[xField])]).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => +d[yField])]).range([height, 0]);
    const z = d3.scaleSqrt().domain([0, d3.max(data, d => +d['Carbon Dioxide Emissions (Million Metric Tons)'])]).range([4, 20]);

    const color = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.Region))])
        .range(d3.schemeCategory10);

    // x axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text(xField);

    // y axis
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -(margin.left - 20) + 20)
        .attr("x", -height / 2)
        .text(yField);

    // tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "black")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px");

    // datapoints
    svg.append('g')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d[xField]))
        .attr("cy", d => y(d[yField]))
        .attr("r", d => z(d['Carbon Dioxide Emissions (Million Metric Tons)']))
        .style("fill", d => color(d.Region))
        .style("stroke", "white")
        .style("stroke-width", 1)
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`<strong>State:</strong> ${d.State}<br/><strong>${yField}:</strong> ${d[yField]}<br/><strong>${xField}:</strong> ${d[xField]}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this)
                .raise()
                .style("stroke", "black")
                .style("stroke-width", 2);
        })
        .on("mouseout", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);

            d3.select(this)
                .style("stroke", "white")
                .style("stroke-width", 1);
        });

    // color legend
    const legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);

    svg.append("text")
        .attr("x", width - 24)
        .attr("y", -10)
        .attr("text-anchor", "end")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Region");
}

// create scatter plot for fourth scene
createScatterPlot4("#scatterplot", 'Vehicle Registration Counts', 'Carbon Dioxide Emissions (Million Metric Tons)');
