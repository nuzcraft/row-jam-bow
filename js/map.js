let monster_normal = [Rock, Paper, Scissors];
let monster_plus = [Rock_Plus, Paper_Plus, Scissors_Plus];
let monster_anti = [Rock_Anti, Paper_Anti, Scissors_Anti];


function generateLevel(){
    tryTo('generate map', function() {
        return generateTiles() == randomPassableTile().getConnectedTiles().length;
    });

    generateMonsters();

    for(let i=0;i<3;i++){
        randomPassableTile().treasure = true;
    }
}

function generateTiles(){
    let passableTiles = 0;
    tiles = [];
    for(let i=0;i<numTiles;i++){
        tiles[i]=[];
        for(let j=0;j<numTiles;j++){
            if(Math.random()<0.3 || !inBounds(i, j)){
                tiles[i][j] = new Wall(i, j);
            }else{
                tiles[i][j] = new Floor(i, j);
                passableTiles++;
            }
        }
    }
    return passableTiles;
}

function inBounds(x, y){
    return x>0 && y>0 && x<numTiles-1 && y<numTiles-1
}

function getTile(x, y){
    if(inBounds(x, y)){
        return tiles[x][y];
    }else{
        return new Wall(x, y);
    }
}

function randomPassableTile(){
    let tile;
    tryTo('get random passable tile', function(){
        let x = randomRange(0, numTiles - 1);
        let y = randomRange(0, numTiles - 1);
        tile = getTile(x, y);
        return tile.passable && !tile.monster;
    });
    return tile;
}

function generateMonsters(){
    monsters = [];
    const numMonsters = level > 5 ? level+1 : 6;
    for(let i=0;i<numMonsters;i++){
        spawnMonster(level);
    }
}

function spawnMonster(level){
    // let monsterType = shuffle([Goose, Ant, Mushroom, Eater, Toast])[0];
    let monsterType = shuffle(chooseMonsterType(level))[0];
    let monster = new monsterType(randomPassableTile());
    monsters.push(monster);
}

function chooseMonsterType(level){  

  if(level < 4){    
    return shuffleMonsters(monster_normal);
  }
  else if(level < 7){
    return[shuffleMonsters(monster_normal)[0],...shuffleMonsters(monster_anti)]
  } else{
    return[shuffleMonsters(monster_normal)[0],shuffleMonsters(monster_anti)[0],...shuffleMonsters(monster_plus)]
  }
}


function shuffleMonsters(monsterArray){
  return shuffle(monsterArray)
}

function spawnWeakMonster(){  
  const monsterTypes = [Rock, Paper, Scissors];
  const monsterType = randomMonsterType( monsterTypes );
  const monster = new monsterType(randomPassableTile());
  monsters.push(monster);
}

function randomMonsterType(monsterTypes) {
  return shuffle(monsterTypes)[0]
}

