import * as discord from "discord.js";

export class Game {
    players: discord.User;
    tiles = Tile[10][10];
}

export class Tile {
    positionX: number;
    positionY: number;
    picture: string;
    emoji: string;
}

export class CastleWall2 extends Tile {
    picture = "castle_wall2.png";
    emoji = "1234";
}

export class CastleCenter extends Tile {
    picture = "castle_center.png";
    emoji = "2345";
}

export class CastleWall3 extends Tile {
    picture = "castl_wall3.png";
    emoji = "43245";
}