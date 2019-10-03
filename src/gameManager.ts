import * as discord from 'discord.js';
import { Game } from './game';

export class GameManager {
    private games: Array<Game> = new Array<Game>();
    private nextGame: Game = new Game();

    /**
     * creates a custom game and adds to games array
     * @param message message used to request new game
     */
    createCustomGame(message: discord.Message): void {
        const newGame = new Game(message.author);
        this.games.push(newGame);

        newGame.joinPlayer(message.author);
        message.reply(
            'The game with the id ' +
                newGame.id +
                ' has been created!\nLet players you by typing !bb join ' +
                newGame.id,
        );
    }

    /**
     * adds a user to a custom game
     * @param message message used to request join
     */
    joinGame(message: discord.Message): void {
        const split = message.content.split(' ');
        const game = this.games.find(g => g.id == ((split[2] as unknown) as number));

        if (!game) return;

        if (game.joinPlayer(message.author)) {
            message.reply('You joined the game ' + split[2]);
        } else {
            message.reply("Sorry the game's already full!");
        }
    }

    /**
     * add a user to the next open game
     * creates a new game when neccessary
     *  @param message message used to request queue
     */
    queue(message: discord.Message): void {
        if (this.nextGame.joinPlayer(message.author)) {
            message.reply('You joined a game successfully');
        } else {
            this.nextGame = new Game();
            if (this.nextGame.joinPlayer(message.author)) {
                message.reply('You joined a game successfully');
            } else {
                message.reply('There has been an error. Please try again later');
            }
        }
    }

    /**
     * create a game for one person (for testing only)
     * @param message message used to request solo game
     */
    soloGame(message: discord.Message): void {
        const newGame = new Game();
        this.games.push(newGame);

        newGame.joinPlayer(message.author);
        newGame.start();

        message.reply('The game with the id ' + newGame.id + ' has been created!');
    }

    startGame(message: discord.Message): void {
        const game = this.games.find(g => g.creator == message.author);

        if (game) {
            game.start();
        } else {
            message.reply('You have to be the owner of a game to start it!');
        }
    }

    /**
     * removes a user from game and removes it when all have left
     * @param message message used to request leave
     */
    leaveGame(message: discord.Message): void {
        const game = this.games.find(g => g.players.includes(message.author));

        game.leavePlayer(message.author);

        message.reply('You left the game');

        if (game.players.length == 0) {
            this.games.splice(this.games.findIndex(g => g == game), 1);
        }
    }
}
