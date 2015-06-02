/*-------------------------------------------------------------------
Names: Kyle Leng, Shawn Cramp
Student Ids: 1206190790, 111007290
Description : Create a simple canvas game
---------------------------------------------------------------------*/


//-------------------------------- Create the canvas --------------------------------
var canvas = document.createElement("canvas");

var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth/2;
canvas.height = window.innerHeight/2;
document.body.appendChild(canvas);

//-------------------------------- Background image --------------------------------
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

//-------------------------------- Hero image --------------------------------
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;
};
heroImage.src = "images/hero.png";

//-------------------------------- Monster image --------------------------------
// Array for Storing Monsters
var monsters = [];

var monsterImage = new Image();
monsterImage.src = "images/monster.png";

// ------------------------------- Projectile image ----------------------------
// Array for Storing Projectiles
var projectiles = [];

var projectileImage = new Image();
var projectileAudio = new Audio('audio/pew-sound.wav'); //play from this audio file
projectileImage.src = "images/bullet.png" // Temporary Projectile Image for Testing

//-------------------------------- Game objects --------------------------------
var hero = {
	speed: 256 // movement in pixels per second
};

// Monster Object
function Monster(I) {
	I = I || {};
	
	// Set Active to True
	I.active = true;
	
	// Set Coordinates for Monster
	I.x = canvas.width;
	I.y = canvas.height;
	I.xDirection = 1;
	I.yDirection = 1;
	I.speed = 256;
	
	// Declare functions for how monsters behave
	I.inBounds = function() {
		if ( I.y < 0 ){ // if monster is at top part of image, switch direction on the y-axis
			I.yDirection = 1;
		} else if ( I.y > canvas.height - 32 ){ // if monster is at bottom part of image, switch direction on y-axis
			I.yDirection = -1;
		}
		if ( I.x < 0 ){ // if monster is at the left side of the image, switch direction on the x-axis
			I.xDirection = 1;
		} else if ( I.x > canvas.width - 32){ // if monster is at the right side of the image, switch direction on the x-axis
			I.xDirection = -1;
		}
	};
	
	// Draw Monsters
	I.draw = function() {
		ctx.drawImage(monsterImage, this.x, this.y);
	};
	
	// Check if Monster is alive
	I.alive = function() {
		if (
			hero.x >= (I.x + 32)
			&& I.x >= (hero.x + 32)
			&& hero.y >= (I.y + 32)
			&& I.y >= (hero.y + 32)
		) {updateScore()};
	};
	
	// Update monster with new information and check if its still active
	I.update = function(modifier) {
		I.x += I.speed * (modifier * I.xDirection); // Move monster along x-axis at set speed * x-direction
		I.y += I.speed * (modifier * I.yDirection); // Move monster along y-axis at set speed * y-direction

		// The logic in this for killing a monster might have to be looked at
		I.active = I.active && I.alive();
	};
	
	return I;
}

// Projectile Object
function Projectile(I, xDirection, yDirection) {
	I.active = true;
	
	// Declare coordinates for projectile
	I.speed = 512;
	I.x = hero.x;
	I.y = hero.y;
	I.xDirection = xDirection;
	I.yDirection = yDirection;
	
	// Declare functions for how the projectile behaves
	I.inBounds = function() {
		return I.x >= 0 && I.x <= canvas.width && I.y >= 0 && I.y <= canvas.height;
	};

	// Draw projectile at x and y
	I.draw = function() {
		ctx.drawImage(projectileImage, I.x, I.y);
	};

	// Goes through each monster in the Monster Array to see if a hit is registered
	I.hit = function() {
		monsters.forEach(function(Monster) {
			if (
				I.x <= (Monster.x + 16) && I.y <= Monster.y + 16 && I.x >= Monster.x && I.y >= Monster.y
			) {updateScore()}
			
		});
		
	};

	// Updates the projectiles with new locations
	I.update = function(modifier) {
		if( I.yDirection == -1){ //up
			I.y -= I.speed * (modifier);
		}
		if(I.yDirection == 1){ //down
			I.y += I.speed * (modifier);
		}
		if(I.xDirection == 1){ //right
			I.x += I.speed * (modifier);
		}
		if(I.xDirection == -1 ){ //left
			I.x -= I.speed * (modifier);
		}
		
		I.active = I.active && I.inBounds();
	};
	
	return I;
}

var clickDrag ={
	isClickDrag : false,
	changeClickDrag : function(setValue){
		this.isClickDrag = setValue;
	}
};

//--------------------------------  Local Storage Initialization --------------------------------
if (localStorage.getItem("monstersCaught")){ 
//if they have played the game before continue from where they last left off
	var monstersCaught = Number(localStorage.getItem("monstersCaught"));
}else{ //if they haven't played the game before start the monster count at 0
	var monstersCaught = 0;
}

//-------------------------------- Background Audio Initialization --------------------------------
var backgroundAudio = new Audio('audio/fm6 .mp3'); //play from this audio file, copyright stuff
backgroundAudio.volume = 0.2 //set the volume so it doesn't kill people's ears
backgroundAudio.addEventListener('ended', function() { //set an event listener so that when the music ends it restarts
    this.currentTime = 0; //the variable this refers to backgroundAudio and restarts at the 0 second mark
    this.play();
}, false);
//backgroundAudio.play(); //play the audio

//-------------------------------- Handle keyboard controls --------------------------------
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

//-------------------------------- On Mouse Movement --------------------------------
//Current when the user presses the left click in renders a a monster
//Current when the user presses the left click in renders a a monster
canvas.addEventListener("mousedown", function(event){ 
	if(event.clientX >= hero.x && event.clientX <= hero.x + 32 && event.clientY >= hero.y && event.clientY <= hero.y + 32){
		clickDrag.changeClickDrag(true);
	}
}, false);

canvas.addEventListener("mousemove", function(event){
	if(clickDrag.isClickDrag == true){
		hero.x = event.clientX;
		hero.y = event.clientY;
	}
}, false);
canvas.addEventListener("mouseup", function(event){
	clickDrag.changeClickDrag(false);
	//if the user does not click on the hero then shoot a projectile
	if( (event.clientX < hero.x && event.clientY < hero.y)||
		(event.clientX < hero.x && event.clientY > hero.y + 32)||
		(event.clientX > hero.x + 32 && event.clientY < hero.y)||
		(event.clientX > hero.x + 32 && event.clientY > hero.y + 32) ||
		 event.clientX < hero.x || event.clientX > hero.x + 32 || event.clientY < hero.y || event.clientY > hero.y + 32
	){
		shootProjectile(event);
	}
},false);
//-------------------------------- Update game objects --------------------------------
var updateScore = function() {
	++monstersCaught;
	storeData(monstersCaught);
	//Play Collision Audio
	var collisionAudio = new Audio('audio/normal-hitclap.wav');
	collisionAudio.volume= 0.2;
	collisionAudio.play();
};

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
	
	// Update Projectiles
	projectiles.forEach(function(projectile) {
		projectile.update(modifier);
	});
	
	// Update Monsters
	monsters.forEach(function(monster) {
		monster.update(modifier);
	});
	
	// Spawn more monsters at random (This might be better with a timer)
	if(Math.random() < 0.1) {
		monsters.push(Monster(self));
	}
	
// -------------------------------- Hero and Goblin Detection --------------------------------	
	// Are they touching?
	monsters.forEach(function(monster) {
		monster.alive();
	});
	// Did projectile collide with monster
	projectiles.forEach(function(projectile) {
		projectile.hit();
	});
	
	heroWallCollision();
};

// -------------------------------- Store Local Data --------------------------------
var storeData = function(monstersCaught){
	localStorage.monstersCaught = monstersCaught; //store the data locally	
};

// -------------------------------- Hero and Monster Wall Collision Detection --------------------------------
var heroWallCollision = function(){
	if ( hero.y < 0 ){ //if the hero top part of the image hits the top of the screen stop it
		hero.y = 0; //stop it at the top wall
	} else if ( hero.y > canvas.height - 32 ){ //if the hero's bottom image touches the bottom of the screen
		hero.y = canvas.height - 32; //stop it at the bottom wall
	}
	if ( hero.x < 0 ){ //if the hero's left side of the image touches the left side of the screen
		hero.x = 0; //stop it at the left wall wall
	} else if ( hero.x > canvas.width - 32 ){ //if the hero's right side of the image touches the right side of the screen
		hero.x = canvas.width - 32; //stop it at the right wall wall (the 32 is a constant factor might want to update this)
	}
};
 //----------------------------------------Shoot Projectiles----------------------
var shootProjectile = function(event){
	//shoot the projectile
	//projectile.projectileExists = true; //sets the projectile to exist
	//sets the projectile to the hero's location
	var xDirection;  
	var yDirection;
	//Figure out the direction to shoot the bullet
	if(event.clientY < hero.y && event.clientX < hero.x){ //shoot top left
		xDirection = -1;
		yDirection = -1;
	}else if(event.clientY > hero.y + 32 && event.clientX < hero.x){ //shoot bottom left
		xDirection = -1;
		yDirection = 1;
	}else if(event.clientY < hero.y && event.clientX > hero.x + 32){ //shoot top right
		xDirection = 1;
		yDirection = -1;
	}else if(event.clientY > hero.y + 32 && event.clientX > hero.x + 32){ //shoot bottom right
		xDirection = 1;
		yDirection = 1;
	}else if(event.clientY < hero.y) { //shoot up
		xDirection = 0;
		yDirection = -1;
	}else if(event.clientY > hero.y + 32){ //shoot down
		xDirection = 0;
		yDirection = 1;
	}else if(event.clientX < hero.x) { //shoot left
		xDirection = -1;
		yDirection = 0;
	}else if(event.clientX > hero.x + 32){ //shoot right
		xDirection = 1;
		yDirection = 0;
	}
	
	projectiles.push(Projectile(self, xDirection, yDirection));
	
	projectileAudio.volume = 0.2; //set the volume so it doesn't kill people's ears
	projectileAudio.play();
};
//-------------------------------- Draw everything --------------------------------
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height, 0, 0, canvas.width, canvas.height);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}
	
	monsters.forEach(function(monster) {
		monster.draw();
	});
	
	projectiles.forEach(function(projectile) {
		projectile.draw();
	});
	
	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);
};



// -------------------------------- The main game loop --------------------------------
var main = function () {
	var now = Date.now();
	var delta = now - then;
	update(delta / 1000, event);
	
	render();

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// -------------------------------- Cross-browser support for requestAnimationFrame --------------------------------
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
main();
