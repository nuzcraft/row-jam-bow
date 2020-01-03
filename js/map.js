let monster_normal = [Rock, Paper, Scissors];
let monster_plus = [Rock_Plus, Paper_Plus, Scissors_Plus];
let monster_anti = [Rock_Anti, Paper_Anti, Scissors_Anti];


function generateLevel(){
    // this function will generate a level by creating a map, adding monsters, and adding treasure.
    tryTo('generate map', function() {
        // this function will run generateTiles multiple times until it finds that all floor spaces are 
        // connected. Only then will it continue.
        return generateTiles() == randomPassableTile().getConnectedTiles().length;
    });
    console.log("Map successfully generated for level " + level + ".");

    // generate monsters for the level
    generateMonsters();

    // generate 3 treasures for the level
    for(let i=0;i<3;i++){
        randomPassableTile().treasure = true;
        console.log("Treasure #" + (i+1) + " generated.");
    }
}

function getWallTileSprite(x, y){
    // this function is supposed to return what sprite the wall should be using
    var wall_to_north = false;
    var wall_to_south = false;
    var wall_to_east = false;
    var wall_to_west = false;
    if (inWallBounds(x + 1, y) && !inBounds(x + 1, y)){ //east is in the border
        wall_to_east = true;
    }
    if (inWallBounds(x - 1, y) && !inBounds(x - 1, y)){ //west is in the border
        wall_to_west = true;
    }
    if (inWallBounds(x, y + 1) && !inBounds(x, y + 1)){ //south is in the border
        wall_to_south = true;
    }
    if (inWallBounds(x, y - 1) && !inBounds(x, y - 1)){ //north is in the border
        wall_to_north = true;
    }

    if (inBounds(x + 1, y) && !tiles[x + 1][y].passable) { // east is a wall
        wall_to_east = true;
    }
    if (inBounds(x - 1, y) && !tiles[x - 1][y].passable) { // west is a wall
        wall_to_west = true;
    }
    if (inBounds(x, y + 1) && !tiles[x][y + 1].passable) { // south is a wall
        wall_to_south = true;
    }
    if (inBounds(x, y - 1) && !tiles[x][y - 1].passable) { // north is a wall
        wall_to_north = true;
    }


    // start returning the right sprites
    // start with corners
    if (wall_to_north && wall_to_east && !wall_to_south && !wall_to_west){
        return spr_wall_corner_bottom_left
    }
    if (wall_to_north && !wall_to_east && !wall_to_south && wall_to_west){
        return spr_wall_corner_bottom_right
    }
    if (!wall_to_north && wall_to_east && wall_to_south && !wall_to_west){
        return spr_wall_corner_top_left
    }
    if (!wall_to_north && !wall_to_east && wall_to_south && wall_to_west){
        return spr_wall_corner_top_right
    }
    // now ts
    if (wall_to_north && !wall_to_east && wall_to_south && wall_to_west){
        return spr_wall_t_vert_left
    }
    if (wall_to_north && wall_to_east && wall_to_south && !wall_to_west){
        return spr_wall_t_vert_right
    }
    if (!wall_to_north && wall_to_east && wall_to_south && wall_to_west){
        return spr_wall_t_horiz_down
    }
    if (wall_to_north && wall_to_east && !wall_to_south && wall_to_west){
        return spr_wall_t_horiz_up
    }
    // now verts and horiz
    if (!wall_to_north && !wall_to_south){
        if (wall_to_west || wall_to_east){
            return spr_wall_horiz
        }
    }
    if (!wall_to_east && !wall_to_west){
        if (wall_to_north || wall_to_south){
            return spr_wall_vert
        }
    }
    // cross
    if (wall_to_north && wall_to_south && wall_to_east && wall_to_west){
        return spr_wall_cross
    }
    
    // last option is the normal wall
    return spr_wall
}

function generateTiles(){
    // this function will generate a tiles for the map. The entire border is wall
    // and ~30% of the map should be wall (besides the outer wall)
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

    for(let i=0;i<numTiles;i++){
        for(let j=0;j<numTiles;j++){
            if (!tiles[i][j].passable){
                tiles[i][j].sprite = getWallTileSprite(i,j);
            }
        }
    }

    return passableTiles;
}

function inBounds(x, y){
    // this will return true if inside the border
    return x>0 && y>0 && x<numTiles-1 && y<numTiles-1
}

function inWallBounds(x, y){
    // this will return true if on the border or inside the border
    return x>=0 && y>=0 && x<=numTiles-1 && y<=numTiles-1
}

function getTile(x, y){
    if(inBounds(x, y)){
        return tiles[x][y];
    }else{
        var wall = new Wall(x, y);
        wall.sprite = getWallTileSprite(x, y);
        return wall;
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
    // this is used to generate monsters for the level
    monsters = [];
    const numMonsters = level < 5 ? level+1 : 6;
    console.log(numMonsters + " monsters will be generated.")
    for(let i=0;i<numMonsters;i++){
        spawnMonster(level);
    }
}

function spawnMonster(level){
    // this will choose a monster type ans spawn it into a floor tile
    // let monsterType = shuffle([Goose, Ant, Mushroom, Eater, Toast])[0];
    let monsterType = shuffle(chooseMonsterType(level))[0];
    let monster = new monsterType(randomPassableTile());
    monsters.push(monster);
    console.log(monster.name + " was spawned.")
}

function chooseMonsterType(level){  

  if(level < 4){    
    return shuffleMonsters(monster_normal);
    // DEBUG
    // return shuffleMonsters(monster_anti);
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

