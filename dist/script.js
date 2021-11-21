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
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${height})`);
  // call will set in data loading

const yAxis = graph
  .append("g")
  .attr("id", "y-axis")
  .attr("class", "y-axis");
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
  .text("Base temperature: 8.66℃ (1753 to 2015)");

const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .attr("class", "tooltip");

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
    
    /** Set scales */
  
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
    
  })
  .catch((err) => console.error(err));  
