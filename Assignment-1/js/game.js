/*-------------------------------------------------------------------
Names: Kyle Leng, Shawn Cramp
Student Ids: 1206190790, 
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
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
	monster.x = canvas.width;
	monster.y = canvas.height;
	monster.xdir = 1;
	monster.ydir = 1;
};
monsterImage.src = "images/monster.png";

// ------------------------------- Projectile image ----------------------------
var projectileReady = false;
var projectileExists = false;
var projectileImage = new Image();
projectileImage.onload = function () {
	projectile.x = hero.x;
	projectile.y = hero.y;
}
var projectileAudio = new Audio('audio/pew-sound.wav'); //play from this audio file
projectileImage.src = "images/bullet.png" // Temporary Projectile Image for Testing

//-------------------------------- Game objects --------------------------------
var hero = {
	speed: 256, // movement in pixels per second
	colour : "default"
};
var monster = {
	speed: 256 // monster
};
var projectile = {
	projectileExists : false,
	speed: 512, // projectile speed
	x : 0,
	y : 0,
	xDirection : 0,
	yDirection : 0
};

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
backgroundAudio.play(); //play the audio

//-------------------------------- Handle keyboard controls --------------------------------
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

//-------------------------------- Reset the game when the player catches a monster --------------------------------
var monsterReset = function () { // This will have to change if we want multiple monsters since it only handles one monster
	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
};

var projectileReset = function () { // This needs to destroy the projectile on wall collision or monster collision
	projectile.projectileExists = false;
}

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
//------------------------------ Added features  ----------------------------------	
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
	
	//will shoot the bullet in a certain direction
	if(projectile.projectileExists){
		if( projectile.yDirection == -1){ //up
			projectile.y -= projectile.speed * (modifier);
		}
		if(projectile.yDirection == 1){ //down
			projectile.y += projectile.speed * (modifier);
		}
		if(projectile.xDirection == 1){ //right
			projectile.x += projectile.speed * (modifier);
		}
		if(projectile.xDirection == -1 ){ //left
			projectile.x -= projectile.speed * (modifier);
		}
	}
	monster.x += monster.speed * (modifier * monster.xdir); // Move monster along x-axis at set speed * x-direction
	monster.y += monster.speed * (modifier * monster.ydir); // Move monster along y-axis at set speed * y-direction
// -------------------------------- Hero and Goblin Detection --------------------------------	
	// Are they touching?
	if (
		hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
	) {
		++monstersCaught;
		storeData(monstersCaught);
		monsterReset();
		//Play Collision Audio
		var collisionAudio = new Audio('audio/normal-hitclap.wav');
		collisionAudio.volume= 0.2;
		collisionAudio.play();
	}
	// Did projectile collide with monster
	if (
		projectile.x <= (monster.x + 32) && projectile.y <= monster.y + 32 && projectile.x >= monster.x && projectile.y >= monster.y
	) {
		++monstersCaught;
		storeData(monstersCaught);
		monsterReset();
		//Play Collision Audio
		var collisionAudio = new Audio('audio/normal-hitclap.wav'); // Might be a way to reduce redundancy here with hero collision noise
		collisionAudio.volume = 0.2; // Since this is the same code as in the if statement above
		collisionAudio.play();
	}
	
	heroWallCollision();
	monsterWallCollision();
	projectileWallCollision();
	
};
// -------------------------------- Store Local Data --------------------------------
var storeData = function(monstersCaught){
	
	if(hero.colour == "default"){
		console.log("where do i store");
		localStorage.monstersCaught = monstersCaught; //store the data locally
	}else if(hero.colour == "red"){
		console.log("where do i red");
		localStorage.monstersCaughtRed = monstersCaught; //store the data locally for red
	}else if(hero.colour == "green"){
		console.log("where do i green");
		localStorage.monstersCaughtGreen = monstersCaught; //store the data locally for green
	}
}
var clearStorage = function(){ //clears the localStorage 
	localStorage.monstersCaught = 0;
	monstersCaught = localStorage.monstersCaught;
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
}

 var monsterWallCollision = function(){ // Detects if monster is at a wall
	 if ( monster.y < 0 ){ // if monster is at top part of image, switch direction on the y-axis
		 monster.ydir = 1;
	 } else if ( monster.y > canvas.height - 32 ){ // if monster is at bottom part of image, switch direction on y-axis
		 monster.ydir = -1;
	 }
	 if ( monster.x < 0 ){ // if monster is at the left side of the image, switch direction on the x-axis
		 monster.xdir = 1;
	 } else if ( monster.x > canvas.width - 32){ // if monster is at the right side of the image, switch direction on the x-axis
		 monster.xdir = -1;
	 }
 }
 
 var projectileWallCollision = function(){
	 if ( projectile.y < 0 ){
		 projectileExists = false;
	 } else if ( projectile.y > canvas.height - 32 ){
		 projectileExists = false;
	 }
	 if ( projectile.x < 0 ){
		 projectileExists = false;
	 } else if ( projectile.x > canvas.width - 32){
		 projectileExists = false;
	 }
 }
 //----------------------------------------Shoot Projectiles----------------------
var shootProjectile = function(event){
	//shoot the projectile
	projectile.projectileExists = true; //sets the projectile to exist
	//sets the projectile to the hero's location
	projectile.x = hero.x + 16;  
	projectile.y = hero.y + 16;
	//Figure out the direction to shoot the bullet
	if(event.clientY < hero.y && event.clientX < hero.x){ //shoot top left
		projectile.xDirection = -1;
		projectile.yDirection = -1;
	}else if(event.clientY > hero.y + 32 && event.clientX < hero.x){ //shoot bottom left
		projectile.xDirection = -1;
		projectile.yDirection = 1;
	}else if(event.clientY < hero.y && event.clientX > hero.x + 32){ //shoot top right
		projectile.xDirection = 1;
		projectile.yDirection = -1;
	}else if(event.clientY > hero.y + 32 && event.clientX > hero.x + 32){ //shoot bottom right
		projectile.xDirection = 1;
		projectile.yDirection = 1;
	}else if(event.clientY < hero.y) { //shoot up
		projectile.xDirection = 0;
		projectile.yDirection = -1;
	}else if(event.clientY > hero.y + 32){ //shoot down
		projectile.xDirection = 0;
		projectile.yDirection = 1;
	}else if(event.clientX < hero.x) { //shoot left
		projectile.xDirection = -1;
		projectile.yDirection = 0;
	}else if(event.clientX > hero.x + 32){ //shoot right
		projectile.xDirection = 1;
		projectile.yDirection = 0;
	}
	projectileAudio.volume = 0.2 //set the volume so it doesn't kill people's ears
	projectileAudio.play();
}
//-------------------------------- Draw everything --------------------------------
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
	if (projectile.projectileExists){
		ctx.drawImage(projectileImage, projectile.x, projectile.y);
	}
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
monsterReset();
main();
