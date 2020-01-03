class Tile{
	constructor(x, y, sprite, passable){
		this.x = x;
		this.y = y;
		this.sprite = sprite;
		this.passable = passable;
	}

	replace(newTileType){
		tiles[this.x][this.y] = new newTileType(this.x, this.y);
		return tiles[this.x][this.y];
	}

	// manhattan distance
	dist(other){
		return Math.abs(this.x-other.x) + Math.abs(this.y - other.y);
	}

	getNeighbor(dx, dy){
		return getTile(this.x + dx, this.y + dy)
	}

	getAdjacentNeighbors(){
		return shuffle([
			this.getNeighbor(0, -1),
			this.getNeighbor(0, 1),
			this.getNeighbor(-1, 0),
			this.getNeighbor(1, 0)
		]);
	}

	getAdjacentPassableNeighbors(){
		return this.getAdjacentNeighbors().filter(t => t.passable);
	}

	getConnectedTiles(){
		let connectedTiles = [this];
		let frontier = [this];
		while(frontier.length){
			let neighbors = frontier.pop()
								.getAdjacentPassableNeighbors()
								.filter(t => !connectedTiles.includes(t));
			connectedTiles = connectedTiles.concat(neighbors);
			frontier = frontier.concat(neighbors);
		}
		return connectedTiles;
	}
	
	draw(){
		drawSprite(this.sprite, this.x, this.y);
		if (this.treasure){
			drawSprite(spr_coin, this.x, this.y);
		}
	}

	draw_effect() {
		if(this.effectCounter){
			this.effectCounter--;
			ctx.globalAlpha = this.effectCounter/30;
			drawSprite(this.effect, this.x, this.y);
			ctx.globalAlpha = 1;
		}
	}

	setEffect(effectSprite){
		this.effect = effectSprite;
		this.effectCounter = 30;
	}
}

class Floor extends Tile {
	constructor(x, y){
		// grab a number between 0 and 9
		var random_num = Math.floor(Math.random() * 15);
		var sprite = spr_floor;
		if (random_num == 0) {
			// 7.5% chance for grass
			sprite = spr_grass;
		} else if (random_num == 1) {
			// 7.5% chance for little rocks
			sprite = spr_little_rocks;
		}
		super(x, y, sprite, true);
	};
	stepOn(monster){
		if(monster.isPlayer && this.treasure){
			score++;
			if(score % 3 == 0 && numSpells<9){
				numSpells++;
				player.addSpell();
			}
			playSound("treasure");
			this.treasure = false;
			spawnMonster(level);
		}
	}
}

class Wall extends Tile{
	constructor(x, y){
		super(x, y, spr_wall, false);
	}
}

class Exit extends Tile{
	constructor(x, y){
		super(x, y, spr_exit, true);
	}

	stepOn(monster){
		if(monster.isPlayer){
			playSound("newLevel");
			if(level == numLevels){
				addScore(score, true);
				showTitle();
			} else {
				level++;
				let garbed_in = "";
				if (player.isRock){
					garbed_in = "rock";
				} else if (player.isPaper){
					garbed_in = "paper";
				} else if (player.isScissors){
					garbed_in = "scissors";
				}
				startLevel(Math.min(maxHp, player.hp+1), garbed_in);
			}
		}
	}
}