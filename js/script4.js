const csvFilePath = 'https://jueichechu.github.io/data_and_preprocessing/data.csv';

const margin = {top: 20, right: 140, bottom: 60, left: 80};
const width = 1100 - margin.left - margin.right;
const height = 650 - margin.top - margin.bottom;

async function createScatterPlot4(containerId, xField, yField) {
    d3.select(containerId).selectAll("*").remove();  // clear existing content in container
    
    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", width + 2 * margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (margin.left - 20) + "," + (margin.top) + ")");

    const data = await d3.csv(csvFilePath);

    const x = d3.scaleLinear().domain([0, d3.max(data, d => +d[xField])]).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => +d[yField])]).range([height, 0]);
    const z = d3.scaleSqrt().domain([0, d3.max(data, d => +d['Carbon Dioxide Emissions (Million Metric Tons)'])]).range([3, 20]);

    const color = d3.scaleOrdinal().domain([...new Set(data.map(d => d.Region))]).range(d3.schemeCategory10);

    const xAxis = svg.append("g")
        .attr("class", "x axis") // assign class to x axis to be able to call later 
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    const xAxisLabel = svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text(xField);

    const yAxis = svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    const yAxisLabel = svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -(margin.left - 20) + 20)
        .attr("x", -height / 2)
        .text(yField);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0) // initial opacity of tooltip should be 0 (hidden)
        .style("background-color", "black")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px");

    const circles = svg.append('g')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d[xField]))
        .attr("cy", d => y(d[yField]))
        .attr("r", d => z(d['Carbon Dioxide Emissions (Million Metric Tons)'])) // radius of the scatterplot point
        .style("fill", d => color(d.Region)) // set fill color based on region
        .style("stroke", "white")
        .style("stroke-width", 1)
        .on("mouseover", function (event, d) { // mouseover event listener for tooltip
            if (d3.select(this).style("opacity") !== '0') { 
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9); // show tooltip
                tooltip.html(`<strong>State:</strong> ${d.State}<br/><strong>${yField}:</strong> ${d[yField]}<br/><strong>${xField}:</strong> ${d[xField]}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");

                d3.select(this)
                    .raise() // raise the chosen scatterplot point to front
                    .style("stroke", "black") // highlight with black border
                    .style("stroke-width", 2);
            }
        })
        .on("mouseout", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0); // hide the tooltip

            d3.select(this)
                .style("stroke", "white") // set to unhighlight (white border)
                .style("stroke-width", 1);
        });

    const legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`)
        .style("cursor", "pointer") // change cursor to pointer when mouseover
        .on("mouseover", function () {
            d3.select(this).select("rect").style("stroke", "black").style("stroke-width", 2); // indicate mouseover by highlighting the color rect with black border
            d3.select(this).select("text").style("font-weight", "bold"); // indicate mouseover by highlighting the text with bold
        })
        .on("mouseout", function () {
            d3.select(this).select("rect").style("stroke", "none"); // unhighlight by clearing the black border 
            d3.select(this).select("text").style("font-weight", "normal"); // unhighlight by clearing the bold font to normal 
        })
        // filter visibility of circles based on region when a legend item is clicked
        .on("click", function(event, d) {
            const regionClass = `dot-${d.replace(/\s+/g, '-')}`;
            const currentOpacity = d3.selectAll(`.${regionClass}`).style("opacity"); // get current opacity 
            const newOpacity = currentOpacity == 1 ? 0 : 1; // toggle the new opacity if clicked
            d3.selectAll(`.${regionClass}`).style("opacity", newOpacity); // set the corresponding scatterplot point to hide or appear (set opacity to newOpacity)
            d3.select(this).style("opacity", newOpacity == 1 ? 1 : 0.25); // dim the text and color legend (set opacity of legend item)

            if (newOpacity == 0) { // make sure that tooltip is hidden when the scatterplot disappears (toggled off)
                tooltip.style("opacity", 0);
            }
        });

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

    // assign class to each circle for filtering by region
    circles.attr("class", d => `dot-${d.Region.replace(/\s+/g, '-')}`);
}

// similar to createScatterPlot but adding transition to axes and points
async function updateScatterPlot() {
    const yField = document.querySelector('input[name="y-axis-radio"]:checked').value;
    const xField = document.querySelector('input[name="x-axis-radio"]:checked').value;

    const data = await d3.csv(csvFilePath);

    const x = d3.scaleLinear().domain([0, d3.max(data, d => +d[xField])]).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => +d[yField])]).range([height, 0]);
    const z = d3.scaleSqrt().domain([0, d3.max(data, d => +d['Carbon Dioxide Emissions (Million Metric Tons)'])]).range([3, 20]);

    const color = d3.scaleOrdinal().domain([...new Set(data.map(d => d.Region))]).range(d3.schemeCategory10);

    const svg = d3.select("#scatterplot svg g");

    svg.selectAll("circle")
        .data(data)
        .transition()
        .duration(1000)
        .attr("cx", d => x(d[xField]))
        .attr("cy", d => y(d[yField]))
        .attr("r", d => z(d['Carbon Dioxide Emissions (Million Metric Tons)']))
        .style("fill", d => color(d.Region))
        .attr("class", d => `dot-${d.Region.replace(/\s+/g, '-')}`); // update class attribute

    svg.select("g.x.axis")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x));

    svg.select("g.y.axis")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y));

    svg.select("text.x.label")
        .transition()
        .duration(1000)
        .text(xField);

    svg.select("text.y.label")
        .transition()
        .duration(1000)
        .text(yField);

    const tooltip = d3.select("body").select(".tooltip");

    svg.selectAll("circle")
        .on("mouseover", function (event, d) {
            if (d3.select(this).style("opacity") !== '0') { 
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
            }
        })
        .on("mouseout", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);

            d3.select(this)
                .style("stroke", "white")
                .style("stroke-width", 1);
        });

    // re-attach legend click event listeners to ensure filtering works after update
    d3.selectAll(".legend").on("click", function(event, d) {
        const regionClass = `dot-${d.replace(/\s+/g, '-')}`;
        const currentOpacity = d3.selectAll(`.${regionClass}`).style("opacity"); 
        const newOpacity = currentOpacity == 1 ? 0 : 1; 
        d3.selectAll(`.${regionClass}`).style("opacity", newOpacity);
        d3.select(this).style("opacity", newOpacity == 1 ? 1 : 0.25); 

        if (newOpacity == 0) { 
            tooltip.style("opacity", 0);
        }
    });
}

// event listeners to radio buttons for updating the scatter plot.
document.querySelectorAll('input[name="y-axis-radio"]').forEach(radio => {
    radio.addEventListener('change', updateScatterPlot);
});

document.querySelectorAll('input[name="x-axis-radio"]').forEach(radio => {
    radio.addEventListener('change', updateScatterPlot);
});

// initial scatterplot with default x and y fields, no annotations set for this graph
createScatterPlot4("#scatterplot", 'State Population', 'Carbon Dioxide Emissions (Million Metric Tons)');
