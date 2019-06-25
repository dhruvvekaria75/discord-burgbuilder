import * as discord from "discord.js";

export abstract class Tile {
    positionX: number;
    positionY: number;
    emojiBase: string;
    rotatable: boolean;
    rotation: number = 0; 
    owner: discord.User;
}

export class CastleWall2 extends Tile {
    emojiBase = "castle_wall2";
    rotatable = true;
}

export class Castle extends Tile {
    emojiBase = "castle";
    rotatable = false;
}

export class CastleWall3 extends Tile {
    emojiBase = "castle_wall3";
    rotatable = true;
}

export class Grass extends Tile {
    emojiBase = "grass";
    rotatable = false;
}

export class White extends Tile {
    emojiBase = "white";
    rotatable = false;
}