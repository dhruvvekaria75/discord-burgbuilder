import * as discord from "discord.js";
import { GameManager } from "./gameManager";
import * as messageHandler from "./messageHandler";
import { Game } from "./game";

//Config file
const config = require("../config.json");

const client = new discord.Client();

client.once('ready', () => {
    console.log("Discord Burgbuilder ready");

    Game.CLIENT = client;

    client.user.setPresence({game: {name: "Burgbuilder"}, status: "online"});

    let gM = new GameManager();
    messageHandler.init(client, gM);
});

client.login(config.token);