import * as discord from 'discord.js';
import { Tile } from './tiles';

export class CastleComplex {
    finished = true;

    owners: Map<discord.User, number> = new Map<discord.User, number>();

    tiles: Array<Tile> = new Array<Tile>();

    constructor(finished?: boolean) {
        if (finished) this.finished = finished;
    }

    addTile(tile: Tile): void {
        this.tiles.find(t => t == tile) ? null : this.tiles.push(tile);
    }

    addOwner(user: discord.User): void {
        if (this.owners.has(user)) {
            this.owners.set(user, this.owners.get(user) + 1);
        } else {
            this.owners.set(user, 1);
        }
    }

    joinCastles(o: Map<discord.User, number>, t: Array<Tile>): void {
        o.forEach((num, user) => {
            if (this.owners.has(user)) {
                this.owners.set(user, this.owners.get(user) + num);
            } else {
                this.owners.set(user, num);
            }
        });

        t.forEach(test => this.addTile(test));
    }
}
