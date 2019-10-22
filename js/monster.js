class Monster{
    constructor(tile, sprite, hp){
        this.move(tile);
        this.sprite = sprite;
        this.hp = hp;
        this.teleportCounter = 2;
        this.offsetX=0;
        this.offsetY=0;
        this.lastMove = [-1,0];
        this.bonusAttack = 0;
        this.base_bonus = 0;
        this.anti_multiplier = 1;
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
            drawSprite(10, this.getDisplayX(), this.getDisplayY());
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
                    9,
                    this.getDisplayX() + (i%6)*(2/16),
                    this.getDisplayY() - Math.floor(i/6)*(5/16)
                );
            } else if (i%2 == 1){ // draw the second half of the health boop
                drawSprite(
                    21,
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
                    this.attackedThisTurn = true;
                    newTile.monster.stunned = true; // monster attacks will stun each other, can remove this if needed
                    if((this.isPaper && newTile.monster.isRock) ||
                        (this.isRock && newTile.monster.isScissors) ||
                        (this.isScissors && newTile.monster.isPaper)){
                        this.bonusAttack = (1 + this.base_bonus) * this.anti_multiplier;
                    } else if((this.isPaper && newTile.monster.isScissors) ||
                        (this.isScissors && newTile.monster.isRock) ||
                        (this.isRock && newTile.monster.isPaper)){
                        this.bonusAttack = -(1 + this.base_bonus) * this.anti_multiplier;
                    }
                    newTile.monster.hit(this.base_damage + this.bonusAttack);
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
        this.sprite = 1;
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
        super(tile, 0, 3);
        this.isPlayer = true;
        this.teleportCounter = 0;
        this.spells = shuffle(Object.keys(spells)).splice(0, numSpells);
        this.isRock = true;
        this.isPaper = false;
        this.isScissors = false;
        this.base_bonus = 0;
        this.base_damage = 2;
        this.anti_multiplier = 1;
        // this.weapon = shuffle(Object.keys(weapons)).splice(0, 1);
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
        let newSpell = shuffle(Object.keys(spells))[0];
        this.spells.push(newSpell);
    }
    castSpell(index){
        let spellName = this.spells[index];
        if(spellName){
            delete this.spells[index];
            spells[spellName]();
            playSound("spell");
            tick();
        }
    }
}

class Rock extends Monster{
    constructor(tile){
        super(tile, 4, 4);
        this.isRock = true;
        this.base_damage = 2;
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
        super(tile, 5, 3);
        this.isPaper = true;
        this.base_damage = 2;
    }
}

class Scissors extends Monster{
    constructor(tile){
        super(tile, 6, 2);
        this.isScissors = true;
        this.base_damage = 2;
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
        super(tile, 7, 8);
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
        super(tile, 8, 6);
        this.isPaper = true;
        this.base_bonus = 1;
        this.base_damage = 4;
    }
}

class Scissors_Plus extends Monster{
    constructor(tile){
        super(tile, 17, 4);
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
        super(tile, 18, 4);
        this.isRock = true;
        this.base_damage = 2;
        this.anti_multiplier = -1;
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
        super(tile, 19, 3);
        this.isPaper = true;
        this.base_damage = 2;
        this.anti_multiplier = -1;
    }
}

class Scissors_Anti extends Monster{
    constructor(tile){
        super(tile, 20, 2);
        this.isScissors = true;
        this.base_damage = 2;
        this.anti_multiplier = -1;
    }
    doStuff(){ // scissors move faster
        this.attackedThisTurn = false;
        super.doStuff();

        if(!this.attackedThisTurn){
            super.doStuff();
        }
    }
}