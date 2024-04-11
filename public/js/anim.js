const aspectRatio = 5/3;
const sensitivity = 1/5;

class GameState {
    constructor(levelData) {
        this.coords = { x: (levelData.start.x / 100) || 0.5, y: (levelData.start.y / 100) || 0.5 };
        this.force = {x: 0, y: 0};
        this.parameters = {
            radius: levelData.parameters.radius || 0.025, 
            friction: levelData.parameters.friction || 0.05,
            gravity: levelData.parameters.gravity || 0.001,
            terminalVelocity: levelData.parameters.terminalVelocity || 0.05,
            elasticity: levelData.parameters.elasticity || 0.01
        };
        this.geometry = levelData.geometry.map(g => new Rectangle(g.x, g.y, g.width, g.height, g.elasticity, g.friction));
    }

    fixCollisions() {
        for(let rect of this.geometry) {
            const shiftedX = Math.max(this.parameters.radius, Math.min(1 - this.parameters.radius, this.coords.x + this.force.x));
            const shiftedY = Math.max(this.parameters.radius * aspectRatio, Math.min(1 - this.parameters.radius * aspectRatio, this.coords.y + this.force.y));
            if(rect.intersects(shiftedX, shiftedY, this.parameters.radius)) {
                rect.preventCollision(this.coords.x, this.coords.y, this.parameters.radius, this.force);
                if(rect.collideX !== null) {
                    this.force.x = rect.collideX;
                    if(this.force.y !== 0) {
                        this.force.y = boundRound(this.force.y * rect.friction, 0);
                    }
                    rect.collideX = null;
                }
                if(rect.collideY !== null) {
                    this.force.y = rect.collideY;
                    if(this.force.x !== 0) {
                        this.force.x = boundRound(this.force.x * rect.friction, 0);
                    }
                    rect.collideY = null;
                }
            } else {
                rect.collideX = null;
                rect.collideY = null;
            }
        }
    }
}

class Rectangle {
    constructor(x, y, width, height, elasticity, friction) {
        this.x = x / 100.0;
        this.y = y / 100.0;
        this.width = width / 100.0;
        this.height = height / 100.0;
        this.elasticity = elasticity;
        this.friction = friction;
        this.collideX = null;
        this.collideY = null;
    }

    intersects(x, y, radius) {
        return (x + radius >= this.x && x - radius <= this.x + this.width)
        && (y + radius * aspectRatio >= this.y && y - radius * aspectRatio <= this.y + this.height);
    }

    preventCollision(x, y, radius, force) {
        if(y + radius * aspectRatio <= this.y && y + radius * aspectRatio + force.y > this.y) {
            // Top collision
            this.collideY = boundRound(-this.elasticity * force.y, 0);
            force.y = boundRound(this.y - (y + radius * aspectRatio), 0);
        }
        if(y - radius * aspectRatio >= this.y + this.height && y - radius * aspectRatio + force.y < this.y + this.height) {
            // Bottom collision
            this.collideY = boundRound(-this.elasticity * force.y, 0);
            force.y = boundRound((this.y + this.height) - (y - radius * aspectRatio), 0);
        }
        if(x + radius <= this.x && x + radius + force.x > this.x) {
            // Left collision
            this.collideX = boundRound(-this.elasticity * force.x, 0);
            force.x = boundRound(this.x - (x + radius), 0);
        } 
        if(x - radius >= this.x + this.width && x - radius + force.x < this.x + this.width) {
            // Right collision
            this.collideX = boundRound(-this.elasticity * force.x, 0);
            force.x = boundRound((this.x + this.width) - (x - radius), 0);
        }
    }
}

const epsilon = 0.0015; //minimum recognized change in values
function bounded(x, y) {
    return Math.abs(y - x) < epsilon;
}

// Rounds x to y if x and y are bounded
function boundRound(x, y) {
    if(bounded(x, y)) {
        return y;
    }

    return x;
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
    const mouseCoords = { magX: null, magY: null, active: false };
    
    window.onresize = () => resize(game, mouseCoords, ctx);

    drawBox.onmousedown = (mouseEvent) => {
        const scaledX = mouseEvent.offsetX / drawBox.width;
        const scaledY = mouseEvent.offsetY / drawBox.height;
        const magnitude = Math.sqrt(Math.pow(scaledX - game.coords.x, 2) + Math.pow(scaledY - game.coords.y, 2));

        if(magnitude <= game.parameters.radius) {
            mouseCoords.magX = scaledX - game.coords.x;
            mouseCoords.magY = scaledY - game.coords.y;
            mouseCoords.active = true;
        }
    };
    window.onmousemove = (mouseEvent) => {
        if(mouseCoords.active) {
            mouseCoords.magX = (mouseEvent.clientX - drawBox.getBoundingClientRect().left) / drawBox.width - game.coords.x;
            mouseCoords.magY = (mouseEvent.clientY - drawBox.getBoundingClientRect().top) / drawBox.height - game.coords.y;
        }
    };
    window.onmouseup = () => mouseCoords.active = false;

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
    let parameters = game.parameters;

    if(mouseCoords.magX && mouseCoords.magY && !mouseCoords.active) {
        game.force.x = -mouseCoords.magX * sensitivity;
        game.force.y = -mouseCoords.magY * sensitivity;
        mouseCoords.magX = null;
        mouseCoords.magY = null;
    }

    // Add gravity force
    //TODO: Move to collisionless geometry, add win geometry, add reset button, fix jank with resizing and gravity, minimum drag amount
    if((!mouseCoords.x || !mouseCoords.y) && parameters.gravity !== 0) {
        if(parameters.gravity > 0) {
            const delta = Math.min(parameters.gravity, (1 - parameters.radius) - game.coords.y) / parameters.gravity;
            game.force.y =  game.force.y + delta * parameters.gravity;
        } else {
            const delta = Math.max(parameters.gravity, parameters.radius - game.coords.y) / parameters.gravity;
            game.force.y =  game.force.y + delta * parameters.gravity;
        }
    }

    game.fixCollisions();

    game.force.x = Math.max(-parameters.terminalVelocity, Math.min(parameters.terminalVelocity, game.force.x));
    game.force.y = Math.max(-parameters.terminalVelocity, Math.min(parameters.terminalVelocity, game.force.y));

    game.coords.x = Math.max(Math.min(1 - parameters.radius, game.coords.x + game.force.x), parameters.radius);
    game.coords.y = Math.max(Math.min(1 - parameters.radius * aspectRatio, game.coords.y + game.force.y), parameters.radius * aspectRatio);

    drawGame(game, mouseCoords, ctx);

    window.requestAnimationFrame(() => update(game, mouseCoords, ctx));
}

function drawGame(game, mouseCoords, ctx) {
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

    if(mouseCoords.active) {
        const angle = Math.atan2(mouseCoords.magY, mouseCoords.magX);
        const magnitude = -Math.sqrt(Math.pow(mouseCoords.magX, 2) + Math.pow(mouseCoords.magY, 2));
        ctx.lineWidth = game.parameters.radius * drawBox.width / 2;

        const arrowHeadX = (game.coords.x + Math.cos(angle) * (magnitude - game.parameters.radius * 1.25)) * drawBox.width;
        const arrowHeadY = (game.coords.y + Math.sin(angle) * aspectRatio * (magnitude - game.parameters.radius * 1.25)) * drawBox.height;
        ctx.strokeStyle = "#FF333399";

        ctx.beginPath();
        ctx.moveTo((game.coords.x - Math.cos(angle) * game.parameters.radius * 1.25) * drawBox.width, 
                   (game.coords.y - Math.sin(angle) * game.parameters.radius * aspectRatio * 1.25) * drawBox.height);
        ctx.lineTo(arrowHeadX, arrowHeadY);
        ctx.stroke();
        ctx.closePath();

        ctx.lineWidth = 1.0;
    }
}