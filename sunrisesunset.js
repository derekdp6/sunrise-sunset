/*
Updates

- wasd support added! a = L, d = R, w = jump, s = duck
- Camera is in use but may create bugs
- Implemented Willem's new jump - great job Willem!
- mX is our new mouseX variable, do not use World.mouseX!
- Added variables p1Health, shipHealth, metal (see code);
- Interface Meters added, we need designs for player character health meter!
- Energy Ball respawn bug FIXED!

- Testing new animations for Shield and Acid Rain
- Currently implementing Alex's weather code


We need to prepare for the following:
prepare our code for multiple weapon types, 
making Enemies have similar properties

Bugs
sprite.tint opacity has stopped working

*/

//Environment
var clock = 0; //clock
var skyClock = clock % 3000;
var day = 0;


var sky = {
  r: 0, g: 180, b:255
};
var skyTimes = {
  dayStart: 0, dayMid: 500, dayEnd: 1000, dusk1: 1250, dusk2: 1375, nightStart: 1500, nightMid: 1750, nightEnd: 2500, dawn1: 2625, dawn2: 2750, dayOver: 2999
};

// WEATHER SYSTEM START
var weatherNum; //Random Weather Variable
var forecast;   //Weather Forecast (clear or rain?)


var weather = {
    skyColor: {
      day:       {r: 0,   g: 180, b: 255},
      set1:      {r: 255, g: 200, b: 100}, //Sunset 1/Sunrise 2, orange
      set2:      {r: 255, g: 200, b: 180}, //Sunset 2/Sunrise 1, pink
      night:     {r: 10,  g: 0,   b: 80}
    },
    cloudColor:  {r: 255, g: 255, b: 255},
    spriteColor: {
      day:       {r: 255, g: 255, b: 255},
      shadow:    {r: 80,  g: 80,  b: 80}, //silhouettes
      night:     {r: 130 ,g: 150, b: 255}, //moonlight
      sunrise:   {r: 210 ,g: 150, b: 140}, //sunrise
    }
};


var stars = createGroup();
stars.add(createSprite(200, 200));
stars.setAnimationEach("Stars");
stars.setTintEach(rgb(255,255,255, 0.0));
var starOpacity = 0.1;
  
var sun = createSprite(0, 100);
sun.setAnimation("sun");
sun.scale = 0.5;
sun.x = camera.x - 100;
sun.y = -100;
sun.velocityX = 0;
sun.velocityY = 0;
var moon = createSprite(0, 500);
moon.setAnimation("moon");
moon.scale = 0.5;
moon.velocityX = 0;
moon.velocityY = 0;
moon.rotationSpeed = 0.01;


//landscape
//var asteroids = createSprite(200,230);
//asteroids.setAnimation("Asteroids");
var mountains = createSprite(200,230);
mountains.setAnimation("mountains");
var cloud1 = createSprite(randomNumber(100,140),randomNumber(50,200),randomNumber(200,300),randomNumber(200,300));
cloud1.setAnimation("cloud_1");
var cloud2 = createSprite(randomNumber(180,220),randomNumber(50,200),randomNumber(200,300),randomNumber(200,300));
cloud2.setAnimation("cloud_2");
var cloud3 = createSprite(randomNumber(260,300),randomNumber(50,200),randomNumber(200,300),randomNumber(200,300));
cloud3.setAnimation("cloud_3");
cloud1.velocityX = randomNumber(1,3);
cloud2.velocityX = randomNumber(1,3);
cloud3.velocityX = randomNumber(1,3);

var clouds = createGroup();
clouds.add(cloud1);
clouds.add(cloud2);
clouds.add(cloud3);
clouds.setTintEach(rgb(255, 255, 255, 0.65));


var landscape = createGroup();
for (var i = 0; i < 10 ; i++){
  landscape.add(createSprite((i * 128) - 300, 400)); //Ground Sprites
}
landscape.setAnimationEach("dirt_sand_1");
//landscape.add(asteroids);
landscape.add(mountains);

//Music
playSound("sound://category_background/outback.mp3",true);


//Health + Resources
var p1Health = 10;
var shipHealth = 500;
var metal = 0;


//Ship Sprite
var ship = createSprite(200, 240);
ship.setAnimation("ship");
ship.scale = 1.2;
ship.height = 200;
ship.setCollider("rectangle", 0, 0, 50, 200, 0);

//Player & Laser Sprites
var p1 = createSprite(200, 320); //Player Sprite
p1.setAnimation("alienPink_1");
p1.scale = 0.5;
var laser = createSprite(p1.x, p1.y);
laser.setAnimation("laser");
laser.visible = false;
var lineBeam = createSprite(p1.x, p1.y);
lineBeam.setAnimation("line_beam");
lineBeam.visible = false;

//p1Health

var p1HealthAnimation = createSprite(200, 380);
p1HealthAnimation.setAnimation("heart10");

//Shield
var p1Shield = createSprite(p1.x, p1.y);
p1Shield.setAnimation("shield");
p1Shield.scale = 0.2;


//var targeting;
var mX = (camera.x - 200) + World.mouseX;

var mouseClicked = 0;
var p1Direction = 0;      


//enemies
var blueEnemies = createGroup();
var enemyFlies = createGroup();
var shieldEnemies = createGroup();
var shieldFlies = createGroup();
var jumpingEnemies = createGroup();
//var sneakyGuy
//var behemoth
//var bountyHunter
//var ufo

var enemyBlue = createSprite(650, 310);
enemyBlue.setAnimation("alienBlue_walk_L");
enemyBlue.scale = 0.7;
enemyBlue.velocityX = -4;
var enemyBlue2 = createSprite(-500, 310);
enemyBlue2.setAnimation("alienBlue_walk_R");
enemyBlue2.scale = 0.7;
enemyBlue2.velocityX = 4;


var enemySprites = createGroup();//change name of this group
enemySprites.add(enemyBlue);
enemySprites.add(enemyBlue2);
enemySprites.add(p1);//added p1 to
enemySprites.add(ship);

var groupBlue = createGroup();
groupBlue.add(enemyBlue);
groupBlue.add(enemyBlue2);

//Effects
var energyBoom = createSprite(200, -200);
energyBoom.destroy();


//Acid Rain
var acidRain = createSprite(-100,50);
acidRain.setAnimation("rain");

//All Sprites
var spriteRGB = {r: 255, g: 255, b: 255};

var lose = 0;






function draw() {//*******************************************DRAW LOOP

  player();
  enemies();
  background(rgb( sky.r, sky.g, sky.b ));
  skyColor();
  chooseWeather();
  cloudMovement();
  playerHealth();
  mountains.x = camera.x;
  //asteroids.x = camera.x;
  //camera
  if(p1.x > -50 && p1.x < 450){
    camera.x = p1.x;
    camera.y = 200;
  }
  drawSprites();  
  shield();
  userInterface();
  laserPointer();
  if(lose === 0){
  
  


  }
mX = (camera.x - 200) + World.mouseX;




clock++;
skyClock = clock % 3000;
shipDeath();
}//***********************************************************************




function player (){//Movement and player weaponry
  
  //Player Movement
  if(keyDown("a")){//Left
    p1.setAnimation("alienPink_walk_L");
    p1.x -=5;
    p1Direction = 0;
  }else if(keyDown("d")){//Right
    p1.setAnimation("alienPink_walk_R");
    p1.x +=5;
    p1Direction = 1;
  }else if(keyWentUp("a")){
    p1.setAnimation("alienPink_stand_L");
  }else if(keyWentUp("d")){
    p1.setAnimation("alienPink_stand_R");
  }else if(keyDown("s") && p1Direction === 0){
    p1.setAnimation("alienPink_duck_L");
  }else if(keyDown("s") && p1Direction === 1){
    p1.setAnimation("alienPink_duck_R");
  }else if(keyWentUp("s") && p1Direction === 0){
    p1.setAnimation("alienPink_stand_L");
  }else if(keyWentUp("s") && p1Direction === 1){
    p1.setAnimation("alienPink_stand_R");
  }
  
  //Mouse Laser Stuff
  if(mouseDown("leftButton")){//Laser was mouseClicked?
    mouseClicked = 1;
    
    //lineBeam.visible = true;
    lineBeam.pointTo(mX, World.mouseY);
    lineBeam.x = p1.x;
    lineBeam.y = p1.y;
    
  }else{
    mouseClicked = 0;
    lineBeam.visible = false;
    
  }
  
  
  //MainMouse 
  if(mouseWentDown("leftButton")){
    laser.setAnimation("laser");
    laser.visible = true;
    laser.setVelocity(((mX - p1.x)/2.5), ((World.mouseY - p1.y)/2.5));
  }
  //if(mouseWentDown("leftButton") && )

  //Respawn Laser
  if(laser.x < camera.x - 250 || laser.x > camera.x + 250 || laser.y < -50 || laser.y > 345){
    laser.visible = false;
    laser.setVelocity(0,0);
  }
  if(laser.visible === false){
    laser.x = p1.x;
    laser.y = p1.y;
  }

  //Laser Sounds
  if(mouseDown("leftButton")){
    if(laser.velocityX > 15 || laser.velocityX < -15 || laser.velocityY > 15 || laser.velocityY < -15){
      playSound("Fast Laser.mp3",false);
    }else if (laser.velocityX < 15 || laser.velocityX > -15 || laser.velocityY < 15 || laser.velocityY > -15){
      playSound("Laser Redirect.mp3");
    }
  }
  
  
  //Jump
  if(keyWentDown("w") && p1.y >= 280){
    p1.velocityY = -9;
    if(p1Direction === 0 ) {
      p1.setAnimation("alienPink_jump_L");
    } else if (p1Direction === 1 ){
      p1.setAnimation("alienPink_jump_R");
    }
  }
  if(p1.y < 320){
    p1.velocityY += 0.5;
  }
  else if(p1.y >320){
    p1.velocityY = 0;
    p1.y = 320;
    //p1.setAnimation("alienPink_1");
  }
  
}

function laserPointer(){
  
  fill(rgb((mouseClicked * 255),255 -(mouseClicked * 255),(mouseClicked * 255),0.2));
  noStroke();
  ellipse(mX,World.mouseY,16,16);
  fill(rgb((mouseClicked * 255),255-(mouseClicked * 255),(mouseClicked * 255),0.9));
  ellipse(mX,World.mouseY,6,6);
  
  if(laser.visible === true){
    
    fill(rgb(255, 255, 255, 0.2));
    noStroke();
    ellipse(laser.x,laser.y,300,300);
    fill(rgb(255, 255, 255, 0.2));
    ellipse(laser.x,laser.y,600,600);
    
  }

}

function shield(){
  noStroke();
  fill(rgb(25,255,100, 0.4));
  ellipse(p1.x,p1.y,50,50);
  p1Shield.x = p1.x;
  p1Shield.y = p1.y;

}


function enemyOrder(){
  
  if (day === 0 && skyClock >= 1500){//Night 1
    
  }
  if (clock === 4500){//Night 2
    
  }
}

function enemies(){
  
  //enemyBlue
  if (enemyBlue.isTouching(laser) && laser.visible === true){
    boom();
    enemyBlue.x = 700;
    enemyBlue.velocityX = randomNumber(-2, -7);
    enemyBlue.setAnimation("alienBlue_walk_L");
    
  
    laser.visible = false;    // These were copied from the laser respawn code FYI :(
    laser.setVelocity(0,0);   //
    
  }
  if (enemyBlue2.isTouching(laser) && laser.visible === true){
       boomTwo();
       enemyBlue2.x = -600;
    enemyBlue2.velocityX = randomNumber(2,7);
    enemyBlue2.setAnimation("alienBlue_walk_R");
    
    laser.visible = false;    // These were copied from the laser respawn code FYI :(
    laser.setVelocity(0,0); //
  }
  if (enemyBlue.isTouching(ship)){
    enemyBlue.setVelocity(0, 0);
    enemyBlue.setAnimation("alienBlue_jump_L");
    shipHealth = shipHealth - 4;
    
  }
  if (enemyBlue2.isTouching(ship)){
    enemyBlue2.setVelocity(0, 0);
    enemyBlue2.setAnimation("alienBlue_jump_R");
    shipHealth = shipHealth - 4;
    
  }
  //groupBlue
  if (groupBlue.isTouching(laser) && laser.visible === true){

    
  }

}

//User Interface

function userInterface(){
  //shipHealth Meter
  stroke("white");
  noFill();
  rect(100, 126, 200, 6);
  noStroke();
  fill("white");
  rect(100, 126, shipHealth/10, 6);
  fill("white");
  text("SHIP PROGRESS", 100, 120);
  
  //Day Count
  fill("white");
  text("DAY " + day, camera.x + 150, 16);
  
  //Metal Amount
  text("METAL: " + metal, camera.x - 190, 16);
  if (clock % 3000 === 0) {
    day++;
  }
}

function playerHealth(){
  
  //playerHealth Meter
  p1HealthAnimation.x = camera.x - 130;
  
  if (enemyBlue.collide(p1) && p1Health > -1 ) {
    p1Health -= 1;
    //pig += 1;
    
  }
  p1HealthAnimation.setAnimation("heart"+p1Health);
  
  if (p1Health === -1){
      p1.setAnimation("heart-1");
  }
}

//ship destruction

function shipDeath(){
  if(shipHealth <= 0){
    boomThree();
    ship.y = 100000;
    enemyBlue2.x = -600;
    enemyBlue2.velocityX = randomNumber(2,7);
    enemyBlue2.setAnimation("alienBlue_walk_R");
    enemyBlue.x = 700;
    enemyBlue.velocityX = randomNumber(-2, -7);
    enemyBlue.setAnimation("alienBlue_walk_L");
    lose = 1;
    p1.destroy();
    p1Shield.destroy();
    gameOver();
  }
}

function boom(){
    energyBoom = createSprite(enemyBlue.x, enemyBlue.y);
    energyBoom.setAnimation("energy_boom");
    energyBoom.scale = 0.7;
    energyBoom.lifetime = 19;
    playSound("sound://category_digital/laser_fade_4.mp3");

  
}
function boomTwo(){
    energyBoom = createSprite(enemyBlue2.x, enemyBlue2.y);
    energyBoom.setAnimation("energy_boom");
    energyBoom.scale = 0.7;
    energyBoom.lifetime = 19;
    playSound("sound://category_digital/laser_fade_4.mp3");
  
}
function boomThree(){
    energyBoom = createSprite(ship.x, ship.y);
    energyBoom.setAnimation("energy_boom");
    energyBoom.scale = 10;
    energyBoom.lifetime = 19;
    playSound("sound://category_digital/laser_fade_4.mp3");
  
}
function gameOver(){
  fill("red");
  textSize(36);
  text("Game", camera.x - 105, 200);  
  text("Over", camera.x + 5, 200);
}


function chooseWeather() {
  if (skyClock === 0) {
    weatherNum = randomNumber(0, 100);
    if (weatherNum <= 90) {
      forecast = "clear";
    }
    if (weatherNum >= 91 && weatherNum < 101){
      forecast = "acid rain";
    }
    //if (weatherNum >= 0) {
    //  forecast = "acid rain";
    //}
  }
  if (forecast === "clear" && skyClock === 0){
    weather = {
      skyColor: {
        day:       {r: 0,   g: 180, b: 255},
        set1:      {r: 255, g: 200, b: 100}, //Sunset 1/Sunrise 2, orange
        set2:      {r: 255, g: 200, b: 180}, //Sunset 2/Sunrise 1, pink
        night:     {r: 10,  g: 0,   b: 80}
      },
      cloudColor:  {r: 255,  g: 255,  b: 255},
      spriteColor: {
        day:       {r: 255, g: 255, b: 255},
        shadow:    {r: 80,  g: 80,  b: 80}, //silhouettes
        night:     {r: 130 ,g: 150, b: 255}, //moonlight
        sunrise:   {r: 210 ,g: 150, b: 140}, //sunrise
      }
    };
    
  }else if (forecast === "acid rain" && skyClock === 0){

    weather = {
      skyColor: {
        day:       {r: 175, g: 185, b: 200},
        set1:      {r: 100, g: 150, b: 100},
        set2:      {r: 150, g: 100, b: 90},
        night:     {r: 40,  g: 40,  b: 65},
      },
      cloudColor:  {r: 75,  g: 75,  b: 85},
      spriteColor: {
        day:       {r: 100, g: 100, b: 100},
        shadow:    {r: 80,  g: 80,  b: 80}, //silhouettes
        night:     {r: 100 ,g: 120, b: 225}, //moonlight
        sunrise:   {r: 210 ,g: 150, b: 140}, //sunrise
      }
    };
  }
  
}

function fade(v0, v1, t0, t1) {
  return (v1 - v0)/(t1 - t0);
}

function skyColor(){
  stars.get(0).x = camera.x;
  sun.x = camera.x;
  moon.x = camera.x;

    
    if (skyClock === skyTimes.dayMid){//Sun Velocity
      
      sun.x = 100; sun.y = -100;
      sun.velocityX =(200 / (skyTimes.nightStart - skyTimes.dayMid));
      sun.velocityY =(470 / (skyTimes.nightStart - skyTimes.dayMid));
      spriteRGB.r == weather.spriteColor.day.r;
      spriteRGB.g == weather.spriteColor.day.g;
      spriteRGB.b == weather.spriteColor.day.b;
    }
    if (skyClock >= skyTimes.dayMid && skyClock < skyTimes.nightStart){//1st Quarter 80
      spriteRGB.r -= fade(weather.spriteColor.shadow.r, weather.spriteColor.day.r, skyTimes.dayMid,skyTimes.nightStart);
      spriteRGB.g -= fade(weather.spriteColor.shadow.g, weather.spriteColor.day.g, skyTimes.dayMid,skyTimes.nightStart);
      spriteRGB.b -= fade(weather.spriteColor.shadow.b, weather.spriteColor.day.b, skyTimes.dayMid,skyTimes.nightStart);
    }
    if (skyClock >= skyTimes.dayStart && skyClock < skyTimes.dayEnd){//Day
      sky.r = weather.skyColor.day.r;
      sky.g = weather.skyColor.day.g;
      sky.b = weather.skyColor.day.b;
    }
    if (skyClock >= skyTimes.dayEnd && skyClock < skyTimes.dusk1){//Dusk 1
      sky.r += fade(weather.skyColor.day.r, weather.skyColor.set1.r, skyTimes.dayEnd, skyTimes.dusk1);
      sky.g += fade(weather.skyColor.day.g, weather.skyColor.set1.g, skyTimes.dayEnd, skyTimes.dusk1);
      sky.b += fade(weather.skyColor.day.b, weather.skyColor.set1.b, skyTimes.dayEnd, skyTimes.dusk1);
    }
    if (skyClock >= skyTimes.dusk1 && skyClock < skyTimes.dusk2){//Dusk 2
      sky.r += fade(weather.skyColor.set1.r, weather.skyColor.set2.r, skyTimes.dusk1, skyTimes.dusk2);
      sky.g += fade(weather.skyColor.set1.g, weather.skyColor.set2.g, skyTimes.dusk1, skyTimes.dusk2);
      sky.b += fade(weather.skyColor.set1.b, weather.skyColor.set2.b, skyTimes.dusk1, skyTimes.dusk2);
    }

    if (skyClock >= skyTimes.dusk2 && skyClock < skyTimes.nightStart){//Night Start
      sky.r += fade(weather.skyColor.set2.r, weather.skyColor.night.r, skyTimes.dusk2, skyTimes.nightStart);
      sky.g += fade(weather.skyColor.set2.g, weather.skyColor.night.g, skyTimes.dusk2, skyTimes.nightStart);
      sky.b += fade(weather.skyColor.set2.b, weather.skyColor.night.b, skyTimes.dusk2, skyTimes.nightStart);
      starOpacity += fade(1, 0.1, skyTimes.nightStart, skyTimes.dusk2);
    }
    if (skyClock >= skyTimes.nightStart && skyClock < skyTimes.nightMid){//2nd Quarter Moonlight
      spriteRGB.r += fade(weather.spriteColor.night.r, weather.spriteColor.shadow.r, skyTimes.nightMid, skyTimes.nightStart);
      spriteRGB.g += fade(weather.spriteColor.night.g, weather.spriteColor.shadow.g, skyTimes.nightMid, skyTimes.nightStart);
      spriteRGB.b += fade(weather.spriteColor.night.b, weather.spriteColor.shadow.b, skyTimes.nightMid, skyTimes.nightStart);
    }
    
    if (skyClock === skyTimes.nightMid){//Moon Velocity
      moon.x = camera.x - 100; moon.y = -100;
      moon.velocityX =(200 / (skyTimes.nightEnd - skyTimes.nightMid));
      moon.velocityY =(470 / (skyTimes.nightEnd - skyTimes.nightMid));
    }
    if (skyClock >= skyTimes.nightMid && skyClock < skyTimes.nightEnd){//3rd Quarter Moonset
      spriteRGB.r -= (50/(skyTimes.nightEnd - skyTimes.nightMid));
      spriteRGB.g -= (70/(skyTimes.nightEnd - skyTimes.nightMid));
      spriteRGB.b -= (175/(skyTimes.nightEnd - skyTimes.nightMid));
    }
    if (skyClock >= skyTimes.nightStart && skyClock < skyTimes.nightEnd){//Night
      sky.r = weather.skyColor.night.r;
      sky.g = weather.skyColor.night.g;
      sky.b = weather.skyColor.night.b;
    }
  
    if (skyClock >= skyTimes.nightEnd && skyClock < skyTimes.dawn1){//Sunrise 1 
      sky.r -= fade(weather.skyColor.set2.r, weather.skyColor.night.r, skyTimes.nightEnd, skyTimes.dawn1);
      sky.g -= fade(weather.skyColor.set2.g, weather.skyColor.night.g, skyTimes.nightEnd, skyTimes.dawn1);
      sky.b -= fade(weather.skyColor.set2.b, weather.skyColor.night.b, skyTimes.nightEnd, skyTimes.dawn1);
      spriteRGB.r += (130/(skyTimes.dawn1 - skyTimes.nightEnd));
      spriteRGB.g += (70/(skyTimes.dawn1 - skyTimes.nightEnd));
      spriteRGB.b += (60/(skyTimes.dawn1 - skyTimes.nightEnd));
      starOpacity -= fade(1, 0.1, skyTimes.dawn1, skyTimes.nightEnd);
    }
    if (skyClock >= skyTimes.dawn1 && skyClock < skyTimes.dawn2){//Sunrise 2
      sky.r -= fade(weather.skyColor.set1.r, weather.skyColor.set2.r, skyTimes.dawn1, skyTimes.dawn2);
      sky.g -= fade(weather.skyColor.set1.g, weather.skyColor.set2.g, skyTimes.dawn1, skyTimes.dawn2);
      sky.b -= fade(weather.skyColor.set1.b, weather.skyColor.set2.b, skyTimes.dawn1, skyTimes.dawn2);
      spriteRGB.r += (45/(skyTimes.dawn2 - skyTimes.dawn1));
      spriteRGB.g += (105/(skyTimes.dawn2 - skyTimes.dawn1));
      spriteRGB.b += (115/(skyTimes.dawn2 - skyTimes.dawn1));
  
    }
    if (skyClock >= skyTimes.dawn2 && skyClock <= skyTimes.dayOver){//Sunrise 3
      sky.r -= fade(weather.skyColor.day.r, weather.skyColor.set1.r, skyTimes.dawn2, skyTimes.dayOver);
      sky.g -= fade(weather.skyColor.day.g, weather.skyColor.set1.g, skyTimes.dawn2, skyTimes.dayOver);
      sky.b -= fade(weather.skyColor.day.b, weather.skyColor.set1.b, skyTimes.dawn2, skyTimes.dayOver);
    }
    
  
  
    
    
  
    
  
  //Change spriteTint
  //p1.tint = rgb(spriteRGB.r,spriteRGB.g,spriteRGB.b);
  enemySprites.setTintEach(rgb(spriteRGB.r, spriteRGB.g, spriteRGB.b));
  landscape.setTintEach(rgb(spriteRGB.r, spriteRGB.g, spriteRGB.b));
  stars.setTintEach(rgb(255,255,255, starOpacity));
  
  
}

function cloudMovement(){  //This needs to move independently from the camera!

  if (cloud1.x > 800){
    cloud1.x = -400;
    cloud1.y = randomNumber(0,200);
  }
  if (cloud2.x > 800){
    cloud2.x = -400;
    cloud2.y = randomNumber(0,200);
  }
  if (cloud3.x > 800){
    cloud3.x = -400;
    cloud3.y = randomNumber(0,200);
  }
}





















/*
    if (skyClock === skyTimes.dayMid){//Sun Velocity
      
      sun.x = 100; sun.y = -100;
      //sun.velocityX =(200 / (skyTimes.nightStart - skyTimes.dayMid));
      //sun.velocityY =(470 / (skyTimes.nightStart - skyTimes.dayMid));
      spriteRGB.r == weather.rain.spriteColor.day.r;
      spriteRGB.g == weather.rain.spriteColor.day.g;
      spriteRGB.b == weather.rain.spriteColor.day.b;
    }
    if (skyClock >= skyTimes.dayMid && skyClock < skyTimes.nightStart){//1st Quarter 80
      spriteRGB.r -= fade(weather.rain.spriteColor.shadow.r, weather.rain.spriteColor.day.r, skyTimes.dayMid,skyTimes.nightStart);
      spriteRGB.g -= fade(weather.rain.spriteColor.shadow.g, weather.rain.spriteColor.day.g, skyTimes.dayMid,skyTimes.nightStart);
      spriteRGB.b -= fade(weather.rain.spriteColor.shadow.b, weather.rain.spriteColor.day.b, skyTimes.dayMid,skyTimes.nightStart);
    }
    if (skyClock >= skyTimes.dayStart && skyClock < skyTimes.dayEnd){//Day
      sky.r = weather.rain.skyColor.day.r;
      sky.g = weather.rain.skyColor.day.g;
      sky.b = weather.rain.skyColor.day.b;
    }
    if (skyClock >= skyTimes.dayEnd && skyClock < skyTimes.dusk1){//Dusk 1
      sky.r += fade(weather.rain.skyColor.day.r, weather.rain.skyColor.set1.r, skyTimes.dayEnd, skyTimes.dusk1);
      sky.g += fade(weather.rain.skyColor.day.g, weather.rain.skyColor.set1.g, skyTimes.dayEnd, skyTimes.dusk1);
      sky.b += fade(weather.rain.skyColor.day.b, weather.rain.skyColor.set1.b, skyTimes.dayEnd, skyTimes.dusk1);
    }
    if (skyClock >= skyTimes.dusk1 && skyClock < skyTimes.dusk2){//Dusk 2
      sky.r += fade(weather.rain.skyColor.set1.r, weather.rain.skyColor.set2.r, skyTimes.dusk1, skyTimes.dusk2);
      sky.g += fade(weather.rain.skyColor.set1.g, weather.rain.skyColor.set2.g, skyTimes.dusk1, skyTimes.dusk2);
      sky.b += fade(weather.rain.skyColor.set1.b, weather.rain.skyColor.set2.b, skyTimes.dusk1, skyTimes.dusk2);
    }

    if (skyClock >= skyTimes.dusk2 && skyClock < skyTimes.nightStart){//Night Start
      sky.r += fade(weather.rain.skyColor.set2.r, weather.rain.skyColor.night.r, skyTimes.dusk2, skyTimes.nightStart);
      sky.g += fade(weather.rain.skyColor.set2.g, weather.rain.skyColor.night.g, skyTimes.dusk2, skyTimes.nightStart);
      sky.b += fade(weather.rain.skyColor.set2.b, weather.rain.skyColor.night.b, skyTimes.dusk2, skyTimes.nightStart);
      //starOpacity += fade(1, 0.1, skyTimes.nightStart, skyTimes.dusk2);
    }
    if (skyClock >= skyTimes.nightStart && skyClock < skyTimes.nightMid){//2nd Quarter Moonlight
      spriteRGB.r += fade(weather.rain.spriteColor.night.r, weather.rain.spriteColor.shadow.r, skyTimes.nightMid, skyTimes.nightStart);
      spriteRGB.g += fade(weather.rain.spriteColor.night.g, weather.rain.spriteColor.shadow.g, skyTimes.nightMid, skyTimes.nightStart);
      spriteRGB.b += fade(weather.rain.spriteColor.night.b, weather.rain.spriteColor.shadow.b, skyTimes.nightMid, skyTimes.nightStart);
    }
    
    if (skyClock === skyTimes.nightMid){//Moon Velocity
      moon.x = camera.x - 100; moon.y = -100;
      //moon.velocityX =(200 / (skyTimes.nightEnd - skyTimes.nightMid));
      //moon.velocityY =(470 / (skyTimes.nightEnd - skyTimes.nightMid));
    }
    if (skyClock >= skyTimes.nightMid && skyClock < skyTimes.nightEnd){//3rd Quarter Moonset
      spriteRGB.r -= (50/(skyTimes.nightEnd - skyTimes.nightMid));
      spriteRGB.g -= (70/(skyTimes.nightEnd - skyTimes.nightMid));
      spriteRGB.b -= (175/(skyTimes.nightEnd - skyTimes.nightMid));
    }
    if (skyClock >= skyTimes.nightStart && skyClock < skyTimes.nightEnd){//Night
      sky.r = weather.rain.skyColor.night.r;
      sky.g = weather.rain.skyColor.night.g;
      sky.b = weather.rain.skyColor.night.b;
    }
  
    if (skyClock >= skyTimes.nightEnd && skyClock < skyTimes.dawn1){//Sunrise 1 
      sky.r -= fade(weather.rain.skyColor.set2.r, weather.rain.skyColor.night.r, skyTimes.nightEnd, skyTimes.dawn1);
      sky.g -= fade(weather.rain.skyColor.set2.g, weather.rain.skyColor.night.g, skyTimes.nightEnd, skyTimes.dawn1);
      sky.b -= fade(weather.rain.skyColor.set2.b, weather.rain.skyColor.night.b, skyTimes.nightEnd, skyTimes.dawn1);
      spriteRGB.r += (130/(skyTimes.dawn1 - skyTimes.nightEnd));
      spriteRGB.g += (70/(skyTimes.dawn1 - skyTimes.nightEnd));
      spriteRGB.b += (60/(skyTimes.dawn1 - skyTimes.nightEnd));
      //starOpacity -= fade(1, 0.1, skyTimes.dawn1, skyTimes.nightEnd);
    }
    if (skyClock >= skyTimes.dawn1 && skyClock < skyTimes.dawn2){//Sunrise 2
      sky.r -= fade(weather.rain.skyColor.set1.r, weather.rain.skyColor.set2.r, skyTimes.dawn1, skyTimes.dawn2);
      sky.g -= fade(weather.rain.skyColor.set1.g, weather.rain.skyColor.set2.g, skyTimes.dawn1, skyTimes.dawn2);
      sky.b -= fade(weather.rain.skyColor.set1.b, weather.rain.skyColor.set2.b, skyTimes.dawn1, skyTimes.dawn2);
      spriteRGB.r += (45/(skyTimes.dawn2 - skyTimes.dawn1));
      spriteRGB.g += (105/(skyTimes.dawn2 - skyTimes.dawn1));
      spriteRGB.b += (115/(skyTimes.dawn2 - skyTimes.dawn1));
  
    }
    if (skyClock >= skyTimes.dawn2 && skyClock <= skyTimes.dayOver){//Sunrise 3
      sky.r -= fade(weather.rain.skyColor.day.r, weather.rain.skyColor.set1.r, skyTimes.dawn2, skyTimes.dayOver);
      sky.g -= fade(weather.rain.skyColor.day.g, weather.rain.skyColor.set1.g, skyTimes.dawn2, skyTimes.dayOver);
      sky.b -= fade(weather.rain.skyColor.day.b, weather.rain.skyColor.set1.b, skyTimes.dawn2, skyTimes.dayOver);
    }
*/
