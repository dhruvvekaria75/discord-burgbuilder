import * as discord from 'discord.js';
import { Tile, Castle, CastleWall2, CastleWall3, Grass, White } from './tiles';
import { CastleComplex } from './CastleComplex';

const isBeta = process.env.NODE_ENV == 'development' ? true : false;

let NEWID = 0; // id for new game

//all emojis used -> used for filtering
const reactionEmoji = [
    '0⃣',
    '1⃣',
    '2⃣',
    '3⃣',
    '4⃣',
    '5⃣',
    '6⃣',
    '7⃣',
    '8⃣',
    '9⃣',
    '🔟',
    '🇦',
    '🇧',
    '🇨',
    '🇩',
    '🇪',
    '🇫',
    '🇬',
    '🇭',
    '🇮',
    '🇯',
    '🕒',
    '🕕',
    '🕘',
    '🛑',
];

//white tile
const WHITE = new White();
const MAXPLAYER = 4; //max number of players in a game
const TURNS = isBeta ? 5 : 40;

export class Game {
    id: number; //unique id of game
    creator: discord.User; //only for custom games
    players: Array<discord.User> = new Array<discord.User>(); // all players in game
    tiles: Tile[][]; //board as 2D array
    private dragTiles: Tile[] = new Array<Tile>(80); //tiles that get dragged one after the other
    private turnPlayer = 0; //the index of the player whos turn it is
    private drag = 0; //the current index of dragpiles (TODO: replace with dragTiles.pop())

    //for eval
    private castles: Array<CastleComplex> = new Array<CastleComplex>(); //all castles found
    private points: Array<number> = new Array<number>(); //points player get (same index as players)
    private checked: Array<Array<boolean>> = new Array<Array<boolean>>(10);
    static CLIENT: discord.Client;

    constructor(creator?: discord.User) {
        this.id = NEWID;
        NEWID++;

        if (creator) this.creator = creator;
    }

    /**
     * add user to all arrays, so he joins the game
     * starts game when full
     * @param user user to join
     */
    joinPlayer(user: discord.User): boolean {
        if (this.players.length < MAXPLAYER) {
            this.players.push(user);
            this.points.push(0);
            if (this.players.length >= MAXPLAYER) {
                this.start();
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * removes user from all array, so he leaves the game
     * @param user user to leave
     */
    leavePlayer(user: discord.User): void {
        const index: number = this.players.findIndex(p => p == user);
        this.players.splice(index, 1);
        this.points.splice(index, 1);
    }

    /**
     * start the game
     */
    async start(): Promise<void> {
        this.players.forEach(p => p.send('The game starts'));

        this.generateTiles();
        await this.updateBoard();
        this.nextTurn();
    }

    /**
     * send the dragged tile to the player who's turn it is and wait for his/her reactions
     */
    private async nextTurn(): Promise<void> {
        try {
            let message: discord.Message = (await this.players[this.turnPlayer].send(
                'You dragged ' +
                    Game.CLIENT.emojis.find(
                        e =>
                            e.name ==
                            (this.dragTiles[this.drag].rotatable
                                ? this.dragTiles[this.drag].emojiBase + '_' + this.dragTiles[this.drag].rotation
                                : this.dragTiles[this.drag].emojiBase),
                    ) +
                    '\nColumn',
            )) as discord.Message;

            const filter = (reaction, user): boolean =>
                user.id == this.players[this.turnPlayer].id &&
                reactionEmoji.find(e => reaction.emoji.name == e) != (null || undefined);
            const emojis = new Array<discord.ReactionEmoji>();

            //column
            await message.react('1⃣');
            await message.react('2⃣');
            await message.react('3⃣');
            await message.react('4⃣');
            await message.react('5⃣');
            await message.react('6⃣');
            await message.react('7⃣');
            await message.react('8⃣');
            await message.react('9⃣');
            await message.react('🔟');
            const col1 = message.createReactionCollector(filter);
            col1.on('collect', r => {
                emojis.push(r.emoji as discord.ReactionEmoji);
                col1.stop();
            });
            //row
            message = (await this.players[this.turnPlayer].send('Row')) as discord.Message;
            await message.react('🇦');
            await message.react('🇧');
            await message.react('🇨');
            await message.react('🇩');
            await message.react('🇪');
            await message.react('🇫');
            await message.react('🇬');
            await message.react('🇭');
            await message.react('🇮');
            await message.react('🇯');
            const col2 = message.createReactionCollector(filter);
            col2.on('collect', r => {
                emojis.push(r.emoji as discord.ReactionEmoji);
                col2.stop();
            });
            //rotation
            message = (await this.players[this.turnPlayer].send('Rotation')) as discord.Message;
            await message.react('🕒');
            await message.react('🕕');
            await message.react('🕘');
            await message.react('🛑');
            const col3 = message.createReactionCollector(filter);
            col3.on('collect', r => {
                if (r.emoji.name == '🛑') {
                    this.parseEmojis(emojis);
                } else {
                    emojis.push(r.emoji as discord.ReactionEmoji);
                }
            });
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * parse the reaction for setting a tile
     * @param emoji list of reacted emojis
     */
    private async parseEmojis(emoji: Array<discord.ReactionEmoji>): Promise<void> {
        let posX = 0;
        let posY = 0;
        let rot = 0;
        emoji.forEach(e => {
            switch (e.name) {
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
        this.placeTile(this.dragTiles[this.drag]);

        await this.updateBoard();

        this.drag++;

        if (this.turnPlayer >= this.players.length - 1) {
            this.turnPlayer = 0;
        } else {
            this.turnPlayer++;
        }

        if (this.drag < TURNS) {
            this.nextTurn();
        } else {
            this.evaluate();
        }
    }

    /**
     * sends and updated version of the board to every player
     */
    private async updateBoard(): Promise<void> {
        let rows = 1;
        let msg = ':hash::one::two::three::four::five::six::seven::eight::nine::keycap_ten:\n';

        for (; rows <= 5; rows++) {
            msg += this.sendRow(rows) + '\n';
        }

        let msg2 = '';

        for (; rows <= 10; rows++) {
            msg2 += this.sendRow(rows) + '\n';
        }

        for (const p of this.players) {
            await p.send(msg);
            await p.send(msg2);
        }
    }

    /**
     * generate the tiles which can be dragged
     * init the board
     */
    private generateTiles(): void {
        for (let i = 0; i < this.dragTiles.length; i++) {
            this.dragTiles[i] = this.randomTile();
        }
        this.tiles = new Array<Array<Tile>>(10);
        for (let x = 0; x < 10; x++) {
            this.tiles[x] = Array<Tile>(10);
            for (let y = 0; y < 10; y++) {
                this.tiles[x][y] = new White();
            }
        }
    }

    /**
     * Places a new tile onto the board
     * @param tile new tile to add
     * @retuns boolean whether the tile has been places successfully
     */
    private placeTile(tile: Tile): boolean {
        const posX = tile.positionX;
        const posY = tile.positionY;
        if (this.tiles[posX][posY] == (undefined || null)) {
            return false;
        }

        //Check if castle fits
        if (tile instanceof Castle) {
            let tTile = posY == 0 ? WHITE : this.tiles[posX][posY - 1];
            if (
                tTile instanceof Grass ||
                (tTile instanceof CastleWall2 && tTile.rotation != 90) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))
            )
                return false;
            tTile = posY == 9 ? WHITE : this.tiles[posX][posY + 1];
            if (
                tTile instanceof Grass ||
                (tTile instanceof CastleWall2 && tTile.rotation != 270) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))
            )
                return false;
            tTile = posX == 0 ? WHITE : this.tiles[posX - 1][posY];
            if (
                tTile instanceof Grass ||
                (tTile instanceof CastleWall2 && tTile.rotation != 0) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))
            )
                return false;
            tTile = posX == 9 ? WHITE : this.tiles[posX + 1][posY];
            if (
                tTile instanceof Grass ||
                (tTile instanceof CastleWall2 && tTile.rotation != 180) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))
            )
                return false;
            this.tiles[posX][posY] = tile;
            return true;
        }

        //Check if grass fits
        if (tile instanceof Grass) {
            let tTile = posY == 0 ? WHITE : this.tiles[posX][posY - 1];
            if (
                tTile instanceof Castle ||
                (tTile instanceof CastleWall2 && tTile.rotation == 90) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))
            )
                return false;
            tTile = posY == 9 ? WHITE : this.tiles[posX][posY + 1];
            if (
                tTile instanceof Castle ||
                (tTile instanceof CastleWall2 && tTile.rotation == 270) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))
            )
                return false;
            tTile = posX == 0 ? WHITE : this.tiles[posX - 1][posY];
            if (
                tTile instanceof Castle ||
                (tTile instanceof CastleWall2 && tTile.rotation == 0) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))
            )
                return false;
            tTile = posX == 9 ? WHITE : this.tiles[posX + 1][posY];
            if (
                tTile instanceof Castle ||
                (tTile instanceof CastleWall2 && tTile.rotation == 180) ||
                (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))
            )
                return false;
            this.tiles[posX][posY] = tile;
            return true;
        }

        //Check if CastleWall2 fits
        if (tile instanceof CastleWall2) {
            //rotation = 0
            if (tile.rotation == 0) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY - 1];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))
                )
                    return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY + 1];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))
                )
                    return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX - 1][posY];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))
                )
                    return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX + 1][posY];
                if (
                    tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))
                )
                    return false;
                this.tiles[posX][posY] = tile;
                return true;
            }

            //rotation = 90
            if (tile.rotation == 90) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY - 1];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))
                )
                    return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY + 1];
                if (
                    tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))
                )
                    return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX - 1][posY];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))
                )
                    return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX + 1][posY];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))
                )
                    return false;
                this.tiles[posX][posY] = tile;
                return true;
            }

            //rotation = 180
            if (tile.rotation == 180) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY - 1];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))
                )
                    return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY + 1];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))
                )
                    return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX - 1][posY];
                if (
                    tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))
                )
                    return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX + 1][posY];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))
                )
                    return false;
                this.tiles[posX][posY] = tile;
                return true;
            }

            //rotation = 270
            if (tile.rotation == 270) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY - 1];
                if (
                    tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))
                )
                    return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY + 1];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))
                )
                    return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX - 1][posY];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))
                )
                    return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX + 1][posY];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))
                )
                    return false;
                this.tiles[posX][posY] = tile;
                return true;
            }
        }

        //Check if CastleWall3 fits
        if (tile instanceof CastleWall3) {
            //rotation = 0
            if (tile.rotation == 0) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY - 1];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))
                )
                    return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY + 1];
                if (
                    tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))
                )
                    return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX - 1][posY];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))
                )
                    return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX + 1][posY];
                if (
                    tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))
                )
                    return false;
                this.tiles[posX][posY] = tile;
                return true;
            }

            //rotation = 90
            if (tile.rotation == 90) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY - 1];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))
                )
                    return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY + 1];
                if (
                    tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 90))
                )
                    return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX - 1][posY];
                if (
                    tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))
                )
                    return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX + 1][posY];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))
                )
                    return false;
                this.tiles[posX][posY] = tile;
                return true;
            }

            //rotation = 180
            if (tile.rotation == 180) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY - 1];
                if (
                    tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))
                )
                    return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY + 1];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))
                )
                    return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX - 1][posY];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))
                )
                    return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX + 1][posY];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 90 || tTile.rotation == 180))
                )
                    return false;
                this.tiles[posX][posY] = tile;
                return true;
            }

            //rotation = 270
            if (tile.rotation == 270) {
                let tTile = posY == 0 ? WHITE : this.tiles[posX][posY - 1];
                if (
                    tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 90) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 180 || tTile.rotation == 270))
                )
                    return false;
                tTile = posY == 9 ? WHITE : this.tiles[posX][posY + 1];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 270) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))
                )
                    return false;
                tTile = posX == 0 ? WHITE : this.tiles[posX - 1][posY];
                if (
                    tTile instanceof Castle ||
                    (tTile instanceof CastleWall2 && tTile.rotation == 0) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))
                )
                    return false;
                tTile = posX == 9 ? WHITE : this.tiles[posX + 1][posY];
                if (
                    tTile instanceof Grass ||
                    (tTile instanceof CastleWall2 && tTile.rotation != 180) ||
                    (tTile instanceof CastleWall3 && (tTile.rotation == 0 || tTile.rotation == 270))
                )
                    return false;
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
        const rand: number = Math.floor(Math.random() * Math.floor(4));
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
        let msg = '';

        //add row begining
        switch (row) {
            case 0:
                return;
            case 1:
                msg += ':regional_indicator_a:';
                break;
            case 2:
                msg += ':regional_indicator_b:';
                break;
            case 3:
                msg += ':regional_indicator_c:';
                break;
            case 4:
                msg += ':regional_indicator_d:';
                break;
            case 5:
                msg += ':regional_indicator_e:';
                break;
            case 6:
                msg += ':regional_indicator_f:';
                break;
            case 7:
                msg += ':regional_indicator_g:';
                break;
            case 8:
                msg += ':regional_indicator_h:';
                break;
            case 9:
                msg += ':regional_indicator_i:';
                break;
            case 10:
                msg += ':regional_indicator_j:';
                break;
            default:
                return;
        }

        //add tiles of row
        for (let i = 0; i < 10; i++) {
            msg += Game.CLIENT.emojis.find(
                e =>
                    e.name ==
                    (this.tiles[i][row - 1].rotatable
                        ? this.tiles[i][row - 1].emojiBase + '_' + this.tiles[i][row - 1].rotation
                        : this.tiles[i][row - 1].emojiBase),
            );
        }

        return msg;
    }

    /**
     * evaluate the castles and hand out points
     * 1 point per castle tile owned when you own the most tiles in the castle
     */
    private evaluate(): void {
        for (let x = 0; x < 10; x++) {
            this.checked[x] = new Array<boolean>(10);
            for (let y = 0; y < 10; y++) {
                this.checked[x][y] = false;
            }
        }

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                this.evalTile(x, y);
            }
        }

        let i = 0;
        let max = 0;
        let maxUser: discord.User;
        for (; i < this.castles.length; i++) {
            this.castles[i].owners.forEach((num, user) => {
                if (num > max) {
                    maxUser = user;
                    max = num;
                }
            });
            if (this.castles[i].finished) max += 2;
            this.points[this.players.findIndex(u => u == maxUser)] =
                this.points[this.players.findIndex(u => u == maxUser)] + max;
        }

        let msg = 'The Game has ended\nLeaderboard:\n';
        let index = 0;
        const p2 = new Array<discord.User>(...this.players);

        for (i = 0; i < this.players.length; i++) {
            max = Math.max(...this.points);
            index = this.points.findIndex(p => p == max);
            switch (i) {
                case 0:
                    msg += ':first_place:' + this.players[index].username + ' ' + max + ' Points\n';
                    break;
                case 1:
                    msg += ':second_place:' + this.players[index].username + ' ' + max + ' Points\n';
                    break;
                case 2:
                    msg += ':third_place:' + this.players[index].username + ' ' + max + ' Points\n';
                    break;
                default:
                    msg += ':medal:' + this.players[index].username + ' ' + max + ' Points\n';
                    break;
            }

            this.players.splice(index, 1);
            this.points.splice(index, 1);
        }

        p2.forEach(p => p.send(msg).catch(err => console.error(err)));
    }

    /**
     * evaluates a tile and adds it if neccessary to a castlecomplex
     * @param x x position of tile
     * @param y y position of tile
     *
     */
    private evalTile(x, y): void {
        let tTile;
        const tile = this.tiles[x][y];
        if (this.checked[x][y]) return;
        this.checked[x][y] = true;
        if (tile instanceof Grass) return;
        if (tile instanceof White) return;

        if (!tile.complex) {
            const complex = new CastleComplex();
            tile.complex = complex;
            complex.addOwner(tile.owner);
            complex.addTile(tile);
            this.castles.push(complex);
        }

        if (tile instanceof Castle) {
            tTile = y == 9 ? WHITE : this.tiles[x][y + 1];
            if (tTile instanceof White) {
                tile.complex.finished = false;
            } else {
                this.setComplex(tile, tTile);
            }

            tTile = x == 9 ? WHITE : this.tiles[x + 1][y];
            if (tTile instanceof White) {
                tile.complex.finished = false;
            } else {
                this.setComplex(tile, tTile);
            }

            tTile = y == 0 ? WHITE : this.tiles[x][y - 1];
            if (tTile instanceof White) {
                tile.complex.finished = false;
            }

            tTile = x == 0 ? WHITE : this.tiles[x - 1][y];
            if (tTile instanceof White) {
                tile.complex.finished = false;
            }
        }

        //castlewall 2
        if (tile instanceof CastleWall2) {
            //rotation 0
            if (tile.rotation == 0) {
                tTile = x == 9 ? WHITE : this.tiles[x + 1][y];
                if (tTile instanceof White) {
                    tile.complex.finished = false;
                } else {
                    this.setComplex(tile, tTile);
                }
            }

            //rotation 90
            if (tile.rotation == 90) {
                tTile = y == 9 ? WHITE : this.tiles[x][y + 1];
                if (tTile instanceof White) {
                    tile.complex.finished = false;
                } else {
                    this.setComplex(tile, tTile);
                }
            }

            //rotation 180
            if (tile.rotation == 180) {
                tTile = x == 0 ? WHITE : this.tiles[x - 1][y];
                if (tTile instanceof White) {
                    tile.complex.finished = false;
                } else {
                    this.setComplex(tile, tTile);
                }
            }

            //rotation 270
            if (tile.rotation == 270) {
                tTile = y == 0 ? WHITE : this.tiles[x][y - 1];
                if (tTile instanceof White) {
                    tile.complex.finished = false;
                } else {
                    this.setComplex(tile, tTile);
                }
            }
        }

        //castlewall 3
        if (tile instanceof CastleWall3) {
            //rotation 0
            //TODO: not working
            if (tile.rotation == 0) {
                tTile = x == 9 ? WHITE : this.tiles[x + 1][y];
                if (tTile instanceof White) {
                    tile.complex.finished = false;
                } else {
                    this.setComplex(tile, tTile);
                }

                tTile = y == 9 ? WHITE : this.tiles[x][y + 1];
                if (tTile instanceof White) {
                    tile.complex.finished = false;
                } else {
                    this.setComplex(tile, tTile);
                }
            }

            //rotation 90
            if (tile.rotation == 90) {
                tTile = y == 9 ? WHITE : this.tiles[x][y + 1];
                if (tTile instanceof White) {
                    tile.complex.finished = false;
                } else {
                    this.setComplex(tile, tTile);
                }

                tTile = x == 0 ? WHITE : this.tiles[x - 1][y];
                if (tTile instanceof White) {
                    tile.complex.finished = false;
                }
            }

            //rotation 180
            if (tile.rotation == 180) {
                tTile = y == 0 ? WHITE : this.tiles[x][y - 1];
                if (tTile instanceof White) {
                    tile.complex.finished = false;
                }

                tTile = x == 0 ? WHITE : this.tiles[x - 1][y];
                if (tTile instanceof White) {
                    tile.complex.finished = false;
                }
            }

            //rotation 270
            if (tile.rotation == 270) {
                tTile = x == 9 ? WHITE : this.tiles[x + 1][y];
                if (tTile instanceof White) {
                    tile.complex.finished = false;
                } else {
                    this.setComplex(tile, tTile);
                }

                tTile = y == 0 ? WHITE : this.tiles[x][y - 1];
                if (tTile instanceof White) {
                    tile.complex.finished = false;
                }
            }
        }
    }

    /**
     * add two tiles to a complex
     * @param tile tile in evaluation
     * @param tTile test tile
     */
    private setComplex(tile: Tile, tTile: Tile): void {
        if (tile.complex && tTile.complex) {
            //TODO: testing
            tile.complex.joinCastles(tTile.complex.owners, tTile.complex.tiles);
            tile.complex.finished = tTile.complex.finished ? tile.complex.finished : false;
            this.castles.splice(this.castles.findIndex(c => c == tTile.complex), 1);
            tTile.complex = tile.complex;
        } else if (tile.complex != (null || undefined)) {
            tTile.complex = tile.complex;
            tile.complex.addOwner(tTile.owner);
            tile.complex.addTile(tTile);
        } else {
            tile.complex = new CastleComplex();
            this.castles.push(tile.complex);
            tTile.complex = tile.complex;
            tile.complex.addOwner(tile.owner);
            tile.complex.addOwner(tTile.owner);
        }
    }
}
