import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';
const c = document.getElementById("canv");
const ctx = c.getContext("2d");
const pane = new Pane();
const params = {
    "Vertical Interval":7,
    "Horizontal Interval":4,
    "Loop Sides":true,
    "Wave Type":"Sine"
};
pane.addBinding(params,"Vertical Interval",{min:0,max:12,step:1});
pane.addBinding(params,"Horizontal Interval",{min:0,max:12,step:1});
pane.addBinding(params,"Loop Sides");
pane.addBinding(params,"Wave Type",{options:{Sine:"Sine",Saw:"Saw",Square:"Square",Sample:"Sample"}});

const gridSize = 25;
const gridSquareSize = 20;
const backgroundColor = "#091129";
const gridColor = "#ffffff";
const filledColor = "#f4ff54" //#f4ff54
const gridThickness=2;
var gridState = [];
const gridSizeHorizontal = Math.ceil(c.width/gridSize);
const gridSizeVertical = Math.ceil(c.height/gridSize);

function drawBackground(){
    ctx.fillStyle=backgroundColor;
    ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle=gridColor;
    for(let x = 0; x < c.width; x+=gridSize){
        ctx.fillRect(x-gridThickness/2,0,gridThickness,c.height);
    }
    for(let y = 0; y < c.height; y+=gridSize){
        ctx.fillRect(0,y-gridThickness/2,c.width,gridThickness);
    }
}

function initializeGridState(){
    for(let i = 0; i < gridSizeVertical; i++){
        gridState.push([]);
        for(let j = 0; j < gridSizeHorizontal; j++){
            gridState[i].push(0);
        }
    }
}

function drawGridState(){
    ctx.fillStyle=filledColor;
    for(let i = 0; i < gridSizeVertical; i++){
        for(let j = 0; j < gridSizeHorizontal; j++){
            if(gridState[i][j]===1){
                let x = j*gridSize;
                let y = i*gridSize;
                ctx.beginPath();
                ctx.roundRect(x+gridSize/2-gridSquareSize/2,y+gridSize/2-gridSquareSize/2,gridSquareSize,gridSquareSize,[gridSquareSize/4]);
                ctx.fill();
            }
        }
    }
}

function getNeighborValue(x,y,incX,incY){
    let newX = x+incX;
    let newY = y+incY;
    if(params["Loop Sides"]){
        if(newX < 0){
            newX=gridSizeHorizontal-1;
        }else if(newX>=gridSizeHorizontal){
            newX=0;
        }
        if(newY < 0){
            newY=gridSizeVertical-1;
        }else if(newY>=gridSizeVertical){
            newY=0;
        }
    }else if(newX < 0 || newX >= gridSizeHorizontal || newY < 0 || newY >= gridSizeVertical){
        return 0;
    }
    if(gridState[y][x] === 1){
        console.log(`(${newX}, ${newY}) is ${gridState[newY][newX]}`);
    }
    return gridState[newY][newX];
}

function shouldBeActive(x,y){
    /*
    Simplified rules:
    0 neighbors: 0
    1 neighbor: 0
    2 neighbors: same as current state
    3 neighbors: alive
    anything above: 0
    */
    let numNeighbors = 0;
    numNeighbors+=getNeighborValue(x,y,-1,-1);
    numNeighbors+=getNeighborValue(x,y,0,-1);
    numNeighbors+=getNeighborValue(x,y,1,-1);
    numNeighbors+=getNeighborValue(x,y,-1,0);
    numNeighbors+=getNeighborValue(x,y,1,0);
    numNeighbors+=getNeighborValue(x,y,-1,1);
    numNeighbors+=getNeighborValue(x,y,0,1);
    numNeighbors+=getNeighborValue(x,y,1,1);
    if(gridState[y][x] === 1){
        console.log(`(${x}, ${y}) has ${numNeighbors} neighbors.`);
    }
    switch(numNeighbors){
        case 0:
        case 1:
            return 0;
        case 2:
            return gridState[y][x];
        case 3:
            return 1;
        default:
            return 0;
    }
}

function incGridState(){
    let nextGridState = [];
    for(let y = 0; y < gridSizeVertical; y++){
        nextGridState.push([]);
        for(let x = 0; x < gridSizeHorizontal; x++){
            nextGridState[y].push(shouldBeActive(x,y));
        }
    }
    gridState=nextGridState;
}

initializeGridState();
// gridState[3][8]=1;
// gridState[3][9]=1;
// gridState[3][10]=1;
// gridState[4][10]=1;
// gridState[5][9]=1;

setInterval(function(){
    drawBackground();
    drawGridState();
    incGridState();
},10);