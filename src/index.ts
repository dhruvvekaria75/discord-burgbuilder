require('dotenv').config();

import * as discord from 'discord.js';
import { GameManager } from './gameManager';
import * as messageHandler from './messageHandler';
import { Game } from './game';

const client = new discord.Client();

client.once('ready', () => {
    console.log('Bot ready');

    Game.CLIENT = client;

    client.user.setPresence({ game: { name: '!bb help' }, status: 'online' });

    const gM = new GameManager();
    messageHandler.init(client, gM);
});

client.on('reconnecting', () => {
    console.warn("Reconnecting to discord gateway");
});

client.on('disconnect', () => {
    console.error("Disconnected from discord gateway");
});

client.on('error', (error) => {
    console.error(error.message);
});

console.log('Discord Burgbuilder started in ' + process.env.NODE_ENV || 'development' + ' mode');
client.login(process.env.TOKEN);
