//Call in preload
function preloadKnight(){    
    //Knight
    game.load.spritesheet('knight', 'assets/knight/Silver Knight Spritesheet.png', 354, 230);
    game.load.image('heart', 'assets/knight/heart 100.png');
    game.load.image('half_heart', 'assets/knight/half heart 100.png');
    game.load.spritesheet('timer', 'assets/knight/Teleport Timer.png', 120, 120);
    game.load.spritesheet('blinkTimer', 'assets/Blink Timer Spritsheet.png', 100, 100);
    game.load.spritesheet('blinkDisplay', 'assets/knight/Teleportation Spritesheet.png', 150, 150);
    
    //Buttons
    game.load.image('pauseMenu', 'assets/knight/Pause Menu.png');
    game.load.spritesheet('pauseButton', 'assets/knight/Pause Button.png', 100, 100);
    game.load.image('exitButton', 'assets/knight/exit button.png');
    game.load.image('restartButton', 'assets/knight/restart button.png');
    
    //Victory and Game Over
    game.load.image('victoryText', 'assets/Win or Lose/Victory Text.png');
    game.load.image('mainMenuButton', 'assets/Win or Lose/Main Menu Button.png');
    game.load.image('nextLevelButton', 'assets/Win or Lose/Next Lvl Button.png');
    game.load.image('gameOverText', 'assets/Win or Lose/Game Over Text.png');
    game.load.image('tryAgainButton', 'assets/Win or Lose/Try Again Button.png');
    game.load.image('black', 'assets/black screen.png');
    
    //Music
    game.load.audio('victoryMusic', 'assets/audio/knight audio/Medieval Fanfare.wav');
    game.load.audio('gameOverMusic', 'assets/audio/knight audio/Game Over.wav');    
    game.load.audio('level1Music', 'assets/audio/music/Boss 1 Music.wav');
    game.load.audio('level2Music', 'assets/audio/music/Boss 2 Music.wav');
    
    //Audio
    game.load.audio('teleAudio', 'assets/audio/knight audio/teleport sound.wav');
    game.load.audio('teleAudio2', 'assets/audio/knight audio/teleport sound 5.wav'); 
    game.load.audio('swordHitAudio', 'assets/audio/knight audio/Sword3.wav');
    game.load.audio('swordSlash', 'assets/audio/knight audio/Sword Slash 1.wav');
    game.load.audio('knightStep', 'assets/audio/knight audio/Knight Step 1.wav');
}

//Knight, has most if not all player/user input code
var knight;

//Pause variables
var pauseButton, pauseMenu, exitButton, restartButton, gameIsOver;

//Health
var health, knightHurtTimer = 0, heart1, heart1Half, heart2, heart2Half, heart3, heart3Half, hit; //Knight has 6 lives

//Hitboxes for attacks/weapons
var hitboxes, knightBox;

//Black screen
var black

//Movement variables
var moveBinds;
var ground, touchGround, onPlatform, hitPlatform;

//Blink Variables
var blink, blinkDist = 450, blinkTimer = 0, blinkCount, canBlink, blinkAni, blink1, blink2, blink3;
//var blinkTimerText = "";
//var blinkTextDisplay;
var blinkTimerDisplay;

//Long teleport
var canTele, teleKey, teleMode, teleTimer = 0, timerSprite;

//Attack
var attack, canAttack, attackTimer;

// Momentum
var speed, drag = 100, walkSpeed = 600;

//Sounds
var teleAudio, teleAudio2, wooshAudio, swordHitAudio, swordSlash, knightStepSound;

//Music
var levelMusic;
var isLevel1; // variable to 
var isLevel2;

//Boss related variables.
var distanceFromBoss, vertFromBoss, livesTaken, boss, knightStaggerJump, knightStaggerSlide;

//Call in create
function createKnight(level){    
    //For use in victory and restart functions
    currentLvl = level;
    
    // Fades out levelMusic if any is playing
    if (levelMusic != null){
        game.add.tween(levelMusic).to( { volume: 0}, 100, Phaser.Easing.Linear.None, true);
    }
    
    //For knight's variables and functions to stop updating
    gameIsOver = false;
    
    //Health
    health = 6;
    heart1Half = game.add.image(10, 10, 'half_heart');
    heart1 = game.add.image(10, 10, 'heart');
    heart2Half = game.add.image(125, 10, 'half_heart');
    heart2 = game.add.image(125, 10, 'heart');
    heart3Half = game.add.image(240, 10, 'half_heart');
    heart3 = game.add.image(240, 10, 'heart');
    hit = false;
    
    //Teleport Timer Display
    timerSprite = game.add.sprite(355, 10, 'timer');
    timerSprite.alpha = 0.5;
    
    blinkCount = 3;
    
    //blink displays
    blink1 = game.add.sprite(450, -10, 'blinkDisplay');
    blink1.scale.setTo(.75,.75);
    blink1.visible = true;
    blink2 = game.add.sprite(545, -10, 'blinkDisplay');
    blink2.scale.setTo(.75,.75);
    blink2.visible = true;
    blink3 = game.add.sprite(640, -10, 'blinkDisplay');
    blink3.scale.setTo(.75,.75);
    
    //blinkTextDisplay = game.add.text(640, 25, blinkTimerText, { font: "65px VT323", fill: "#f76300", align: "center" });
    blinkTimerDisplay = game.add.sprite(650,25, 'blinkTimer');
    blinkTimerDisplay.scale.setTo(.75, .75);
    blinkTimerDisplay.visible = false;
    //Add Silver Knight
    knight = game.add.sprite(200, 0, 'knight');
    knight.anchor.setTo(0.5, 0.5);
    game.physics.enable(knight);
    knight.body.gravity.y = 2500;
    //Adjust size of sprite's body, aka built in hitbox
    knight.body.setSize(75, 211, 60, 18);
    
    //Make hitboxes for weapons
    hitboxes = game.add.group();
    hitboxes.enableBody = true;
    
    //Make hitbox for sword
    knight.addChild(hitboxes);
    knightBox = hitboxes.create(0, 0, null);
    knightBox.anchor.setTo(0.5, 0.5);
    knight.hurtOnce = false;
    //So hitbox won't be active unless knight is attacking
    knightBox.body.enable = false;
    
    //To play attacking animation completely and to not spam attack
    knight.attacking = false;
    canAttack = true, attackTimer = 0;
    
    knight.body.collideWorldBounds = true;
    knight.animations.add('stand', [1, 2], 5);
    knight.animations.add('walk', [4, 5], 5);
    knight.attackAni = knight.animations.add('attack', [14, 15, 16, 17, 18, 19, 20, 21], 25);
    knight.tele = knight.animations.add('teleport', [7, 8, 9, 10, 11, 12], 14);
    
    knight.attackAni.onStart.add(function (){
        speedF();
    });
    
    //To play animations completely
    knight.attackAni.onComplete.add(function () {
        knight.attacking = false;
    });
    knight.tele.onComplete.add(function () {
        knight.teleporting = false;
    });
    
    //Movement Key Binds
    moveBinds = game.input.keyboard.addKeys({
        'upW': Phaser.KeyCode.W,
        'downS': Phaser.KeyCode.S,
        'leftA': Phaser.KeyCode.A,
        'rightD': Phaser.KeyCode.D
    });

    // Shift for blink, either left or right works
    blink = game.input.keyboard.addKey(Phaser.KeyCode.SHIFT);
    
    //Space for attack
    attack = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

    //Mouse click for teleportation, click teleKey to enter long tele mode
    game.input.mouse.capture = true;
    teleKey = game.input.keyboard.addKey(Phaser.KeyCode.F);
    teleMode = false;
    
    //For limiting teleportation
    canBlink = true;
    canTele = true;
    
    //Black screen for victory/game over
    black = game.add.image(0, 0, 'black');
    black.scale.setTo(10, 10);
    black.alpha = 0;
    
    //For preventing platform glitches
    onPlatform = false;
    hitPlatform = false;
    
    // camera follow knight 
    game.camera.follow(knight);
    
    //Sounds
    teleAudio = game.add.audio('teleAudio'), teleAudio2 = game.add.audio('teleAudio2');
    swordHitAudio = game.add.audio('swordHitAudio'), swordSlash = game.add.audio('swordSlash');
    knightStepSound = game.add.audio('knightStep');
    // For BG music: Add like: music = game.add.audio('theme',1,true); and to play: key, volume, loop music.play('',0,1,true);
    
    //Exit Button
    exitButton = game.add.button(centerX-100, 60, 'exitButton', startLevelSelect, this);
    exitButton.anchor.setTo(1, 0.5);
    
    //Restart Button
    restartButton = game.add.button(centerX+100, 60, 'restartButton', restartLevel, this);
    restartButton.anchor.setTo(0, 0.5);
    
    //Pause
    pauseButton = game.add.button(centerX, 60, 'pauseButton');
    pauseButton.frame = 1;
    pauseButton.anchor.setTo(0.5, 0.5);
    pauseButton.onInputUp.add(pauseGame, this);
}

//Call in update
function updateKnight(currentDistanceFromBoss, currentVertFromBoss, ground){
    //playLevelMusic();
    
    //Boss stuff
    distanceFromBoss = currentDistanceFromBoss, vertFromBoss = currentVertFromBoss;
    
    //Button Tints: Buttons tint when hovered over
    if (pauseButton.input.pointerOver()){
        pauseButton.frame = 0;
    }
    else{
        pauseButton.frame = 1;
    }
    //Maybe for all buttons?
    
    if(!gameIsOver){
    //------TIMERS------//
        //Damage timers
        hurt();
        // teleport timer
        teleTimers();
        //attack timer
        attackTimerFunc();
    //------END TIMERS------//
        
    
        var knightOrientation = knight.scale.x;
    
        //Attack
        if(attack.isDown && !knight.teleporting && canAttack){
            attackFunc();
            canAttack = false;
        }
    
    //------------------MOVEMENT--------------------------//   
    touchGround = knight.body.y === (game.world.height - knight.body.height);
        
        //Teleport controls
        teleControls();
    
        //Normal Movement
        if(!hit && !onPlatform)
            movement(knightOrientation, hitPlatform, ground);

        //Speed and drag
        speedF();
        
        //Get out of the ground if in it accidentally (blinking)
        if(knight.body.y >= game.world.height)
            knight.body.y = game.world.height - 1;
    //------------------END MOVEMENT--------------------------//
    
    //--------------SOUNDS-----------------------------//
    //Teleport
    if(knight.teleporting && (canBlink || canTele)){
        teleAudio.play();
        teleAudio2.play();
        //wooshAudio.play();
    }
    
    //Sword hit
    if(knight.attacking){
        //Slash sound always
        swordSlash.play();
        //Clink sound only if hit boss
        if(!boss.hurtOnce)
            swordHitAudio.play();
    }
    
    //--------------END SOUNDS-----------------------------//
    }
}

function playLevelMusic(Level){
    if (Level == 1) { //Adds 'intro' only once
        levelMusic = game.add.audio('level1Music');
        levelMusic.volume = 1;
        levelMusic.play();
        levelMusic.loopFull();
        console.log('playing level1Music');
    } else if (Level == 2) {
        levelMusic = game.add.audio('level2Music');
        levelMusic.volume = 0.8;
        levelMusic.play();
        levelMusic.loopFull();
        console.log('playing level2Music');
    }
//    if (levelMusic.volume < 1){
////        console.log('intro not palying');
//        levelMusic.volume = 1;
//        levelMusic.loopFull();
//    }
}

//WASD movement
function movement(knightOrientation, hitPlatform, ground){
    var magicKnightPivotNumber = 114;//cause it's some random number that works
    //So animations work properly and one doesn't stop the other
    if(!knight.attacking && !knight.teleporting){    
        //Move Left and Right
        if (moveBinds.leftA.isDown) {
            knight.body.velocity.x = walkSpeed * -1;
            knight.scale.setTo(-1, 1); //Knight faces left
            if(knightOrientation != knight.scale.x){//Pivot turning
                knight.body.x -= knight.body.width + magicKnightPivotNumber;
            }
            knight.animations.play('walk');
            //knightStepSound.play();
        } else if (moveBinds.rightD.isDown) {
            knight.body.velocity.x = walkSpeed;
            knight.scale.setTo(1, 1); //Knight faces right
            if(knightOrientation != knight.scale.x){//Pivot turning
                knight.body.x += knight.body.width + magicKnightPivotNumber;
            }
            knight.animations.play('walk');
            //knightStepSound.play();
        } else if(knight.body.velocity.x == 0){
            knight.animations.play('stand');
        }

    //Jump
        if (moveBinds.upW.isDown && ((knight.body.touching.down && hitPlatform) || touchGround || ground)) {
            knight.body.velocity.y = -1000;
        }

    //Stop moving left/right and fall through platforms
        if (moveBinds.downS.isDown){
            if(hitPlatform && knight.body.touching.down //Allow knight to fall through the platform
               && (knight.body.y + knight.body.height < game.world.height - 70)){//Not the ground
               knight.body.y += platforms.antiStuck/4;
            }
            knight.body.velocity.x = 0;
        }
    }
}

//Speed and drag
function speedF(){
    // Horizontal momentum kept and slowed down with drag
    speed = knight.body.velocity.x;
    if (speed > 0) {
        knight.body.velocity.x = Math.abs(speed - drag);
    } else if (speed < 0) {
        knight.body.velocity.x = speed + drag;
    } else {
        knight.body.velocity.x = 0;
    }
}

//Attack timer, so attack isn't spammed
function attackTimerFunc() {
    if(!canAttack)
        attackTimer += 1;
    //Can attack after 50 update counts
    if(attackTimer === 30){
        canAttack = true;
        attackTimer = 0;
    }
}

//Timers for in between each teleport/blink
function teleTimers(){
    
    if (canTele) {
        // comment out code, add back in to only display teleport timer when in teleMode
        
        if(teleMode){
            timerSprite.alpha = 1;
            timerSprite.frame = 17;
        }
        else{
            timerSprite.alpha = 0.5;
            timerSprite.frame = 16;
        }

    } else if (!canTele && teleTimer < 200) {
        teleTimer += 1;
        timerSprite.alpha = 0.5;
        timerSprite.frame = 0;

    } else if (!canTele && teleTimer < 400) {

        teleTimer += 1;

        timerSprite.frame = 4;

    } else if (!canTele && teleTimer < 600) {

        teleTimer += 1;

        timerSprite.frame = 8;      

    } else if (!canTele && teleTimer < 800) {

        teleTimer += 1;

        timerSprite.frame = 12;

    } else if (!canTele && teleTimer == 800) {

        canTele = true;
        timerSprite.frame = 16;

    }

    
    //Blink timer
    blinkTimer += 1;
    // blink timer starts if you have used a blink
    if (blinkCount < 3) {
        blinkTimerDisplay.visible = true;
        
        if (blinkTimer < 100) {
            blinkTimerDisplay.frame = 0;
        } else if (blinkTimer < 200) {
            blinkTimerDisplay.frame = 1;
        } else if (blinkTimer < 300) {
            blinkTimerDisplay.frame = 2;
        } else if (blinkTimer < 400) {
            blinkTimerDisplay.frame = 3;
        } 
        //blinkTextDisplay.visible = true;
        // displays inverted 500 -> 499 -> 0
        // easier for users to understand
        //blinkTextDisplay.setText(500 - blinkTimer)

    }
    //Resetting for when using blinks
    if (blinkTimer === 15 && blinkCount > 0) {//Still have all blinks
        canBlink = true;
    } else if(blinkTimer === 500) {// resets all blinks after 500 frames
        canBlink = true;
        blinkCount = 3;
        blinkTimer = 0;
        blinkTimerDisplay.visible = false;
        blink1.visible = true;
        blink2.visible = true;
        blink3.visible = true;
    }
}

//Long teleportation
function cursorTele() {//Get center of knight to wherever mouse clicks
    canTele = false;
    teleTimer = 0;
    //Width-wise. Weird numbers because of how spritesheet is set up right now
    var newX = game.input.activePointer.x;
    if(knight.scale.x == 1){//facing right
        newX -= knight.body.width/4;
    }else if(knight.scale.x == -1){//facing left
        newX -= knight.body.width/1.4;
    }
    //Height-wise
    var newY = game.input.activePointer.y - knight.body.height/2;
    teleport(newX, newY);
}

//Controls to teleport or blink
function teleControls(){
    //Long tele, click teleKey to enter long tele mode
    if(teleKey.downDuration(1)){
        teleMode = !teleMode;
    }
    
    //Controls for blinking and long teleporting
    if (canBlink && blink.isDown &&//VV These for blinking in current direction VV
        (moveBinds.leftA.isDown || moveBinds.rightD.isDown || moveBinds.upW.isDown || moveBinds.downS.isDown)) {
        knight.teleporting = true;
        knight.animations.play('teleport');
        blinkTele();
    } else if (canTele && game.input.activePointer.leftButton.isDown && teleMode) {
        knight.teleporting = true;
        knight.animations.play('teleport');
        cursorTele();
        teleMode = false;
    }
}

//Attack animation and hitbox
function attackFunc() {
    knight.attacking = true;
    var x2 = -30;//if facing right
    if(knight.scale.x < 0)//facing left
        x2 = -180;
    //Make knightBox appear
    knightBox.body.setSize(200, 220, x2, -110);
    knightBox.body.enable = true;
    knight.animations.play('attack');
    var knightBoxTimer = game.time.create(true);
    knightBoxTimer.add(300, function(){
        knight.attacking = false;
        knightBox.body.enable = false;
    });
    knightBoxTimer.start();
}

//Blink
function blinkTele() {
    blinkCount--;
    canBlink = false;
    blinkTimer = 0;
    
    //displays blink icons
    if (blinkCount == 2) {
        blink3.visible = false;
    } else if (blinkCount == 1) {
        blink2.visible = false;
    } else if (blinkCount == 0) {
        blink1.visible = false;
    }
    
    var newX = knight.body.x;
    var newY = knight.body.y;
    //if moving right add 10 to current pos
    if (moveBinds.rightD.isDown) {
        newX += blinkDist;
    }
    //else subtract 10
    else if (moveBinds.leftA.isDown) {
        newX -= blinkDist;
    }

    //if moving up subtract 10 to current pos
    if (moveBinds.upW.isDown) {
        newY -= blinkDist;
    }
    //else add 10
    else if (moveBinds.downS.isDown) {
        newY += blinkDist;
    }

    teleport(newX, newY);
}

//Teleport
function teleport(newX, newY) {
        knight.body.x = newX;
        knight.body.y = newY;
        //Make teleporting look like actual teleporting
        knight.visibile = false;
        game.time.events.add(Phaser.Time.SECOND, this);
}

//Damage timers, for damage functions to work properly
function hurt(){
    //Knight getting hurt, wait  to reset variable
    if(!knight.hurtOnce){
        knightHurtTimer += 1;
    }
    //So knight won't move for a little when hit, rather stagger
    if(knightHurtTimer === 30)
        hit = false;
    //Reset timer
    if(knightHurtTimer === 100){
        knight.hurtOnce = true;
        knightHurtTimer = 0;
    }
}

//Player loses health
function knightDamage() {
    if(knight.hurtOnce){
        knight.hurtOnce = false, hit = true;
        health -= livesTaken;

        //make player jump a little when hit
        knight.body.velocity.y  = -knightStaggerJump;
        // move player back when hit inside states
        if (distanceFromBoss > 0) {

            knight.body.velocity.x -= knightStaggerSlide;

        } else if(distanceFromBoss < 0) {

            knight.body.velocity.x += knightStaggerSlide;

        }
        
        if (health <= 5) {
            heart3.kill();
        } if (health <= 4) {
            heart3Half.kill();
        } if (health <= 3) {
            heart2.kill();
        } if (health <= 2) {
            heart2Half.kill();
        } if (health <= 1) {
            heart1.kill();
        } if (health <= 0) {
            heart1Half.kill();
            knight.kill();
            gameOver();
        }
    }
}

//--------------  VICTORY/GAME OVER ------------//

//Only functioning buttons should be the victory/game over buttons
function disableButtons(){
    exitButton.inputEnabled = false;
    restartButton.inputEnabled = false;
    pauseButton.inputEnabled = false;
}

function victory(){
    game.add.tween(levelMusic).to( { volume: 0}, 100, Phaser.Easing.Linear.None, true);
    
    var victoryMusic = game.add.audio('victoryMusic');
    victoryMusic.play();
    
    disableButtons();
    
    game.world.bringToTop(black);
    game.add.tween(black).to( { alpha: 0.8}, 4000, Phaser.Easing.Linear.None, true);
    
    var victoryText = game.add.image(centerX, centerY-100, 'victoryText');
    victoryText.alpha = 0;
    victoryText.anchor.setTo(0.5, 0.5);
    victoryText.scale.setTo(1.5, 1.5);
    //Fade in victoryText
    game.add.tween(victoryText).to( { alpha: 1}, 5000, Phaser.Easing.Linear.None, true);
    
    //Delay adding the buttons until victoryText fully appears
    var timer = game.time.create(false);
    timer.add(4900, this.addVictoryButtons, this);
    timer.start();
}

function addVictoryButtons(){
    var mainMenuButton = game.add.button(centerX + 250, centerY+150, 'mainMenuButton', startLevelSelect, this);
    mainMenuButton.scale.setTo(1.3, 1.3);
    mainMenuButton.anchor.setTo(0.5, 0.5);

    //Assign next level button to level 2 if at level 1, otherwise to level 3
    var nxtLvlButton = (currentLvl === 1) ? game.add.button(centerX - 250, centerY+150, 'nextLevelButton', startLevel2, this) : game.add.button(centerX - 250, centerY+150, 'nextLevelButton', startLevel3, this);
    //Assign next level button to startscreen (maybe credits later on) if at level 3, else do nothing
    nxtLvlButton = (currentLvl === 3) ? game.add.button(centerX - 250, centerY+150, 'nextLevelButton', startLevel3, this) : nxtLvlButton;
    nxtLvlButton.scale.setTo(1.3, 1.3);
    nxtLvlButton.anchor.setTo(0.5, 0.5);
}

function gameOver(){
    //Fades out levelMusic
    game.add.tween(levelMusic).to( { volume: 0}, 100, Phaser.Easing.Linear.None, true);
    
    var gameOverMusic = game.add.audio('gameOverMusic');
    gameOverMusic.play();
    
    disableButtons();
    
    //To stop knight's functions, which would cause bugs
    teleMode = false, gameIsOver = true;
    
    game.world.bringToTop(black);
    game.add.tween(black).to( { alpha: 0.8}, 4000, Phaser.Easing.Linear.None, true);
    
    var gameOverText = game.add.image(centerX, centerY-100, 'gameOverText')
    gameOverText.alpha = 0;
    gameOverText.anchor.setTo(0.5, 0.5);
    gameOverText.scale.setTo(1.5, 1.5);
    game.add.tween(gameOverText).to( { alpha: 1}, 3500, Phaser.Easing.Linear.None, true);
    
    //Delay adding the buttons until gameOverText fully appears
    var timer = game.time.create(false);
    timer.add(3400, this.addGameOverButtons, this);
    timer.start();
}

function addGameOverButtons(){
    var mainMenuButton = game.add.button(centerX + 250, centerY+150, 'mainMenuButton', startLevelSelect, this);
    mainMenuButton.scale.setTo(1.3, 1.3);
    mainMenuButton.anchor.setTo(0.5, 0.5);

    var tryAgainButton = game.add.button(centerX - 250, centerY+150, 'tryAgainButton', restartLevel, this);
    tryAgainButton.scale.setTo(1.3, 1.3);
    tryAgainButton.anchor.setTo(0.5, 0.5);
}
//------------ END VICTORY/GAME OVER -----------//

function restartLevel(){
    console.log('restart');
//    fadeAll()
//    game.time.events.add(500, function() {
//        game.state.restart(game.state.current);
//    }, this);
    game.state.restart(game.state.current);
}

//----------------- PAUSE ----------------------//

function pauseGame(){
    pauseMenu = game.add.sprite(centerX, centerY, 'pauseMenu');
    pauseMenu.anchor.setTo(0.5, 0.5);
    game.paused = true;
    game.input.onDown.add(unpauseGame, self);    
}

function unpauseGame(event){
    pauseMenu.destroy();
    game.paused = false;
}
        
//------------- END PAUSE ----------------------//