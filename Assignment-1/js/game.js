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
	speed: 256, // movement in pixels per second
	colour: "default"
};

// Monster Object
function Monster() {
	this.active = true;
	
	// Set Coordinates for Monster
	this.x = 32 + (Math.random() * (canvas.width - 64));
	this.y = 32 + (Math.random() * (canvas.height - 64));
	this.xDirection = 1;
	this.yDirection = 1;
	this.speed = 256;
	
	// Declare functions for how monsters behave
	this.inBounds = function() {
		if ( this.y < 0 ){ // if monster is at top part of image, switch direction on the y-axis
			this.yDirection = 1;
		} else if ( this.y > canvas.height - 32 ){ // if monster is at bottom part of image, switch direction on y-axis
			this.yDirection = -1;
		}
		if ( this.x < 0 ){ // if monster is at the left side of the image, switch direction on the x-axis
			this.xDirection = 1;
		} else if ( this.x > canvas.width - 32){ // if monster is at the right side of the image, switch direction on the x-axis
			this.xDirection = -1;
		}
	};
	
	// Draw Monster if it is active
	this.draw = function() {
		if (this.active == true) {
			ctx.drawImage(monsterImage, this.x, this.y);
		}
	};

	// Check if Monster collided with hero
	this.collision = function() {
		if (hero.x <= (this.x + 32)
			&& this.x <= (hero.x + 32)
			&& hero.y <= (this.y + 32)
			&& this.y <= (hero.y + 32)
			&& this.active == true) {
			this.active = false;
			updateScore();
		}
	};

	// Update monster with new information and check if its still active
	this.update = function(modifier) {
		this.x += this.speed * (modifier * this.xDirection); // Move monster along x-axis at set speed * x-direction
		this.y += this.speed * (modifier * this.yDirection); // Move monster along y-axis at set speed * y-direction
	};
}

// Projectile Object
function Projectile(xDirection, yDirection) {
	this.active = true;
	
	// Declare coordinates for projectile
	this.speed = 512;
	this.x = hero.x;
	this.y = hero.y;
	this.xDirection = xDirection;
	this.yDirection = yDirection;
	
	// Declare functions for how the projectile behaves
	this.inBounds = function() {
		if (this.x >= 0 && this.x <= canvas.width && this.y >= 0 && this.y <= canvas.height) {
			this.active = true;
		} else {
			this.active = false;
		}
	};

	// Draw projectile at x and y
	this.draw = function() {
		if (this.active == true) {
			ctx.drawImage(projectileImage, this.x, this.y);
		}
	};

	// Updates the projectiles with new locations
	this.update = function(modifier) {
		if( this.yDirection == -1){ //up
			this.y -= this.speed * (modifier);
		}
		if(this.yDirection == 1){ //down
			this.y += this.speed * (modifier);
		}
		if(this.xDirection == 1){ //right
			this.x += this.speed * (modifier);
		}
		if(this.xDirection == -1 ){ //left
			this.x -= this.speed * (modifier);
		}
	};
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
backgroundAudio.volume = 0.2; //set the volume so it doesn't kill people's ears
backgroundAudio.addEventListener('ended', function() { //set an event listener so that when the music ends it restarts
    this.currentTime = 0; //the variable this refers to backgroundAudio and restarts at the 0 second mark
    this.play();
}, false);
backgroundAudio.play(); //play the audio

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

// Function to Spawn new Monsters
var spawnMonster = function () {
	monsters.push(new Monster());
}

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

	if(67 in keysDown){
		clearStorage();
	}if(82 in keysDown){ //restart the game when the users presser r
		clearStorage();
		restartGame();
	}if(49 in keysDown){//change hero image to red
		heroImage.src = "images/hero_red.png";
		hero.colour = "red";
		changeStorage();
	}if(50 in keysDown){ //change back to default
		heroImage.src = "images/hero.png";
		hero.colour = "default";
		changeStorage();
	}if(51 in keysDown){//change hero image to green
		heroImage.src = "images/hero_green.png";
		hero.colour = "green";
		changeStorage();
	}
	
	// Update Projectiles
	projectiles.forEach(function(projectile) {
		projectile.update(modifier);
	});
	
	// Update Monsters
	monsters.forEach(function(monster) {
		monster.update(modifier);
	});
	
// -------------------------------- Hero and Goblin Detection --------------------------------	
	// Are they touching?
	monsters.forEach(function(Monster) {
		Monster.collision()
	});
	
	// Did projectile collide with monster
	projectiles.forEach(function(projectile) {
		monsters.forEach(function(Monster) {
			if (
				projectile.x <= (Monster.x + 16) && projectile.y <= Monster.y + 16 && projectile.x >= Monster.x && projectile.y >= Monster.y
			) {
				Monster.active = false;
				projectile.active = false;
				updateScore();
			}
		});
	});
	
	// Check if the Hero Collided with the boundary
	heroWallCollision();
	
	// Check if each of the monsters collided with the boundary
	monsters.forEach(function(monster) {
		monster.inBounds();
	});
	
	// Check if any bullets collided with the boundary
	projectiles.forEach(function(projectile) {
		projectile.inBounds();
	});

	// Spawn Monsters when Counter = 3, then reset back to 0 and count to 3 again
	setInterval(function () {
		++counter;
	}, 1000);
	if (counter == 3) {
		counter = 0;
		spawnMonster();
	}
};

// -------------------------------- Store Local Data --------------------------------
var storeData = function(monstersCaught){
	if(hero.colour == "default"){
		localStorage.monstersCaught = monstersCaught; //store the data locally
	}else if(hero.colour == "red"){
		localStorage.monstersCaughtRed = monstersCaught; //store the data locally for red
	}else if(hero.colour == "green"){
		localStorage.monstersCaughtGreen = monstersCaught; //store the data locally for green
	}
}
var clearStorage = function(){ //clears the localStorage
	if(hero.colour == "default"){
		localStorage.monstersCaught = 0; //store the data locally
		monstersCaught = localStorage.monstersCaught;
	}else if(hero.colour == "red"){
		localStorage.monstersCaughtRed = 0; //store the data locally for red
		monstersCaught = localStorage.monstersCaughtRed;
	}else if(hero.colour == "green"){
		localStorage.monstersCaughtGreen = 0; //store the data locally for green
		monstersCaught = localStorage.monstersCaughtGreen;
	}
}
var changeStorage = function(){
	if(49 in keysDown){//change hero image to red
		if(localStorage.getItem("monstersCaughtRed")){
			monstersCaught = localStorage.monstersCaughtRed;
		}else{
			monstersCaught = 0;
			localStorage.monstersCaughtRed = 0;
		}
	}if(50 in keysDown){ //change back to default
		if(localStorage.getItem("monstersCaught")){
			monstersCaught = localStorage.monstersCaught;
		}else{
			monstersCaught = 0;
			localStorage.monstersCaught = 0;
		}
	}if(51 in keysDown){//change hero image to green
		if(localStorage.getItem("monstersCaughtGreen")){
			monstersCaught = localStorage.monstersCaughtGreen;
		}else{
			monstersCaught = 0;
			localStorage.monstersCaughtGreen = 0;
		}
	}
}
var restartGame = function(){ //restarts the game
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;
	backgroundAudio.currentTime = 0;
	clearStorage();
}

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
	
	projectiles.push(new Projectile(xDirection, yDirection));
	
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
var counter = 0;
main();
