import * as d3 from "d3"

export default {
  build: {
    rollupOptions: {
      external: ['d3']
    }
  }
}

let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
let req = new XMLHttpRequest();

let baseTemp;
let values;

let tempColors = [
  {color: '#011F5B', text: '-4'},
  {color: 'SteelBlue', text: '-3'},
  {color: '#1ca9c9', text: '-2'},
  {color: '#B9D9EB', text: '-1'},
  {color: '#F0E68C', text: '0'},
  {color: '#FFFF00', text: '1'},
  {color: '#FF4500', text: '2'},
  {color: '#FF0800', text: '3'},
  {color: 'rgba(0, 0, 0, 0)', text: 4}
]

let h = 600;
let w = 1300;
let padding = 65;

let xScale;
let yScale;
let colorScale;

let canvas = d3.select('#canvas');
let legend = d3.select('#legend');
let tooltip = d3.select('#tooltip')

const drawCanvas = () => {
canvas.attr("height", h);
canvas.attr("width", w);
};

const createScales = () => {
xScale = d3.scaleLinear()
  .domain([d3.min(values, d => d['year']), d3.max(values, d => d['year'])])
  .range([padding, w - padding]);

yScale = d3.scaleTime()
  .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
  .range([padding, h - padding])

colorScale = d3.scaleLinear()
  .domain([-4, 4])
  .range([0, 250])
};

const drawAxis = () => {
  let xAxis = d3.axisBottom(xScale)
  .tickFormat(d3.format('d'))

  canvas.append('g')
  .call(xAxis)
  .attr('id', 'x-axis')
  .attr('transform', 'translate(0, ' + (h - padding) + ')');

  let yAxis = d3.axisLeft(yScale)
.tickFormat(d3.timeFormat('%B'));

  canvas.append('g')
  .call(yAxis)
  .attr('id', 'y-axis')
  .attr('transform', 'translate(' + padding + ', 0)')

  let colorAxis = d3.axisBottom(colorScale)
  .tickFormat(d3.format('d'))

  legend.append('g')
  .call(colorAxis)
  .attr('id', 'colors')
  .attr('transform', 'translate(0, ' + 30 + ')')
};

const drawRect = () => {

  canvas.selectAll('rect')
.data(values)
.enter()
.append('rect')
.attr('class', 'cell')
.attr('height', (h - (padding * 2)) / 12)
.attr('width', d => 4.12)
.attr('fill', d =>  d['variance'] < -4 ? '#011F5B' : d['variance'] <= -3 ? 'SteelBlue' : d['variance'] <= -2 ? '#99FFFF' : d['variance'] <= -1 ? '#B9D9EB' : d['variance'] <= 0 ?  '#F0E68C': d['variance'] >= 1 ? '#FFFF00' : d['variance'] >= 2 ? '#E44D2E' : '#FF0800')
.attr('data-month', d => new Date(d['month']) - 1) 
.attr('data-year', d => d['year'])
.attr('data-temp', d => baseTemp + d['variance'])
.attr('y', d => yScale(new Date(0, d['month'] - 1, 0, 0, 0, 0)))
.attr('x', d => xScale(d['year']))
.attr('id', 'highlight')
.style('border', 'black')
.on('mouseover', (event, d) => {
  tooltip.transition()
  .style('visibility', 'visible');

  tooltip.attr('data-year', d['year'])

  let months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  tooltip.html(d['year'] + ' ' + months[d['month'] - 1] + ' - ' + '<br />' + (baseTemp + d['variance'])
  + '<br />' + ' (' + d['variance'] + ')'
  )
  .style('left', event.pageX + 4 + 'px')
  .style('top', event.pageY - 55 + 'px')
})
.on('mouseout', (event, d) => {
  tooltip.transition()
  .style('visibility', 'hidden')
})

legend.selectAll('rect')
.data(tempColors)
.enter()
.append('rect')
.attr('height', 20)
.attr('width', 250 / 9)
.attr('fill', d => d['color'])
.attr('x', d => colorScale(d['text']))
};  

req.open("GET", url, true);
req.onload = function() {
  const data = JSON.parse(req.responseText)
  baseTemp = data['baseTemperature']
  values = data['monthlyVariance']
  drawCanvas();
  createScales();
  drawAxis();
  drawRect();
  console.log(baseTemp);
  console.log(values);
}
req.send()
