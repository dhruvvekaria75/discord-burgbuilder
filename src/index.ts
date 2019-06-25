import * as discord from "discord.js";
import { GameManager } from "./gameManager";
import * as messageHandler from "./messageHandler";
import { Game } from "./game";

//Config file
const config = require("../config.json");

const client = new discord.Client();

client.once('ready', () => {
    console.log("Discord Castlebuilder ready");
});

client.login(config.token);

Game.CLIENT = client;

/*client.on('message', message => {
    let game = new Game();
    game.players.push(message.author);
    game.start();
});*/

//init handlers
let gM = new GameManager();
messageHandler.init(client, gM);