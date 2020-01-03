spells = {
    TELEPORT: {
        funct: function() {
            player.move(randomPassableTile());
        },
        description: "warp to random tile",
        name: "TELEPORT",
        rarity: 1
    },
    QUAKE: {
        funct: function() {
            for(let i=0; i<numTiles; i++){
                for(let j=0; j<numTiles; j++){
                    let tile = getTile(i,j);
                    if(tile.monster){
                        bonusAttack = 0;
                        if (tile.monster.isScissors){
                            bonusAttack = 1;
                            tile.setEffect(spr_strong_effect);
                        } else if (tile.monster.isPaper){
                            bonusAttack = -1;
                            tile.setEffect(spr_weak_effect);
                        }
                        let numWalls = 4 - tile.getAdjacentPassableNeighbors().length;
                        tile.monster.hit(numWalls*2 + bonusAttack);
                    }
                }
            }
            shakeAmount = 20;
        },
        description: "damages if next to a wall",
        damage_type: "rock",
        name: "QUAKE",
        rarity: 2
    },
    MAELSTROM: {
        funct: function() {
            for(let i=0; i<monsters.length;i++){
                monsters[i].move(randomPassableTile());
                monsters[i].teleportCounter = 2;
            }
        }, 
        description: "warp enemies to random tiles",
        name: "MAELSTROM",
        rarity: 2
    },
    MULLIGAN: {
        funct: function() {
            startLevel(1, player.spells);
        },
        description: "start over, keep spells",
        name: "MULLIGAN",
        rarity: 2
    },
    AURA: {
        funct: function() {
            player.tile.getAdjacentNeighbors().forEach(function(t){
                t.setEffect(spr_dot_effect);
                if(t.monster){
                    t.monster.heal(1);
                }
            });
            player.tile.setEffect(13);
            player.heal(1);
        }, 
        description: "heal immediate area",
        name: "HEALING AURA",
        rarity: 1
    },
    DASH: {
        funct: function(){
            let newTile = player.tile;
            while(true){
                let testTile = newTile.getNeighbor(player.lastMove[0], player.lastMove[1]);
                if(testTile.passable && !testTile.monster){
                    newTile = testTile;
                }else{
                    break;
                }
            }
            if(player.tile != newTile){
                player.move(newTile);
                newTile.getAdjacentNeighbors().forEach(t => {
                    t.setEffect(spr_explosion); // base effect
                    if(t.monster){
                        // check to see if the monster is rock or scissors
                        var bonusAttack = 0;
                        if (t.monster.isRock){
                            bonusAttack = 1;
                            t.setEffect(spr_strong_effect);
                        } else if (t.monster.isScissors){
                            bonusAttack = -1;
                            t.setEffect(spr_weak_effect);
                        }
                        t.monster.stunned = true;
                        t.monster.hit(1 + bonusAttack);
                    }
                })
                shakeAmount = 5;
            }
        }, 
        description: "sonic speed smack",
        damage_type: "paper",
        name: "DASH",
        rarity: 1
    },
    DIG: {
        funct: function(){
            for(let i=1;i<numTiles-1;i++){
                for(let j=1;j<numTiles-1;j++){
                    let tile = getTile(i,j);
                    if (!tile.passable){
                        tile.replace(Floor);
                    }
                }
            }
            player.tile.setEffect(13);
            player.heal(2);
        },
        description: "remove all walls and heal",
        name: "DIG",
        rarity: 2
    },
    KINGMAKER: {
        funct: function(){
            for(let i=0;i<monsters.length;i++){
                monsters[i].heal(1);
                monsters[i].tile.treasure = true;
            }
        },
        description: "heal monsters, get treasure",
        name: "KINGMAKER",
        rarity: 2
    },
    ALCHEMY: {
        funct: function(){
            player.tile.getAdjacentNeighbors().forEach(function(t){
                if(!t.passable && inBounds(t.x, t.y)){
                    t.replace(Floor).treasure = true;
                }
            });
        }, 
        description: "change walls to treasure",
        name: "ALCHEMY",
        rarity: 2
    },
    POWER: {
        funct: function(){
            player.bonusAttack = 5;
        },
        description: "next attack is powerful",
        name: "POWER",
        rarity: 1
    },
    BUBBLE: {
        funct: function(){
            for(let i=player.spells.length - 1; i>0;i--){
                if(!player.spells[i]){
                    player.spells[i] = player.spells[i-1];
                }
            }
        },
        description: "copy spells into empty slots",
        name: "BUBBLE",
        rarity: 3
    },
    BRAVERY: {
        funct: function(){
            player.shield = 3;
            for(let i=0;i<monsters.length;i++){
                monsters[i].stunned = true;
            }
        },
        description: "two turn shield",
        name: "BRAVERY",
        rarity: 1
    },
    SCISSOR_SHOT: {
        funct: function(){
            var sprite = spr_horiz_bolt;
            if (Math.abs(player.lastMove[1] == 1)){
               var sprite = spr_vert_bolt; 
            }
            boltTravel(player.lastMove, sprite, 4, "scissors");
            // boltTravel(player.lastMove, 15 + Math.abs(player.lastMove[1]), 4, "scissors");
            // boltTravel(player.lastMove, spr_scissors_anti, 4, "scissors");
        },
        description: "shoot scissors",
        damage_type: "scissors",
        name: "SCISSOR SHOT",
        rarity: 2
    },
    ROCK_THROW: {
        funct: function(){
            let directions = [
                [0, -1],
                [0, 1],
                [-1, 0],
                [1, 0]
            ];
            for(let k=0;k<directions.length;k++){
                // boltTravel(directions[k], 15+Math.abs(directions[k][1]), 2, rock);
                boltTravel(directions[k], spr_rock_anti, 2, "rock");
            }
        },
        description: "throw rocks horiz and vert",
        damage_type: "rock",
        name: "ROCK THROW",
        rarity: 3
    },
    ORIGAMI_BLOOM: {
        funct: function(){
            let directions = [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ];
            for (let k=0; k<directions.length;k++){
                boltTravel(directions[k], spr_paper, 3, "paper");
            }
        },
        description: "blast paper diagonally",
        damage_type: "paper",
        name: "ORIGAMI BLOOM",
        rarity: 3
    }
};

function boltTravel(direction, effect, damage, damage_type){
    let newTile = player.tile;
    while (true){
        let testTile = newTile.getNeighbor(direction[0], direction[1]);
        if(testTile.passable){
            newTile = testTile;
            if (newTile.monster){
                bonusAttack = 0;
                if (newTile.monster.isScissors){
                    bonusAttack = 1;
                    newTile.setEffect(spr_strong_effect);
                } else if (newTile.monster.isPaper){
                    bonusAttack = -1;
                    newTile.setEffect(spr_weak_effect);
                }
                newTile.monster.hit(damage);
            }
            newTile.setEffect(effect);
        } else {
            break;
        }
    }
}