class Monster{
    constructor(tile, sprite, hp){
        this.move(tile);
        this.isPlayer = false;
        this.sprite = sprite;
        this.hp = hp;
        this.teleportCounter = 2;
        this.offsetX=0;
        this.offsetY=0;
        this.lastMove = [-1,0];
        this.bonusAttack = 0;
        this.base_bonus = 0;
        this.anti_multiplier = 1;
        this.rebirth = false;
    }

    heal(damage){
        this.hp = Math.min(maxHp, this.hp+damage);
    }

    update(){
        this.teleportCounter --;
        if (this.stunned || this.teleportCounter > 0){
            this.stunned = false;
            return;
        }
        this.doStuff();
    }

    doStuff(){
        let neighbors = this.tile.getAdjacentPassableNeighbors();
        // neighbors = neighbors.filter(t => !t.monster || t.monster.isPlayer);
        if(neighbors.length){
            neighbors.sort((a, b) => a.dist(player.tile) - b.dist(player.tile));
            let newTile = neighbors[0];
            this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
        }
    }

    getDisplayX(){
        return this.tile.x + this.offsetX;
    }

    getDisplayY(){
        return this.tile.y + this.offsetY;
    }

    draw(){
        if(this.teleportCounter > 0){
            drawSprite(spr_warp, this.getDisplayX(), this.getDisplayY());
        } else {
            drawSprite(this.sprite, this.getDisplayX(), this.getDisplayY());
            this.drawHp();
        }

        this.offsetX -= Math.sign(this.offsetX)*(1/8)
        this.offsetY -= Math.sign(this.offsetY)*(1/8)
    }


    drawHp() {
        for(let i=0; i<this.hp; i++){
            if (i%2 == 0){ // draw the first half of the health boop
                drawSprite(
                    spr_heart_first_half,
                    this.getDisplayX() + (i%6)*(2/16),
                    this.getDisplayY() - Math.floor(i/6)*(5/16)
                );
            } else if (i%2 == 1){ // draw the second half of the health boop
                drawSprite(
                    spr_heart_second_half,
                    this.getDisplayX() + (i%6)*(2/16),
                    this.getDisplayY() - Math.floor(i/6)*(5/16)
                );
            }
        }
    }

    tryMove(dx, dy){
        let newTile = this.tile.getNeighbor(dx, dy);
        if(newTile.passable){
            this.lastMove = [dx, dy];
            if(!newTile.monster) {
                this.move(newTile);
            } else {
                // if(this.isPlayer != newTile.monster.isPlayer){ // can move into other monsters
                // console.log("Attack Log:");
                // console.log("This is Player? " + this.isPlayer.toString());
                // console.log("This Antimultiplier: " + this.anti_multiplier.toString());
                // console.log("Other is Player? " + newTile.monster.isPlayer.toString());
                // console.log("Other Antimultiplier: " + newTile.monster.anti_multiplier.toString());
                this.attackedThisTurn = true;
                newTile.monster.stunned = true; // monster attacks will stun each other, can remove this if needed
                if((this.isPaper && newTile.monster.isRock) ||
                    (this.isRock && newTile.monster.isScissors) ||
                    (this.isScissors && newTile.monster.isPaper)){
                    this.bonusAttack = (1 + this.base_bonus) * newTile.monster.anti_multiplier;
                } else if((this.isPaper && newTile.monster.isScissors) ||
                    (this.isScissors && newTile.monster.isRock) ||
                    (this.isRock && newTile.monster.isPaper)){
                    this.bonusAttack = -(1 + this.base_bonus) * newTile.monster.anti_multiplier;
                }
                // console.log("BonusAttack: " + this.bonusAttack);
                newTile.monster.hit(this.base_damage + this.bonusAttack);
                if (this.bonusAttack > 0) {
                    newTile.setEffect(spr_strong_effect);
                } else if (this.bonusAttack < 0) {
                    newTile.setEffect(spr_weak_effect);
                }
                this.bonusAttack = 0;

                shakeAmount = 5;
                
                this.offsetX = (newTile.x - this.tile.x)/2;
                this.offsetY = (newTile.y - this.tile.y)/2;
                // }
            }
            return true;
        }
    }

    hit(damage){
        if(this.shield>0){
            return;
        }
        this.hp -= damage;
        if(this.hp <= 0){
            this.die();
        }

        if(this.isPlayer){
            playSound("hit1");
        }else{
            playSound("hit2");
        }
    }

    die(){
        this.dead = true;
        this.tile.monster = null;
        this.sprite = spr_player_dead;
        if (this.rebirth){ // possibly add a level restriction here if it gets too hard
            spawnWeakMonster();
        }
    }

    move(tile){
        if(this.tile){
            this.tile.monster = null;
            this.offsetX = this.tile.x - tile.x;
            this.offsetY = this.tile.y - tile.y;
        }
        this.tile = tile;
        tile.monster = this;
        tile.stepOn(this);
    }
}

class Player extends Monster{
    constructor(tile){
        super(tile, spr_player_rock, 3);
        this.isPlayer = true;
        this.teleportCounter = 0;
        // this.spells = shuffle(Object.keys(spells)).splice(0, numSpells);
        this.spells = [];
        this.isRock = true;
        this.isPaper = false;
        this.isScissors = false;
        this.base_bonus = 0;
        this.base_damage = 2;
        this.anti_multiplier = 1;
        this.getSpellList()
    }
    update(){
        this.shield--;
    }
    tryMove(dx, dy){
        if(super.tryMove(dx, dy)){
            tick();
        }
    }
    addSpell(){
        // this will let us upgrade our spells
        let max_spell_level = 2;
        if (level >= 3){
            max_spell_level = 2;
        } else if (level >= 6){
            max_spell_level = 3;
        }

        var new_spell_list = {};
        
        for (var key of Object.keys(spells)) {
            if (spells[key].rarity <= max_spell_level) {
                new_spell_list[key] = spells[key];
            }
        }

        let newSpell = shuffle(Object.keys(new_spell_list))[0];
        this.spells.push(newSpell);
    }
    
    castSpell(index){
        let spellName = this.spells[index];
        if(spellName){
            delete this.spells[index];
            spells[spellName].funct();
            playSound("spell");
            tick();
        }
    }
    cycle(){
        if (this.isRock){
            this.isRock = false;
            this.isPaper = true;
            this.isScissors = false;
            this.sprite = spr_player_paper;
        } else if (this.isPaper){
            this.isRock = false;
            this.isPaper = false;
            this.isScissors = true;
            this.sprite = spr_player_scissors;
        } else { // isScissors
            this.isRock = true;
            this.isPaper = false;
            this.isScissors = false;
            this.sprite = spr_player_rock;
        }
        tick(); // cycling takes a turn
    }
    
    exchange(){      
      if(this.hp > 3){
          numSpells++;
          this.addSpell();
          this.hp -= 3;
      }
    //     this.spells[this.spells.length] = shuffle(Object.keys(spells)).splice(0, numSpells);
    //     this.hp-= 3;
    //   }else if(this.hp == 2 && this.spells[0] == undefined){
    //     this.spells[0] = shuffle(Object.keys(spells)).splice(0, numSpells);
    //     this.hp--;
    //   } 
      else {
        alert("you don't have enough life")
      }
    }

    getSpellList(){
        var i;
        for (i = 0; i < numSpells; i++) {
            this.addSpell();
        }
    }
}

class Rock extends Monster{
    constructor(tile){
        super(tile, spr_rock, 4);
        this.isRock = true;
        this.base_damage = 2;
        this.name = "Rock";
    }
    update(){ // rocks move slower
        let startedStunned = this.stunned;
        super.update();
        if(!startedStunned){
            this.stunned = true;
        }
    }
}

class Paper extends Monster{
    constructor(tile){
        super(tile, spr_paper, 3);
        this.isPaper = true;
        this.base_damage = 2;
        this.name = "Paper";
    }
}

class Scissors extends Monster{
    constructor(tile){
        super(tile, spr_scissors, 2);
        this.isScissors = true;
        this.base_damage = 2;
        this.name = "Scissors";
    }
    doStuff(){ // scissors move faster
        this.attackedThisTurn = false;
        super.doStuff();

        if(!this.attackedThisTurn){
            super.doStuff();
        }
    }
}

class Rock_Plus extends Monster{
    constructor(tile){
        super(tile, spr_rock_plus, 8);
        this.isRock = true;
        this.base_bonus = 1;
        this.base_damage = 4;
    }
    update(){ // rocks move slower
        let startedStunned = this.stunned;
        super.update();
        if(!startedStunned){
            this.stunned = true;
        }
    }
}

class Paper_Plus extends Monster{
    constructor(tile){
        super(tile, spr_paper_plus, 6);
        this.isPaper = true;
        this.base_bonus = 1;
        this.base_damage = 4;
    }
}

class Scissors_Plus extends Monster{
    constructor(tile){
        super(tile, spr_scissors_plus, 4);
        this.isScissors = true;
        this.base_bonus = 1;
        this.base_damage = 4;
    }
    doStuff(){ // scissors move faster
        this.attackedThisTurn = false;
        super.doStuff();

        if(!this.attackedThisTurn){
            super.doStuff();
        }
    }
}

class Rock_Anti extends Monster{
    constructor(tile){
        super(tile, spr_rock_anti, 4);
        this.isRock = true;
        this.base_damage = 2;
        this.anti_multiplier = -1;
        this.rebirth = true;
    }
    update(){ // rocks move slower
        let startedStunned = this.stunned;
        super.update();
        if(!startedStunned){
            this.stunned = true;
        }
    }
}

class Paper_Anti extends Monster{
    constructor(tile){
        super(tile, spr_paper_anti, 3);
        this.isPaper = true;
        this.base_damage = 2;
        this.anti_multiplier = -1;
        this.rebirth = true;
    }
}

class Scissors_Anti extends Monster{
    constructor(tile){
        super(tile, spr_scissors_anti, 2);
        this.isScissors = true;
        this.base_damage = 2;
        this.anti_multiplier = -1;
        this.rebirth = true;
    }
    doStuff(){ // scissors move faster
        this.attackedThisTurn = false;
        super.doStuff();

        if(!this.attackedThisTurn){
            super.doStuff();
        }
    }
}
