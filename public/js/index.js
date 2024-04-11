

// fucntion to make total line chart
function makeRegLineChart() {

    // get user params
    var yearmin = document.getElementById("min-year");
    var yearmax = document.getElementById("max-year");

    d3.json("https://raw.githubusercontent.com/prust/wikipedia-movie-data/master/movies.json", function(data) {

        var margin = {top: 10, right: 30, bottom: 30, left: 30},
            width = 530 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // clear any previous charts
        d3.select("#movie-reg-line").selectAll("svg").remove();

        const svg = d3.select("#movie-reg-line").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        // sum the count of movies by year
        var points = d3.nest().key(function(d){
            return d.year; })
        .rollup(function(leaves){
            return d3.sum(leaves, function(d){
                return 1;
            });
        }).entries(data).map(function(d){
            return { year: d.key, value: d.value};
        });

        // filter to only include years within the specified range
        points = points.filter((d) => {
            return parseInt(d.year) >= parseInt(yearmin.value) && parseInt(d.year) <= parseInt(yearmax.value);
        });

        // create axes
        var x = d3.scaleLinear()
            .domain([d3.min(points, (d) => { return +d.year; }), d3.max(points, (d) => { return +d.year; })])
            .range([0, width]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        var y = d3.scaleLinear()
            .domain([0, d3.max(points, (d) => { return +d.value; })])
            .range([ height, 0 ]);
        
        svg.append("g")
            .call(d3.axisLeft(y));

        // add line plot
        svg.append("path")
            .datum(points)
            .attr("fill", "none")
            .attr("stroke", "#007559")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
            .x((d) => { return x(d.year) })
            .y((d) => { return y(d.value) }));

    });
}



// function to make the genre line chart
function makeGenreLineChart() {

    // get user params
    var yearmin = document.getElementById("min-year");
    var yearmax = document.getElementById("max-year");

    d3.json("https://raw.githubusercontent.com/prust/wikipedia-movie-data/master/movies.json", function(data) {

        let genres = []

        // filter data by year and for each genre listed for 1 movie, add that combo to the genre list (one movie will be listed as many times as its total number of genres)
        data.forEach((d) => {
            if(parseInt(d.year) >= parseInt(yearmin.value) && parseInt(d.year) <= parseInt(yearmax.value)) {
                d.genres.forEach((g) => {
                    genres.push({year: d.year, genre: g})
                });
            }
        });

        // group by genre
        let grouped = d3.nest(genres)
            .key((d) => {
                return d.genre;
            })
            .entries(genres);

        // sort by total number of movies listed (length of collection) and only take top 5 genres
        grouped.sort((a, b) => b.values.length - a.values.length);

        grouped = grouped.slice(0, 5);

        // for each genre, group by year and sum the count of movies in those years
        let points = [];

        grouped.forEach((g) => {
            points.push(
                { genre: g.key, values:
                    d3.nest().key(function(d){
                        return d.year; })
                    .rollup(function(leaves){
                        return d3.sum(leaves, function(d){
                            return 1;
                        });
                    }).entries(g.values).map(function(d){
                        return { year: d.key, value: d.value };
                    })
                }
            );
        });

        var margin = {top: 10, right: 100, bottom: 30, left: 30},
            width = 600 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // clear any previous chart
        d3.select("#movie-genre-line").selectAll("svg").remove();

        const svg = d3.select("#movie-genre-line").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        // make axes
        var x = d3.scaleLinear()
            .domain([yearmin.value, yearmax.value])
            .range([0, width]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        var y = d3.scaleLinear()
            .domain([0, d3.max(points, (d) => { return d3.max(d.values, (y) => {return +y.value;}) })])
            .range([ height, 0 ]);
        
        svg.append("g")
            .call(d3.axisLeft(y));

        // color scale for genres
        var color = d3.scaleOrdinal()
            .domain(points.map((d) => { return d.genre; }))
            .range(d3.schemeSet1);

        // add line plot
        svg.selectAll(".line")
            .data(points)
            .enter()
            .append("path")
                .attr("fill", "none")
                .attr("stroke", function(d){ return color(d.genre) })
                .attr("stroke-width", 1.5)
                .attr("opacity", "0.8")
                .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return x(d.year); })
                    .y(function(d) { return y(+d.value); })
                    (d.values)
                });

        // add legend
        svg.selectAll('.legend-circle')
            .data(points)
            .enter()
                .append('circle')
                .attr("class", 'legend-circle')
                .attr('r', 7)
                .attr('cx', width + 10 )
                .attr('cy', function (d, i) {
                    return 10 + (30 * i);
                })
                .style('fill', function (d) {
                    return color(d.genre);
                });

        svg.selectAll('.legend-text')
            .data(points)
            .enter()
                .append("text")
                .attr('class', 'legend-text')
                .attr("x", width + 20 )
                .attr("y", function (d, i) {
                    return 15 + (30 * i);
                })
                .text(function (d) {
                    return d.genre;
                })
                .attr("font-size", "15px");

    });
}



// function to reset the line charts to 1900-2023 and remake them
function resetLineCharts() {

    var yearmin = document.getElementById("min-year");
    var yearmax = document.getElementById("max-year");

    yearmin.value = '1900';
    yearmax.value = '2023';

    makeRegLineChart();
    makeGenreLineChart();

}



// function to update the line charts when a user requests to
function updateLineCharts() {

    makeRegLineChart();
    makeGenreLineChart();

}



// function to fill the genre select box
function fillGenreSelect() {

    let genreSelect = document.getElementById("genre");

    d3.json("https://raw.githubusercontent.com/prust/wikipedia-movie-data/master/movies.json", function(data) {

        // get all genres listed in dataset and create a new unique set
        let total = []; 

        data.forEach((d) => {
            d.genres.forEach((g) => {
                total.push(g)
            })
        }); 

        genres = new Set(total)

        // for genre in the set add a select option
        genres.forEach((g) => {
            let opt = document.createElement('option');
            opt.value = g;
            opt.innerHTML = g;
            genreSelect.appendChild(opt);
        });
    });

}



// function to make genre bar chart
function makeGenreBar() {

    // get user param
    let selected_genre = document.getElementById("genre").value;

    d3.json("https://raw.githubusercontent.com/prust/wikipedia-movie-data/master/movies.json", function(data) {

        // for each movie if their genre list includes the user param, add all those actors to the actor list
        let actors = [];

        data.forEach((d) => {
            if(d.genres.includes(selected_genre)) {
                d.cast.forEach((c) => {
                    actors.push({actor: c, value: 1});
                });
            }
        });

        // group actor list by actor and sum their counts
        var points = d3.nest().key(function(d){
            return d.actor; })
        .rollup(function(leaves){
            return d3.sum(leaves, function(d){
                return 1;
            });
        }).entries(actors).map(function(d){
            return { actor: d.key, value: d.value};
        });

        // sort the actor counts and take the top 10
        points.sort((a, b) => b.value - a.value);

        points = points.slice(0, 10);

        var margin = {top: 20, right: 30, bottom: 40, left: 150},
            width = 700 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // remove previous chart
        d3.select("#actor-bar").selectAll("svg").remove();

        var svg = d3.select("#actor-bar")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        // add axes
        var x = d3.scaleLinear()
            .domain([0, d3.max(points, (d) => { return +d.value; })])
            .range([ 0, width]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

        var y = d3.scaleBand()
            .range([ 0, height ])
            .domain(points.map(function(d) { return d.actor; }))
            .padding(.1);

        svg.append("g")
            .call(d3.axisLeft(y))
                .selectAll("text")
                .attr("font-size", "12px");

        // add bars
        svg.selectAll("myRect")
            .data(points)
            .enter()
                .append("rect")
                .attr("x", x(0) )
                .attr("y", function(d) { return y(d.actor); })
                .attr("width", function(d) { return x(d.value); })
                .attr("height", y.bandwidth())
                .attr("fill", "#007559");

    });

}



// function to fill the actor select box
function fillActorSelect() {

    let actorSelect = document.getElementById("actor");

    d3.json("https://raw.githubusercontent.com/prust/wikipedia-movie-data/master/movies.json", function(data) {


        // for each movie add actors to the actor list (filter out errors with regex)
        let total = []; 

        data.forEach((d) => {
            d.cast.forEach((c) => {
                if(/^[a-zA-Z0-9]+$/.test(c.charAt(0))) {
                    total.push({actor: c, value: 1});
                }
            })
        }); 

        // group by name and get counts for each actor
        var summed = d3.nest().key(function(d){
            return d.actor; })
        .rollup(function(leaves){
            return d3.sum(leaves, function(d){
                return 1;
            });
        }).entries(total).map(function(d){
            return { actor: d.key, value: d.value};
        });

        // sort and take top 400 actors
        summed.sort((a, b) => b.value - a.value );

        summed = summed.slice(0, 400);

        summed.sort(function(a, b) {

            if (a.actor < b.actor) {
                return -1;
              }
              if (a.actor > b.actor) {
                return 1;
              }
              return 0;

        });

        // for each in top 400 add option to select box
        summed.forEach((a) => {
            let opt = document.createElement('option');
            opt.value = a.actor;
            opt.innerHTML = a.actor;
            actorSelect.appendChild(opt);
        });
    });

}



// function to make actor bubble chart
function makeActorBubble() {

    // get user param
    let selected_actor = document.getElementById("actor").value;

    // remove previous chart
    d3.select('#actor-bubble').selectAll("svg").remove();

    d3.json("https://raw.githubusercontent.com/prust/wikipedia-movie-data/master/movies.json", function(data) {

        var margin = {top: 20, right: 100, bottom: 20, left: 20},
            width = 620 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        // for each movie if the cast inlcudes the selected actor, add the list of genres to the total list
        let genres = [];

        data.forEach((d) => {
            if(d.cast.includes(selected_actor)) {
                d.genres.forEach((g) => {
                    genres.push({genre: g, value: 1});
                });
            }
        });

        // group by genre and get the count for each genre
        var grouped = d3.nest().key(function(d){
            return d.genre; })
        .rollup(function(leaves){
            return d3.sum(leaves, function(d){
                return 1;
            });
        }).entries(genres).map(function(d){
            return { genre: d.key, value: d.value};
        });

        // sort genre counts and take top 10 genres
        grouped.sort((a, b) => b.value - a.value)
        grouped = grouped.slice(0, 10);

        // color scheme for top 10 genres
        var color = d3.scaleOrdinal()
            .domain(grouped.map((d) => { return d.genre; }))
            .range(d3.schemeCategory10);

        // put values into 1 level hierarchy so that d3 pack can parse it
        const hierarchy = d3.hierarchy({children: grouped}).sum(d => d.value);

        const pack = d3.pack()
            .size([width, height])
            .padding(3);

        const root = pack(hierarchy);
        
        var svg = d3.select("#actor-bubble")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        // add bubbles
        svg.selectAll('circle')
            .data(root.descendants().slice(1))
            .enter()
            .append('circle')
                .attr('r', d => d.r)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('stroke', 'none')
                .attr('fill', (d) => {
                    return color(d.data.genre);
                });

        // add counts to bubbles
        svg.selectAll('.circle-text')
            .data(root.descendants().slice(1))
            .enter()
            .append('text')
                .attr('x', d => d.x)
                .attr('y', d => d.y)
                .text((d) => { return d.data.value; })
                .attr('stroke', 'none')
                .attr('font-size', '18px')
                .attr('fill', 'white');

        // add legend
        svg.selectAll('.legend-circle')
            .data(grouped)
            .enter()
                .append('circle')
                .attr("class", 'legend-circle')
                .attr('r', 7)
                .attr('cx', width + 20 )
                .attr('cy', function (d, i) {
                    return 40 + (30 * i);
                })
                .style('fill', function (d) {
                    return color(d.genre);
                });
    
        svg.selectAll('.legend-text')
            .data(grouped)
            .enter()
                .append("text")
                .attr('class', 'legend-text')
                .attr("x", width + 30 )
                .attr("y", function (d, i) {
                    return 45 + (30 * i);
                })
                .text(function (d) {
                    return d.genre;
                })
                .attr("font-size", "15px")
                .attr("fill", "black");
    }); 

}



// function to toggle the info popup
function toggleInfo() {
    var popup = document.getElementById("info-container");
    popup.classList.toggle("show");
    var popupback = document.getElementById("info-wrapper");
    popupback.classList.toggle("show");
}



// initialize charts and selects on load
window.onload = () => {
    makeRegLineChart();
    makeGenreLineChart();
    fillGenreSelect();
    fillActorSelect();
}