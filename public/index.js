const colorForm = document.getElementById('colorForm');
const svg = d3.select('#barGraph');
const margin = { top: 40, right: 50, bottom: 300, left: 120 };
const width = 1000 - margin.left - margin.right;
const height = 1000 - margin.top - margin.bottom;

colorForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const color = document.getElementById('color').value;
  
  try {
    const response = await fetch(`/data?color=${color}`);
    const data = await response.json();
    
    drawBarGraph(data, color);
  } catch (error) {
    console.error('Error:', error);
  }
});
//useed this video to help with the bar graph https://www.youtube.com/watch?v=BDpBAFvdjYo
function drawBarGraph(data, color) {
  svg.selectAll('*').remove(); 
  
  const x = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .nice()
    .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x)
            .tickValues(x.domain().filter((d, i) => i % 5 === 0)) // Show every 5th tick
            .tickSizeOuter(0));
  const yAxis = g => g
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select('.domain').remove());

  svg.append('g')
    .attr('fill', color)
    .selectAll('rect')
    .data(data)
    .join('rect')
      .attr('x', d => x(d.year))
      .attr('y', d => y(d.value))
      .attr('height', d => y(0) - y(d.value))
      .attr('width', x.bandwidth());

  svg.append('g')
    .call(xAxis);

  svg.append('g')
    .call(yAxis);
}
