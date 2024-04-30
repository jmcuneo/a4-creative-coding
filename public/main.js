
fetch('/data')
  .then(response => response.json())
  .then(data => {
    //followed this video - https://www.youtube.com/watch?v=BDpBAFvdjYo
    const width = 800;
    const height = 400;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };


    // Append SVG to chart container
    const svg = d3.select('#chart-container')
                  .append('svg')
                  .attr('width', width - margin.left - margin.right)
                  .attr('height', height - margin.top - margin.bottom)
                  .attr('veiwbox', [0,0,width,height]);

    // Create scales
    const x = d3.scaleBand()
                     .domain(d3.range(data.length))
                     .range([margin.left, width-margin.right])
                     .padding(0.1);

    const y = d3.scaleLinear()
                     .domain([0, d3.max(data, d => d.value)])
                     .range([height - margin.bottom, margin.top]);

    svg
        .append('g')
        .attr('fill','pink')
        .selectAll('rect')
        .data.sort((a,b)=> d3.descending(a.year,b.year))
        .join('rect')
            .attr('x', (d,i)=>x(i))
            .attr('y' , (d) => y(d.year))
            .attr('height', d => y(0)-y(d.year))
            .attr('width', x.bandwidth())

    svg.node()

  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
