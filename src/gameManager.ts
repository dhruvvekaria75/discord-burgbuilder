import * as discord from "discord.js";
import {Game} from "./game";


export class GameManager {
    private games: Array<Game> = new Array<Game>();
    private nextGame: Game = new Game();

    createCustomGame(message: discord.Message) {
        let newGame = new Game();
        this.games.push(newGame);

        newGame.players.push(message.author);
        message.reply("The game with the id " + newGame.id + " has been created!\nJoin it by typing !cb join " + newGame.id);
    }

    joinGame(message: discord.Message) {
        let split = message.content.split(" ");
        let game = this.games.find(g => g.id == <number><unknown>split[2]);


        if(!game) return;

        if(game.players.length < 4) {
            message.reply("Sorry the game is already full");
        } else {
            game.players.push(message.author);
            message.reply("You joined the game. Wait for it to start");
            if(game.players.length >= 4) {
                game.start();
            }
        }
    }

    queue(message: discord.Message) {
        if(this.nextGame.players.length < 2) {
            this.nextGame.players.push(message.author);
            message.reply("You joined the queue");
            if(this.nextGame.players.length >= 2) {
                this.nextGame.start();
            }
        } else {
            this.nextGame = new Game();
            this.games.push(this.nextGame);
            this.nextGame.players.push(message.author);
            message.reply("You joined the queue");
        }
    }

    soloGame(message: discord.Message) {
        let newGame = new Game();
        this.games.push(newGame);

        newGame.players.push(message.author);
        message.reply("The game with the id " + newGame.id + " has been created!\nYou it by typing !cb join " + newGame.id);
        newGame.start();
    }


}