//IMPORTS
import * as discord from "discord.js";

//Config file
const config = require("../config.json");

const client = new discord.Client();

client.once('ready', () => {
    console.log("Discord Castlebuilder");
});

client.login(config.token);