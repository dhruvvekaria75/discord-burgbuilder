require('dotenv').config();

import * as discord from 'discord.js';
import { GameManager } from './gameManager';
import * as messageHandler from './messageHandler';
import { Game } from './game';

const client = new discord.Client();

client.once('ready', () => {
    console.log('Bot ready');

    Game.CLIENT = client;

    client.user.setPresence({ game: { name: 'Burgbuilder' }, status: 'online' });

    const gM = new GameManager();
    messageHandler.init(client, gM);
});
console.log('Discord Burgbuilder started in ' + process.env.NODE_ENV || 'development' + ' mode');
client.login(process.env.TOKEN);
