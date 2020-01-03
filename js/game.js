var hoverMenu = false;

// sprite indexes constants
const spr_player_paper = 1;
const spr_player_dead = 5;
const spr_floor = 20;
const spr_wall = 13;
const spr_rock = 24;
const spr_paper = 25;
const spr_scissors = 26;
const spr_rock_plus = 27;
const spr_paper_plus = 28;
const spr_heart_first_half = 3;
const spr_warp = 41;
const spr_exit = 23;
const spr_coin = 40;
const spr_dot_effect = 42;
const spr_explosion = 43;
const spr_horiz_bolt = 44;
const spr_vert_bolt = 45;
const spr_scissors_plus = 29;
const spr_rock_anti = 30;
const spr_paper_anti = 31;
const spr_scissors_anti = 32;
const spr_heart_second_half = 4;
const spr_player_rock = 0;
const spr_player_scissors = 2;
const spr_strong_effect = 46;
const spr_weak_effect = 47;
// 8, 16, 24, 32, 40, 48, 56, 64
const spr_grass = 21;
const spr_little_rocks = 22;
const spr_wall_corner_top_left = 8;
const spr_wall_corner_top_right = 9;
const spr_wall_corner_bottom_left = 10;
const spr_wall_horiz = 11;
const spr_wall_vert = 12;
const spr_wall_t_horiz_down = 14;
const spr_wall_t_horiz_up = 15;
const spr_wall_corner_bottom_right = 16;
const spr_wall_t_vert_right = 17;
const spr_wall_t_vert_left = 18;
const spr_wall_cross = 19;

//colors
const color_white = "#fafafa";
const color_purple = "#9569c8";
const color_yellow = "#f9d381";
const color_blue = "#9ad1f9";

function setupCanvas() {
	canvas = document.querySelector("canvas");
	ctx = canvas.getContext("2d");
	
	canvas.width = tileSize*(numTiles+uiWidth);
	canvas.height = tileSize*numTiles;
	canvas.style.width = canvas.width + 'px';
	canvas.style.height = canvas.height + 'px';
	ctx.imageSmoothingEnabled = false;
}

function drawSprite(sprite, x, y) {
	ctx.drawImage(
		spritesheet,
		(sprite % 8) * 16,
		Math.floor(sprite / 8) * 16,
		16,
		16,
		x*tileSize + shakeX,
		y*tileSize + shakeY,
		tileSize,
		tileSize
	);
}

function draw() {
	if(gameState == "running" || gameState == "dead"){
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		screenshake();

		for(let i=0;i<numTiles;i++){
			for(let j=0;j<numTiles;j++){
				getTile(i,j).draw();
			}
		}

		for(let i=0;i<monsters.length;i++){
			monsters[i].draw();
		}
		
		player.draw();

		for(let i=0;i<numTiles;i++){
			for(let j=0;j<numTiles;j++){
				getTile(i,j).draw_effect();
			}
		}

		drawText("Level: " + level, 30, false, 40, color_purple);
		drawText("Score: " + score, 30, false, 70, color_purple);

		let garbed_in = "";
		if (player.isRock){
			garbed_in = "rock";
		} else if (player.isPaper){
			garbed_in = "paper";
		} else if (player.isScissors){
			garbed_in = "scissors";
		} else {
			garbed_in = "nothing";
 		}
		drawText("garbed in: " + garbed_in, 20, false, 100, color_yellow);

	player.spells.forEach((spell, index) => drawSpells(spell, index))
	
	// give them the option to trade life for an extra spell
	drawText("t) trade life for", 20, false, 545, color_blue);
	drawText("   a new spell", 20, false, 560, color_blue);
	drawText("i) for helpful info!", 12, false, 573, color_white);
}


function drawSpells( spell, index ) {
  const spellText = `${index+1}) ${spells[spell].name || "Out of spells"}`;  
  if(hoverMenu)
  {
	if (spells[spell].damage_type)
	{
		drawText(`${spells[spell].name} (${spells[spell].damage_type || ""})`, 15, false, 120+index*40, color_blue);
	} else {
		drawText(`${spells[spell].name}`, 15, false, 120+index*40, color_blue);
	}
	drawText(`${spells[spell].description}`, 15, false, 135+index*40, color_blue);
  }
  else 
  {
    drawText(spellText, 20, false, 120+index*40, color_blue);
  }      
}
}
function tick(){
	for(let k=monsters.length-1;k>=0;k--){
		if(!monsters[k].dead){
			monsters[k].update();
		}else{
			monsters.splice(k, 1);
		}
	}
	player.update();
	if (player.dead){
		addScore(score, false);
		gameState = "dead";
	}
	spawnCounter--;
	if(spawnCounter <=0){
		spawnMonster(level);
		spawnCounter = spawnRate;
		spawnRate--;
	}
}

function showTitle(){
	ctx.fillStyle = 'rgba(75,75,75,.85)';
	ctx.fillRect(0,0,canvas.width,canvas.height);
	gameState = "title";
	drawText("ROW JAM BROUGH", 70, true, canvas.height / 2 - 110, color_white);
	drawText("~a rock,paper,scissors broughlike~", 25, true, canvas.height / 2 - 70, color_white);
	drawText("WASD keys to start", 20, true, canvas.height / 2 - 35, color_yellow);

	drawScores();
}

function showInstructions(){
	ctx.fillStyle = 'rgba(75, 75, 75, .85)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	gameState = "instructions";
	drawText("INFORMATION", 70, true, canvas.height / 2 - 200, color_white);
	drawText("Collecting coins increases your score and", 25, true, canvas.height / 2  - 170, color_purple);
	drawText("allows you to hold more spells!", 25, true, canvas.height / 2 - 150, color_purple);
	drawText("WASD to move", 40, true, canvas.height / 2 - 110, color_blue);
	drawText("Numbers 1-9 to cast spells", 30, true, canvas.height / 2 - 80, color_blue);
	drawText("Space Bar to cycle forms (rock, paper, scissors)", 30, true, canvas.height / 2 - 50, color_blue);
	drawText("Mouse hover over spells for a description", 30, true, canvas.height / 2 - 20, color_blue);

	drawText("Rock beats Scissors.", 45, true, canvas.height / 2 + 50, color_yellow);
	drawText("Scissors beats Paper.", 45, true, canvas.height / 2 + 100, color_yellow);
	drawText("Paper beats Rock.", 45, true, canvas.height / 2 + 150, color_yellow);
	drawText("Press Space to cycle forms", 45, true, canvas.height / 2 + 200, color_yellow);
	drawText("to use this to your advantage!", 45, true, canvas.height / 2 + 250, color_yellow);
}

function returnToGame() {
	gameState = "running";
	draw();
}

function startGame(){
	// this function is used to start the actual game. We set our level to 1 and score to 0
	// we always start the game as rock
	console.log("Starting game.");
	level = 1;
	score = 0;
	numSpells = 1;
	startLevel(startingHp, "rock");
	gameState = "running";
}

function startLevel(playerHp, playerState, playerSpells){
	// this function will be used to start any level
	console.log("Starting level.");
	spawnRate = 15;
	spawnCounter = spawnRate;

	generateLevel();
	
	player = new Player(randomPassableTile());
	console.log("Player placed in level.");
	player.hp = playerHp;
	if (playerState){
		if (playerState == "rock"){
			player.isRock = true;
			player.isPaper = false;
			player.isScissors = false;
			player.sprite = spr_player_rock;
		} else if (playerState == "paper"){
			player.isRock = false;
			player.isPaper = true;
			player.isScissors = false;
			player.sprite = spr_player_paper;
		} else if (playerState == "scissors"){
			player.isRock = false;
			player.isPaper = false;
			player.isScissors = true;
			player.sprite = spr_player_scissors;
		}
	}
	if(playerSpells){
		player.spells = playerSpells;
	}

	randomPassableTile().replace(Exit);
}

function drawText(text, size, centered, textY, color){
	ctx.fillStyle = color;
	ctx.font = size + "px monospace";
	let textX;
	if (centered) {
		textX = (canvas.width - ctx.measureText(text).width) / 2;
	} else {
		textX = canvas.width - uiWidth*tileSize+25;
	}
	ctx.fillText(text, textX, textY);
}

function getScores(){
	if(localStorage["scores"]){
		return JSON.parse(localStorage["scores"]);
	} else {
		return [];
	}
}

function addScore(score, won){
	let scores = getScores();
	let scoreObject = {score: score, run: 1, totalScore: score, active: won};
	let lastScore = scores.pop();

	if (lastScore){
		if(lastScore.active){
			scoreObject.run = lastScore.run + 1;
			scoreObject.totalScore += lastScore.totalScore;
		} else {
			scores.push(lastScore);
		}
	}
	scores.push(scoreObject);
	localStorage["scores"] = JSON.stringify(scores);
}

function drawScores(){
	let scores = getScores();
	if (scores.length){
		drawText(
			rightPad(["RUN", "SCORE", "TOTAL"]),
			18,
			true,
			canvas.height / 2,
			color_white
		);

		let newestScore = scores.pop();
		scores.sort(function(a,b){
			return b.totalScore - a.totalScore;
		});
		scores.unshift(newestScore);

		for(let i=0;i<Math.min(10, scores.length);i++){
			let scoreText = rightPad([scores[i].run, scores[i].score, scores[i].totalScore]);
			drawText(
				scoreText,
				18,
				true,
				canvas.height / 2 + 24 + i*24,
				i == 0 ? color_blue:color_purple
			);
		}
	}
}

function rightPad(textArray){
	let finalText = "";
	textArray.forEach(text => {
		text +="";
		for (let i=text.length;i<10;i++){
			text +=" ";
		}
		finalText += text;
	});
	return finalText;
}

function screenshake(){
	if(shakeAmount){
		shakeAmount--;
	}
	let shakeAngle = Math.random()*Math.PI*2;
	shakeX = Math.round(Math.cos(shakeAngle)*shakeAmount);
	shakeY = Math.round(Math.sin(shakeAngle)*shakeAmount);
}

function initSounds(){
	sounds = {
		hit1: new Audio('sounds/hit1.wav'),
		hit2: new Audio('sounds/hit2.wav'),
		treasure: new Audio('sounds/treasure.wav'),
		newLevel: new Audio('sounds/newLevel.wav'),
		spell: new Audio('sounds/spell.wav'),
	};
}

function playSound(soundName){
	sounds[soundName].currentTime = 0;
	sounds[soundName].play();
}
