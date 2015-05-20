// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth/2;
canvas.height = window.innerHeight/2;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;
};
heroImage.src = "images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/monster.png";

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var monster = {};

if (localStorage.getItem("monstersCaught")){ //if they have played the game before continue from where they last left off
	var monstersCaught = Number(localStorage.getItem("monstersCaught"));
}else{ //if they haven't played the game before start the monster count at 0
	var monstersCaught = 0;
	
}
var backgroundAudio = new Audio('audio/fm6 .mp3');
backgroundAudio.volume = 0.5
backgroundAudio.play();

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the player catches a monster
var reset = function () {


	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
};
// Update game objects
var update = function (modifier) {
	if (38 in keysDown) { // Player holding up
		hero.y -= hero.speed * modifier;
	}
	if (40 in keysDown) { // Player holding down
		hero.y += hero.speed * modifier;
	}
	if (37 in keysDown) { // Player holding left
		hero.x -= hero.speed * modifier;
	}
	if (39 in keysDown) { // Player holding right
		hero.x += hero.speed * modifier;
	}
	
	// Are they touching?
	if (
		hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
	) {
		++monstersCaught;
		storeData(monstersCaught);
		reset();
	}
	
	heroWallCollision();
	
};
var storeData = function(monstersCaught){
	localStorage.monstersCaught = monstersCaught; //store the data locally	
}
var heroWallCollision = function(){
	if(hero.y<0){ //if the hero top part of the image hits the top of the screen stop it
		hero.y = 0; //stop it at the top wall
	}else if(hero.y>canvas.height-32){ //if the hero's bottom image touches the bottom of the screen 
		hero.y = canvas.height-32; //stop it at the bottom wall
	}
	if (hero.x<0){ //if the hero's left side of the image touches the left side of the screen
		hero.x = 0; //stop it at the left wall wall
	}else if (hero.x>canvas.width-32){ //if the hero's right side of the image touches the right side of the screen
		hero.x = canvas.width-32; //stop it at the right wall wall (the 32 is a constant factor might want to update this)
	}
}
// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height, 0, 0, canvas.width, canvas.height);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;
	update(delta / 1000);
	
	render();

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();
