const aspectRatio = 5/3;
const sensitivity = 1/5;

class GameState {
    constructor(levelData, path) {
        this.levelName = path;
        this.coords = { x: (levelData.start.x / 100) || 0.5, y: (levelData.start.y / 100) || 0.5 };
        this.force = {x: 0, y: 0};
        this.parameters = {
            radius: levelData.parameters.radius || 0.025, 
            friction: levelData.parameters.friction || 0.05,
            gravity: levelData.parameters.gravity || 0.001,
            terminalVelocity: levelData.parameters.terminalVelocity || 0.05,
            elasticity: levelData.parameters.elasticity || 0.01
        };
        this.geometry = levelData.geometry.map(g => new Rectangle(g.x, g.y, g.width, g.height, g.elasticity, g.friction, g.type));
        this.delta = { x: null, y: null }
        this.won = false;
        this.ballColor = "#FCC026";
    }

    fixCollisions() {
        for(let rect of this.geometry) {
            const shiftedX = Math.max(this.parameters.radius, Math.min(1 - this.parameters.radius, this.coords.x + this.force.x));
            const shiftedY = Math.max(this.parameters.radius * aspectRatio, Math.min(1 - this.parameters.radius * aspectRatio, this.coords.y + this.force.y));
            const delta = { x: this.coords.x - this.delta.x, y: this.coords.y - this.delta.y };
            if(rect.intersects(shiftedX, shiftedY, this.parameters.radius)) {
                switch(rect.type) {
                    case "grav":
                        if(this.delta.y !== null && delta.y < 0 && bounded(this.force.y, Math.abs(this.parameters.gravity))) {
                            this.force.y = 0;
                            break;
                        }
                        this.force.y = this.force.y + Math.abs(this.parameters.gravity);
                        break;
                    case "antigrav":
                        if(this.delta.y !== null && delta.y > 0 && bounded(this.force.y, Math.abs(this.parameters.gravity))) {
                            this.force.y = 0;
                            break;
                        }
                        this.force.y = this.force.y - Math.abs(this.parameters.gravity);
                        break;
                    case "win":
                        break;
                    case "wall":
                    default:
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
                    break;
                }
            } else {
                rect.collideX = null;
                rect.collideY = null;
            }
        }
    }
}

class Rectangle {
    constructor(x, y, width, height, elasticity, friction, type) {
        this.x = x / 100.0;
        this.y = y / 100.0;
        this.width = width / 100.0;
        this.height = height / 100.0;
        this.elasticity = elasticity;
        this.friction = friction;
        this.type = type;

        this.collideX = null;
        this.collideY = null;
    }

    intersects(x, y, radius) {
        return (x + radius > this.x && x - radius < this.x + this.width)
        && (y + radius * aspectRatio > this.y && y - radius * aspectRatio < this.y + this.height);
    }

    preventCollision(x, y, radius, force) {
        if(y + radius * aspectRatio <= this.y && y + radius * aspectRatio + force.y > this.y) {
            // Top collision
            if(this.elasticity) {
                this.collideY = boundRound(-this.elasticity * force.y, 0, epsilon / this.elasticity);
            }
            force.y = boundRound(this.y - (y + radius * aspectRatio), 0);
        }
        if(y - radius * aspectRatio >= this.y + this.height && y - radius * aspectRatio + force.y < this.y + this.height) {
            // Bottom collision
            if(this.elasticity) {
                this.collideY = boundRound(-this.elasticity * force.y, 0, epsilon / this.elasticity);
            }
            force.y = boundRound((this.y + this.height) - (y - radius * aspectRatio), 0);
        }
        if(x + radius <= this.x && x + radius + force.x > this.x) {
            // Left collision
            if(this.elasticity) {
                this.collideX = boundRound(-this.elasticity * force.x, 0, epsilon / this.elasticity);
            }
            force.x = boundRound(this.x - (x + radius), 0);
        } 
        if(x - radius >= this.x + this.width && x - radius + force.x < this.x + this.width) {
            // Right collision
            if(this.elasticity) {
                this.collideX = boundRound(-this.elasticity * force.x, 0, epsilon / this.elasticity);
            }
            force.x = boundRound((this.x + this.width) - (x - radius), 0);
        }
    }
}

const epsilon = 0.0015; //minimum recognized change in values
function bounded(x, y, eps = epsilon) {
    return Math.abs(y - x) < eps;
}

// Rounds x to y if x and y are bounded
function boundRound(x, y, eps = epsilon) {
    if(bounded(x, y, eps)) {
        return y;
    }

    return x;
}

async function load(path) {
    const level = await fetch(`../res/${path}.json`).then(r => r.json()).catch(err => { console.error("Unable to load level data."); console.error(err); });
    game = new GameState(level, path);
    createSettings();
}

let game, mouseCoords, toLoad;
document.addEventListener('DOMContentLoaded', async () => {
    const drawWrapper = document.querySelector("#animation-wrapper");
    const drawBox = document.querySelector("#animation");
    drawBox.width = drawWrapper.clientWidth;
    drawBox.height = drawWrapper.clientHeight;

    const ctx = drawBox.getContext("2d");
    await load("level1");
    mouseCoords = { magX: null, magY: null, active: false };
    
    window.onresize = () => resize();

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

    window.requestAnimationFrame(() => update(ctx));

    document.querySelector("#level1").onclick = () => toLoad = "level1";
    document.querySelector("#level2").onclick = () => toLoad = "level2";
    document.querySelector("#level3").onclick = () => toLoad = "level3";
    document.querySelector("#reset").onclick = () => toLoad = game.levelName;
});

function resize() {
    const drawWrapper = document.querySelector("#animation-wrapper");
    const drawBox = document.querySelector("#animation");
    drawBox.width = drawWrapper.clientWidth;
    drawBox.height = drawWrapper.clientWidth / aspectRatio;
}

async function update(ctx) {
    let parameters = game.parameters;

    if(game.geometry.filter(r => r.type === "win").some(r => r.intersects(game.coords.x, game.coords.y, parameters.radius))) {
        if(!game.won) {
            alert("You won!");
            game.won = true;
        }
    }

    if(mouseCoords.magX && mouseCoords.magY && !mouseCoords.active && Math.sqrt(Math.pow(mouseCoords.magX, 2) + Math.pow(mouseCoords.magY, 2)) > 0.01) {
        game.force.x = -mouseCoords.magX * sensitivity;
        game.force.y = -mouseCoords.magY * sensitivity;
        mouseCoords.magX = null;
        mouseCoords.magY = null;
    }

    game.fixCollisions();

    game.force.x = Math.max(-parameters.terminalVelocity, Math.min(parameters.terminalVelocity, game.force.x));
    game.force.y = Math.max(-parameters.terminalVelocity, Math.min(parameters.terminalVelocity, game.force.y));

    game.delta = { x: game.coords.x, y: game.coords.y };
    game.coords.x = Math.max(Math.min(1 - parameters.radius, game.coords.x + game.force.x), parameters.radius);
    game.coords.y = Math.max(Math.min(1 - parameters.radius * aspectRatio, game.coords.y + game.force.y), parameters.radius * aspectRatio);

    drawGame(ctx);

    if(toLoad) {
        await load(toLoad);
        toLoad = null;
    }
    window.requestAnimationFrame(() => update(ctx));
}

function drawGame(ctx) {
    const drawBox = document.querySelector("#animation");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, drawBox.width, drawBox.height);

    for(rect of game.geometry) {
        switch(rect.type) {
            case "win":
                ctx.fillStyle = "#33FF3399";
                break;
            case "antigrav":
                ctx.fillStyle = "#FF7733";
                break;
            case "grav":
                ctx.fillStyle = "#A7A7A7";
                break;
            case "wall":
            default:
                ctx.fillStyle = "#555555";
                break;
        }
        ctx.fillRect(rect.x * drawBox.width, rect.y * drawBox.height, rect.width * drawBox.width, rect.height * drawBox.height);
    }

    ctx.beginPath();
    ctx.fillStyle = game.ballColor;
    ctx.arc(game.coords.x * drawBox.width, game.coords.y * drawBox.height, game.parameters.radius * drawBox.width, 0, 2  * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.stroke();
    ctx.closePath();

    if(mouseCoords.active && Math.sqrt(Math.pow(mouseCoords.magX, 2) + Math.pow(mouseCoords.magY, 2)) > 0.01) {
        const angle = Math.atan2(mouseCoords.magY, mouseCoords.magX);
        const magnitude = Math.max(-0.3, -Math.sqrt(Math.pow(mouseCoords.magX, 2) + Math.pow(mouseCoords.magY, 2)));
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

function createSettings() {
    const radiusSelector = document.querySelector("#radius");
    radiusSelector.value = game.parameters.radius * 1000;
    radiusSelector.onchange = () => {
        game.parameters.radius = parseInt(radiusSelector.value) / 1000.0;
    };
    const gravitySelector = document.querySelector("#gravity");
    gravitySelector.value = game.parameters.gravity * 1000;
    gravitySelector.onchange = () => {
        game.parameters.gravity = parseFloat(gravitySelector.value / 1000);
    };
    const terminalVelocitySelector = document.querySelector("#terminalVelocity");
    terminalVelocitySelector.value = game.parameters.terminalVelocity * 20;
    terminalVelocitySelector.onchange = () => {
        game.parameters.terminalVelocity = parseFloat(terminalVelocitySelector.value) / 20;
    };
    const colorSelector = document.querySelector("#color");
    colorSelector.value = game.ballColor;
    colorSelector.onchange = () => {
        game.ballColor = colorSelector.value;
    };
}