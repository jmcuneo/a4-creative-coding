class GameState {
    constructor(levelData) {
        this.coords = { x: (levelData.start.x / 100) || 0.5, y: (levelData.start.y / 100) || 0.5 };
        this.force = {x: 0, y: 0};
        this.parameters = {
            radius: levelData.parameters.radius || 0.025, 
            friction: levelData.parameters.friction || 0.05,
            gravity: levelData.parameters.gravity || 0.0025,
            terminalVelocity: levelData.parameters.terminalVelocity || 0.05,
            elasticity: levelData.parameters.elasticity || 0.01
        };
        this.geometry = levelData.geometry.map(g => new Rectangle(g.x, g.y, g.width, g.height));
    }

    fixCollisions() {
        for(let rect of this.geometry) {
            if(rect.intersects(this.coords.x + this.force.x, this.coords.y + this.force.y, this.parameters.radius)) {
                rect.preventCollision(this.coords.x, this.coords.y, this.parameters.radius, this.force);
            }
        }
    }
}

class Rectangle {
    constructor(x, y, width, height) {
        this.x = x / 100.0;
        this.y = y / 100.0;
        this.width = width / 100.0;
        this.height = height / 100.0;
    }

    intersects(x, y, radius) {
        return (x + radius >= this.x && x - radius <= this.x + this.width)
        && (y + radius * 5/3 >= this.y && y - radius * 5/3 <= this.y + this.height);
    }

    preventCollision(x, y, radius, force) {
        if(y + radius * 5/3 <= this.y && y + radius * 5/3 + force.y > this.y) {
            // Top collision
            force.y = this.y - (y + radius * 5/3);
        }
        if(y - radius * 5/3 >= this.y + this.height && y - radius * 5/3 + force.y < this.y + this.height) {
            // Bottom collision
            force.y = (this.y + this.height) - (y - radius * 5/3);
        }
        if(x + radius <= this.x && x + radius + force.x > this.x) {
            // Left collision
            force.x = this.x - (x + radius);
        } 
        if(x - radius >= this.x + this.width && x - radius + force.x < this.x + this.width) {
            // Right collision
            force.x = (this.x + this.width) - (x - radius);
        }
    }
}

const epsilon = 0.00001; //minimum recognized change in values
function bounded(x, y) {
    return Math.abs(y - x) < epsilon;
}

const levelPath = "level1"; //TODO: Update from selection
document.addEventListener('DOMContentLoaded', async () => {
    const drawWrapper = document.querySelector("#animation-wrapper");
    const drawBox = document.querySelector("#animation");
    drawBox.width = drawWrapper.clientWidth;
    drawBox.height = drawWrapper.clientHeight;

    const ctx = drawBox.getContext("2d");
    const level = await fetch(`../res/${levelPath}.json`).then(r => r.json()).catch(err => { console.error("Unable to load level data."); console.error(err); });
    const game = new GameState(level);
    const mouseCoords = { x: undefined, y: undefined };
    
    window.onresize = () => resize(game, mouseCoords, ctx);

    drawBox.onmousedown = (mouseEvent) => {
        const scaledX = mouseEvent.offsetX / drawBox.width;
        const scaledY = mouseEvent.offsetY / drawBox.height;

        if(Math.sqrt(Math.pow(scaledX - game.coords.x, 2) + Math.pow(scaledY - game.coords.y, 2)) <= game.parameters.radius) {
            mouseCoords.x = scaledX;
            mouseCoords.y = scaledY;
            console.log(mouseCoords.x);
        }
    };
    drawBox.onmousemove = (mouseEvent) => { 
        if(mouseCoords.x && mouseCoords.y) {
            mouseCoords.x = mouseEvent.offsetX / drawBox.width;
            mouseCoords.y = mouseEvent.offsetY / drawBox.height;
        }
    };
    drawBox.onmouseup = () => { mouseCoords.x = undefined; mouseCoords.y = undefined; };

    window.requestAnimationFrame(() => update(game, mouseCoords, ctx));
    createSettings(game.parameters);
});

function createSettings() {
    const radiusSelector = document.querySelector("#radius");
    radiusSelector.onchange = () => {
        parameters.radius = parseInt(radiusSelector.value);
    };
    const frictionSelector = document.querySelector("#friction");
    frictionSelector.onchange = () => {
        parameters.friction = parseFloat(frictionSelector.value);
    };
    const gravitySelector = document.querySelector("#gravity");
    gravitySelector.onchange = () => {
        parameters.gravity = parseFloat(gravitySelector.value);
    };
    const terminalVelocitySelector = document.querySelector("#terminalVelocity");
    terminalVelocitySelector.onchange = () => {
        parameters.terminalVelocity = parseFloat(terminalVelocitySelector.value);
    };
    const elasticitySelector = document.querySelector("#elasticity");
    elasticitySelector.onchange = () => {
        parameters.elasticity = parseFloat(elasticitySelector.value);
    };
}

function resize(game, mouseCoords, ctx) {
    const drawWrapper = document.querySelector("#animation-wrapper");
    const drawBox = document.querySelector("#animation");
    drawBox.width = drawWrapper.clientWidth;
    drawBox.height = drawWrapper.clientHeight;
    //TODO: Scale all attributes to screen size
    update(game, mouseCoords, ctx);
}

function update(game, mouseCoords, ctx) {
    const drawBox = document.querySelector("#animation");
    const lastStep = game.coords;
    let parameters = game.parameters;

    if(mouseCoords.x && mouseCoords.y) {
        game.force.x = mouseCoords.x - game.coords.x;
        game.force.y = mouseCoords.y - game.coords.y;
    }
    else {
        // TODO: Update friction and elasticity to use geometry
        // if() {
        //     if(game.force.x > 0) {
        //         game.force.x = Math.max(0, game.force.x - parameters.friction);
        //     } else if(game.force.x < 0) {
        //         game.force.x = Math.min(0, game.force.x + parameters.friction);
        //     }
        // }
        if(lastStep.y === game.coords.y && (bounded(parameters.radius, game.coords.y) || bounded(drawBox.height - parameters.radius, game.coords.y))) {
            game.force.y = -game.force.y * parameters.elasticity;
        }
        if(lastStep.x === game.coords.x && (bounded(drawBox.width - parameters.radius, game.coords.x) || bounded(parameters.radius, game.coords.x))) {
            game.force.x = -game.force.x * parameters.elasticity;
        }
    }

    if((!mouseCoords.x || !mouseCoords.y) && parameters.gravity !== 0) {
        if(parameters.gravity > 0) {
            const delta = Math.min(parameters.gravity, (1 - parameters.radius) - game.coords.y) / parameters.gravity;
            game.force.y =  game.force.y + delta * parameters.gravity;
        } else {
            const delta = Math.max(parameters.gravity, parameters.radius - game.coords.y) / parameters.gravity;
            game.force.y =  game.force.y + delta * parameters.gravity;
        }
        if(bounded(0, game.force.y)) {
            game.force.y = 0;
        }
    }

    game.fixCollisions();

    game.force.x = Math.max(-parameters.terminalVelocity, Math.min(parameters.terminalVelocity, game.force.x));
    game.force.y = Math.max(-parameters.terminalVelocity, Math.min(parameters.terminalVelocity, game.force.y));

    game.coords.x = Math.max(Math.min(1 - parameters.radius, game.coords.x + game.force.x), parameters.radius);
    game.coords.y = Math.max(Math.min(1 - parameters.radius, game.coords.y + game.force.y), parameters.radius);

    drawGame(game, ctx);

    window.requestAnimationFrame(() => update(game, mouseCoords, ctx));
}

function drawGame(game, ctx) {
    const drawBox = document.querySelector("#animation");
    ctx.fillStyle = "#acacac";
    ctx.fillRect(0, 0, drawBox.width, drawBox.height);

    for(rect of game.geometry) {
        ctx.fillStyle = "#777777";
        ctx.fillRect(rect.x * drawBox.width, rect.y * drawBox.height, rect.width * drawBox.width, rect.height * drawBox.height);
    }

    ctx.beginPath();
    ctx.fillStyle = "#E69927";
    ctx.arc(game.coords.x * drawBox.width, game.coords.y * drawBox.height, game.parameters.radius * drawBox.width, 0, 2  * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.stroke();
    ctx.closePath();
}