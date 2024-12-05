const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let score = 0;

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;

let ravens = [];

class Raven {
    constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = "./img/raven.png";
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255)
        ];
        this.color = "rgb(" + this.randomColors[0] + "," + this.randomColors[1] + "," + this.randomColors[2] + ")";
    }
    update(deltaTime) {
        if (this.y < 0 || this.y > canvas.height - this.height) this.directionY = this.directionY * -1;
        this.x -= this.directionX;
        this.y += this.directionY;
        this.timeSinceFlap += deltaTime;
        if (this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceFlap += deltaTime;

        if (this.timeSinceFlap > this.flapInterval) {

            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;

            this.timeSinceFlap = 0;
        }

    }
    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );
        ctx.drawImage(
            this.image,
            this.frame * this.spriteWidth,
            0,
            this.spriteWidth,
            this.spriteHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}

// const raven = new Raven();

function drawScore() {
    ctx.fillStyle = "black";
    ctx.font = "50px Helvetica";
    ctx.fillText("Score: " + score, 50, 75);

    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 52, 77);
}

window.addEventListener("click", function (e) {
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    console.log(detectPixelColor);

    const pc = detectPixelColor.data;
    ravens.forEach(object => {
        if (
            object.x < e.x &&
            object.x + object.width > e.x &&
            object.y < e.y &&
            object.y + object.height > e.y &&
            object.randomColors[0] === pc[0] &&
            object.randomColors[1] === pc[1] &&
            object.randomColors[2] === pc[2]
        ) {
            object.markedForDeletion = true;
            score++;
        }
    })
})

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    timeToNextRaven += deltaTime;

    if (timeToNextRaven > ravenInterval) {
        ravens.push(new Raven());
        timeToNextRaven = 0;
        // ravenInterval = Math.random() * 1500 + 500;

        // sort ravens по ширине (больше - впереди)
        ravens.sort(function (a, b) {
            return a.width - b.width;
        })
    }

    drawScore();
    [...ravens].forEach(object => object.update(deltaTime));
    [...ravens].forEach(object => object.draw());
    ravens = ravens.filter(object => !object.markedForDeletion);
    requestAnimationFrame(animate);
}
animate(0);