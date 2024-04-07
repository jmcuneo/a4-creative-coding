import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';
const c = document.getElementById("canv");
const ctx = c.getContext("2d");
const pane = new Pane();
const params = {
    "Vertical Interval":7,
    "Horizontal Interval":4,
    "Total Range":24,
    "Loop Sides":true,
    // "Wave Type":"Sine",
    "Update Speed":4,
    "Volume":0.1,
    "Oscillator Type":"sine"
};
pane.addBinding(params,"Vertical Interval",{min:0,max:12,step:1});
pane.addBinding(params,"Horizontal Interval",{min:0,max:12,step:1});
pane.addBinding(params,"Total Range",{min:12,max:72,step:1});
pane.addBinding(params,"Loop Sides");
pane.addBinding(params,"Update Speed",{min:1,max:100,step:1});
pane.addBinding(params,"Volume",{min:0,max:1,step:0.01});
pane.addBinding(params,"Oscillator Type",{options:{Sine:"sine",Saw:"saw",Square:"square"}})
// pane.addBinding(params,"Wave Type",{options:{Sine:"Sine",Saw:"Saw",Square:"Square",Sample:"Sample"}});

const gridSize = 25;
const gridSquareSize = 20;
const backgroundColor = "#091129";
const gridColor = "#ffffff";
const filledColor = "#f4ff54" //#f4ff54
const barColor = "#ff0000";
const gridThickness=2;
const barWidth = 5;
var frame = 0;
var gridState = [];
const gridSizeHorizontal = Math.ceil(c.width/gridSize);
const gridSizeVertical = Math.ceil(c.height/gridSize);
var paused=true;

//Draw the background
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

//Set grid state to all 0's
function initializeGridState(){
    for(let i = 0; i < gridSizeVertical; i++){
        gridState.push([]);
        for(let j = 0; j < gridSizeHorizontal; j++){
            gridState[i].push(0);
        }
    }
}

//Draw the grid according to its current state
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

//Get the value of a neighbor to a given location given its x,y and an x and y value to add. incX and incY should be integers between -1 and 1
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

//Conway's game of life rules for each tile given its neighbors
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
    //Since neighbor value is either 0 or 1, we can add all 8 neighbors.
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
    //See comment at beginning of function
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

//Update the grid state variable
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

var mouseX=0;
var mouseY=0;

//When mouse is moved, update the mouse location relative to the canvas.
window.onmousemove=function(e){
    var rect = c.getBoundingClientRect();
    mouseX=e.clientX-rect.left;
    mouseY=e.clientY-rect.top;
}


//Swap the state of the tile clicked
window.onmousedown=function(e){
    let x = Math.floor(mouseX/gridSize);
    let y = Math.floor(mouseY/gridSize);
    gridState[y][x]=1-gridState[y][x];
    // playSingleNote(gridFrequency(0,0));
    // playMultipleNotes([gridFrequency(0,0),gridFrequency(0,1),gridFrequency(0,2)]);
}

//Swap the paused boolean if the user presses space
window.onkeydown=function(e){
    if(e.key===" "){
        paused=!paused;
    }
}

//Input is number of semitones above A4, output is the frequency
function noteFrequency(n){
    return Math.pow(2,n/12)*440;
}

//Given an x-y grid value, return the frequency it should play
function gridFrequency(x,y){
    var value = (params["Horizontal Interval"]*x+params["Vertical Interval"]*y)%params["Total Range"];
    return noteFrequency(value);
}

//Given a list of frequencies, play all notes for the right amount of time.
function playMultipleNotes(frequencies){
    if(frequencies.length===0){
        return;
    }
    let audioCtx = new AudioContext();
    let gainNode = audioCtx.createGain();
    gainNode.gain.value = params["Volume"]/frequencies.length;
    gainNode.connect(audioCtx.destination);
    for(let i = 0; i < frequencies.length; i++){
        let osc = audioCtx.createOscillator();
        osc.type=params["Oscillator Type"];
        osc.frequency.value=frequencies[i];
        osc.connect(gainNode);
        osc.start(0);
        //Play until the sequencer would move to the next note.
        osc.stop((10*params["Update Speed"]-1)/1000);
    }
    // osc.connect(audioCtx.destination);
    
    
}

var barX = 0;
//Main loop
setInterval(function(){
    drawBackground();
    drawGridState();
    if(!paused){
        frame++;
        ctx.fillStyle=barColor;
        let barDisplayX = barX * gridSize;
        ctx.fillRect(barDisplayX-barWidth/2,0,barWidth,c.height);
        //This if statement is how we implement update speed
        if(frame%params["Update Speed"]===0){
            //Find frequencies for each activated tile in this column
            let frequencies = [];
            for(let i = 0; i < gridSizeVertical; i++){
                if(gridState[i][barX] === 1){
                    frequencies.push(gridFrequency(barX,i));
                }
            }
            //Play the frequencies
            playMultipleNotes(frequencies);
            //When we get to the end, run the Game of Life rules then start over.
            if(barX >= gridSizeHorizontal){
                barX=0;
                incGridState();
            }
            barX++;
        }
    }
},10);