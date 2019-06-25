import * as discord from "discord.js";
import {Tile, Castle, CastleWall2, CastleWall3, Grass, White} from "./tiles";

var maxID: number = 0;

const reactionEmoji = ['0⃣','1⃣','2⃣','3⃣','4⃣','5⃣','6⃣','7⃣','8⃣','9⃣','🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🕒', '🕕', '🕘', '🛑'];

const WHITE = new White();

export class Game {
    id: number;
    players: Array<discord.User> = new Array<discord.User>();
    tiles: Tile[][];
    dragTiles: Tile[] = new Array<Tile>(80);
    turnPlayer: number = 0;
    drag: number = 0;

    static CLIENT: discord.Client;

    constructor() {
        this.id = maxID;
        maxID++;
    }

    /**
     * start the game
     */
    async start() {
        this.players.forEach(p => p.send("The game starts"));

        this.generateTiles();
        await this.updateBoard();
        this.nextTurn();
    }

    /**
     * send the dragged tile to the player who's turn it is and wait for his/her reactions
     */
    async nextTurn(): Promise<void> {
        try {
            let message: discord.Message = <discord.Message>await this.players[this.turnPlayer].send("You dragged " + 
            Game.CLIENT.emojis.find(e => e.name == (this.dragTiles[this.drag].rotatable ? this.dragTiles[this.drag].emojiBase + "_" + this.dragTiles[this.drag].rotation : this.dragTiles[this.drag].emojiBase))
             +"\nColumn");
            
            let filter = (reaction, user) => user.id == this.players[this.turnPlayer].id && reactionEmoji.find(e => reaction.emoji.name == e) != (null || undefined);
            let emojis = new Array<discord.ReactionEmoji>();

            //column
            await message.react("1⃣");
            await message.react("2⃣");
            await message.react("3⃣");
            await message.react("4⃣");
            await message.react("5⃣");
            await message.react("6⃣");
            await message.react("7⃣");
            await message.react("8⃣");
            await message.react("9⃣");
            await message.react("🔟");
            let col1 = message.createReactionCollector(filter, {time: 60000});
            col1.on('collect', r => {emojis.push(<discord.ReactionEmoji>r.emoji); col1.stop()});
            //row
            message = <discord.Message>await this.players[this.turnPlayer].send("Row");
            await message.react("🇦");
            await message.react("🇧");
            await message.react("🇨");
            await message.react("🇩");
            await message.react("🇪");
            await message.react("🇫");
            await message.react("🇬");
            await message.react("🇭");
            await message.react("🇮");
            await message.react("🇯");
            let col2 = message.createReactionCollector(filter, {time: 60000});
            col2.on('collect', r => {emojis.push(<discord.ReactionEmoji>r.emoji); col2.stop()});
            //rotation
            message = <discord.Message>await this.players[this.turnPlayer].send("Rotation");
            await message.react("🕒");
            await message.react("🕕");
            await message.react("🕘");
            await message.react("🛑");
            let col3 = message.createReactionCollector(filter, {time: 60000});
            col3.on('collect', r => {
                if(r.emoji.name == "🛑") {
                    this.parseEmojis(emojis);
                } else {
                    emojis.push(<discord.ReactionEmoji>r.emoji);
                }
            });
        } catch(err) {
            console.error(err);
        }
    }

    /**
     * parse the reaction for setting a tile
     * @param emoji list of reacted emojis
     */
    private async parseEmojis(emoji: Array<discord.ReactionEmoji>) {
        let posX: number = 0;
        let posY: number = 0;
        let rot: number = 0;
        emoji.forEach(e => {
            switch(e.name) {
                case '1⃣':
                    posX = 0;
                    break;
                case '2⃣':
                    posX = 1;
                    break;
                case '3⃣':
                    posX = 2;
                    break;
                case '4⃣':
                    posX = 3;
                    break;
                case '5⃣':
                    posX = 4;
                    break;
                case '6⃣':
                    posX = 5;
                    break;
                case '7⃣':
                    posX = 6;
                    break;
                case '8⃣':
                    posX = 7;
                    break;
                case '9⃣':
                    posX = 8;
                    break;
                case '🔟':
                    posX = 9;
                    break;
                case '🇦':
                    posY = 0;
                    break;
                case '🇧':
                    posY = 1;
                    break;
                case '🇨':
                    posY = 2;
                    break;
                case '🇩':
                    posY = 3;
                    break;
                case '🇪':
                    posY = 4;
                    break;
                case '🇫':
                    posY = 5;
                    break;
                case '🇬':
                    posY = 6;
                    break;
                case '🇭':
                    posY = 7;
                    break;
                case '🇮':
                    posY = 8;
                    break;
                case '🇯':
                    posY = 9;
                    break;
                case '🕒':
                    rot = 90;
                    break;
                case '🕕':
                    rot = 180;
                    break;
                case '🕘':
                    rot = 270;
                    break;
                default:
                    break;
            }
        });

        this.dragTiles[this.drag].positionX = posX;
        this.dragTiles[this.drag].positionY = posY;
        this.dragTiles[this.drag].rotation = rot;
        this.dragTiles[this.drag].owner = this.players[this.turnPlayer];
        let bool = this.placeTile(this.dragTiles[this.drag]);

        await this.updateBoard();

        this.drag++;

        if(this.turnPlayer >= this.players.length-1) {
            this.turnPlayer = 0;
        } else {
            this.turnPlayer++;
        }
        this.nextTurn();
    }

    /**
     * sends and updated version of the board to every player
     */
    private async updateBoard() {
        let rows = 1;
        let msg = ":hash::one::two::three::four::five::six::seven::eight::nine::keycap_ten:\n";

        for(; rows <= 5; rows++) {
            msg += this.sendRow(rows) + "\n";
        }
        for(let p of this.players) {
            await p.send(msg)
            let msg2 = "";

            for(; rows <= 10; rows++) {
                msg2 += this.sendRow(rows) + "\n";
            }
            await p.send(msg2)
        }
    }

    /**
     * generate the tiles which can be dragged
     * init the board
     */
    private generateTiles(): void {
        for(let i = 0; i < this.dragTiles.length; i++) {
            this.dragTiles[i] = this.randomTile();
        }
        this.tiles = new Array<Array<Tile>>(10);
        for(let x = 0;x < 10; x++) {
            this.tiles[x] = Array<Tile>(10);
            for(let y = 0; y <10; y++) {
                this.tiles[x][y] = new White();
            }
        }
    }

    /**
     * Places a new tile onto the board
     * @param tile new tile to add
     * @retuns boolean whether the tile has been places successfully
     */
    placeTile(tile: Tile): boolean {
        let posX = tile.positionX;
        let posY = tile.positionY;
        if(this.tiles[posX][posY] == (undefined || null)) {
            return false;
        }

        //Check if castle fits
        if(tile instanceof Castle) {
            let tTile = posY == 0 ? WHITE : this.tiles[posX][posY-1];
            if(tTile instanceof Grass ||
                (tTile instanceof CastleWall2 && tTile.rotation != 90) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))) return false;
            tTile = posY == 9 ? WHITE : this.tiles[posX][posY+1];
            if(tTile instanceof Grass ||
                (tTile instanceof CastleWall2 && tTile.rotation != 270) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))) return false;
            tTile = posX == 0 ? WHITE : this.tiles[posX-1][posY];
            if(tTile instanceof Grass ||
                (tTile instanceof CastleWall2 && tTile.rotation != 0) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))) return false;
            tTile = posX == 9 ? WHITE : this.tiles[posX+1][posY];
            if(tTile instanceof Grass ||
                (tTile instanceof CastleWall2 && tTile.rotation != 180) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))) return false;
            this.tiles[posX][posY] = tile;
            return true; 
        }

        //Check if grass fits
        if(tile instanceof Grass) {
            let tTile = posY == 0 ? WHITE : this.tiles[posX][posY-1];;
            if(tTile instanceof Castle ||
                (tTile instanceof CastleWall2 && tTile.rotation == 90) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))) return false;
            tTile = posY == 9 ? WHITE : this.tiles[posX][posY+1];
            if(tTile instanceof Castle ||
                (tTile instanceof CastleWall2 && tTile.rotation == 270) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))) return false;
            tTile = posX == 0 ? WHITE : this.tiles[posX-1][posY];
            if(tTile instanceof Castle ||
                (tTile instanceof CastleWall2 && tTile.rotation == 0) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))) return false;
            tTile = posX == 9 ? WHITE : this.tiles[posX+1][posY];
            if(tTile instanceof Castle ||
                (tTile instanceof CastleWall2 && tTile.rotation == 180) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))) return false;
            this.tiles[posX][posY] = tile;
            return true;
        }

        //Check if CastleWall2 fits
        if(tile instanceof CastleWall2) {
            //rotation = 0
            if(tile.rotation == 0) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY-1];;
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))) return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY+1];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))) return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX-1][posY];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))) return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX+1][posY];
                if(tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))) return false;
                this.tiles[posX][posY] = tile;
                return true;
            }

            //rotation = 90
            if(tile.rotation == 90) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY-1];;
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))) return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY+1];
                if(tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))) return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX-1][posY];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))) return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX+1][posY];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))) return false;
                this.tiles[posX][posY] = tile;
                return true;
            }

            //rotation = 180
            if(tile.rotation == 180) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY-1];;
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))) return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY+1];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))) return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX-1][posY];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))) return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX+1][posY];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))) return false;
                this.tiles[posX][posY] = tile;
                return true;
            }

            //rotation = 270
            if(tile.rotation == 270) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY-1];;
                if(tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))) return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY+1];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))) return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX-1][posY];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))) return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX+1][posY];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))) return false;
                this.tiles[posX][posY] = tile;
                return true;
            }
        }

        //Check if CastleWall3 fits
        if(tile instanceof CastleWall2) {
            //rotation = 0
            if(tile.rotation == 0) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY-1];;
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))) return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY+1];
                if(tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))) return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX-1][posY];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))) return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX+1][posY];
                if(tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))) return false;
                this.tiles[posX][posY] = tile;
                return true;
            }

            //rotation = 90
            if(tile.rotation == 90) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY-1];;
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))) return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY+1];
                if(tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))) return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX-1][posY];
                if(tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))) return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX+1][posY];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))) return false;
                this.tiles[posX][posY] = tile;
                return true;
            }

            //rotation = 180
            if(tile.rotation == 180) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY-1];;
                if(tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))) return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY+1];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))) return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX-1][posY];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))) return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX+1][posY];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))) return false;
                this.tiles[posX][posY] = tile;
                return true;
            }

            //rotation = 270
            if(tile.rotation == 270) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY-1];;
                if(tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))) return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY+1];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))) return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX-1][posY];
                if(tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))) return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX+1][posY];
                if(tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))) return false;
                this.tiles[posX][posY] = tile;
                return true;
            }
        }

        return false; 
    }

    
    /**
     * generated a random tile
     * @returns a random generated tile
     */
    private randomTile(): Tile {
        let rand: number = Math.floor(Math.random() * Math.floor(4));
        switch (rand) {
            case 0:
                return new CastleWall2();
            case 1:
                return new CastleWall3();
            case 2:
                return new Castle();
            case 3:
                return new Grass();
            default:
                return undefined;
        }
    }

    /**
     * prepares a row of the board to send as string
     * @param row row to prepare
     * @returns string representing row
     */
    private sendRow(row: number): string {
        let msg: string = "";

        //add row begining
        switch(row) {
            case 0:
                return;
            case 1:
                msg += ":regional_indicator_a:";
                break;
            case 2:
                msg += ":regional_indicator_b:";
                break;
            case 3:
                msg += ":regional_indicator_c:";
                break;
            case 4:
                msg += ":regional_indicator_d:";
                break;
            case 5:
                msg += ":regional_indicator_e:";
                break;
            case 6:
                msg += ":regional_indicator_f:";
                break;
            case 7:
                msg += ":regional_indicator_g:";
                break;
            case 8:
                msg += ":regional_indicator_h:";
                break;
            case 9:
                msg += ":regional_indicator_i:";
                break;
            case 10:
                msg += ":regional_indicator_j:";
                break;
            default:
                return;
        }

        //add tiles of row
        for(let i = 0; i < 10; i++) {
            msg += Game.CLIENT.emojis.find(e => e.name == (this.tiles[i][row-1].rotatable ? this.tiles[i][row-1].emojiBase + "_" + this.tiles[i][row-1].rotation : this.tiles[i][row-1].emojiBase));
        }

        return msg;
    }
}