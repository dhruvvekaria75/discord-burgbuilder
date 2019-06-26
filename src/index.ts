import * as discord from "discord.js";
import { GameManager } from "./gameManager";
import * as messageHandler from "./messageHandler";
import { Game } from "./game";

//Config file
const config = require("../config.json");

const client = new discord.Client();

client.once('ready', () => {
    console.log("Discord Burgnuilder ready");
});

client.login(config.token);

Game.CLIENT = client;

//init handlers
let gM = new GameManager();
messageHandler.init(client, gM);