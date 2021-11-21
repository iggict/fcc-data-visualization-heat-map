/** Set size */

const margin = {
  top: 80,
  right: 20,
  bottom: 80,
  left: 80,
};

const parentWidth = 900;
const parentHeight = 500;

const width = parentWidth - margin.left - margin.right;
const height = parentHeight - margin.top - margin.bottom;

/** X and Y scales */

const xScale = d3.scaleBand().range([0, width]);
// domain will set in data loading

const yScale = d3.scaleBand().range([0, height]);
// domain will set in data loading

/** D3 containers */

const graph = d3
  .select("body")
  .append("div")
  .attr("class", "container")
  .append("svg")
  .attr("id", "graph")
  .attr("class", "graph")
  .attr("width", parentWidth)
  .attr("height", parentHeight)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const xAxis = graph
  .append("g")
  .attr("id", "x-axis")
  .attr("class", "axis x-axis")
  .attr("transform", `translate(0, ${height})`);
  // call will set in data loading

const yAxis = graph
  .append("g")
  .attr("id", "y-axis")
  .attr("class", "axis y-axis");
  // call will set in data loading

const title = graph
  .append("text")
  .attr("id", "title")
  .attr("class", "title")
  .attr("x", width / 2)
  .attr("y", -margin.top / 2 - 15)
  .text("Monthly Global Land-Surface Temperature");

const subtitle = graph
  .append("text")
  .attr("class", "subtitle")
  .attr("x", width / 2)
  .attr("y", -margin.top / 2 + 20)
  // Text will set in data loading

const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .attr("class", "tooltip")
;

/** Load data */

const JSONFile =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

d3.json(JSONFile)
  .then((data) => {
  
    /** Parse data */
    
    const baseTemp = data.baseTemperature;
 
    const dataset = data.monthlyVariance.map(d => (
      {...d, temperature: parseFloat((baseTemp + d.variance).toFixed(3))}
    ));
  
    const [minYear, maxYear] = d3.extent(dataset, (d) => d.year);
    const [minTemp, maxTemp] = d3.extent(dataset, (d) => d.temperature);
    
    /** Set subtitle text */
      
    subtitle
      .text(`Base temperature: ${baseTemp}℃ (${minYear} to ${maxYear})`);
  
    /** Color Brewer */
        
    const colors = d3
      .scaleQuantize()
      .domain([minTemp, maxTemp]) 
      .range(d3.schemeRdYlBu[10].reverse()) // 10 = num of colors
     ;
 
   /** Set scale domain */
  
    xScale.domain(dataset.map(d => d.year));
    yScale.domain(dataset.map(d => d.month));

    /** Set axis */

    const monthNumToName = (monthNum) => {
      const formatMonth = d3.timeFormat('%b');
      // Note: setUTCMonth expects values from 0 to 11
      return formatMonth(new Date().setUTCMonth(monthNum-1)); 
    };
  
    xAxis.call(d3
      .axisBottom(xScale)
      .tickValues(
        // Each x-axis tick for a 10 years period
        xScale.domain().filter(y => y % 10 === 0)
       )
    );
    
    yAxis.call(d3
      .axisLeft(yScale)
      .tickFormat(m => monthNumToName(m))
    );
   
    /** Set map */
  
    const cell = graph
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(d.month))
      .attr("width", (d) => xScale.bandwidth(d.year))
      .attr("height", (d) => yScale.bandwidth(d.month))
      .style("fill", (d) => colors(d.temperature))
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(300).style("opacity", 0.75);
        
        const tooltipMargin = 10;
        
        const tooltipInnerHtml = (item) => (
          `<span class="tt-year">${item.year}</span> - 
           <span class="tt-month">${monthNumToName(item.month)}</span>
           <br />
           <span class="tt-temperature">${item.temperature.toFixed(1)}ºC</span>
           <br />
           <span class="tt-variance">${item.variance.toFixed(1)}ºC</span>
            <hr class="tt-color" 
              style="border-color: ${colors(d.temperature)}"/>`
        );
        
        tooltip
          .style("top", (event.pageY || event.x) + tooltipMargin + "px")
          .style("left", (event.pageX || event.y) + tooltipMargin + "px")
          .attr("transform", `translate(10, 10`)
          .html(tooltipInnerHtml(d));
      })
      .on("mouseout", () => {
        tooltip.transition().duration(300).style("opacity", 0);
      });
  })
  .catch((err) => console.error(err));  
