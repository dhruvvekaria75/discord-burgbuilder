import * as discord from 'discord.js';
import { GameManager } from './gameManager';
const isBeta = process.env.NODE_ENV == 'development' ? true : false;

/**
 * created an embed that explains how to rotation reaction work
 * @returns the created embed
 */
export function rotationMessage(client: discord.Client): discord.RichEmbed {
    const embed = new discord.RichEmbed();
    embed.setTitle('Rotation explanation');
    embed.addField(
        '0° ' +
            client.emojis.find(e => e.name == 'castle_wall2_0') +
            ' ' +
            client.emojis.find(e => e.name == 'castle_wall3_0'),
        'Press nothing',
    );
    embed.addField(
        '90° ' +
            client.emojis.find(e => e.name == 'castle_wall2_90') +
            ' ' +
            client.emojis.find(e => e.name == 'castle_wall3_90'),
        'Press 🕒',
    );
    embed.addField(
        '180° ' +
            client.emojis.find(e => e.name == 'castle_wall2_180') +
            ' ' +
            client.emojis.find(e => e.name == 'castle_wall3_180'),
        'Press 🕕',
    );
    embed.addField(
        '270° ' +
            client.emojis.find(e => e.name == 'castle_wall2_270') +
            ' ' +
            client.emojis.find(e => e.name == 'castle_wall3_270'),
        'Press 🕘',
    );
    return embed;
}

/**
 * created an embed that the commands of burgbuilder
 * @returns the created embed
 */
function printHelp(): discord.RichEmbed {
    const embed = new discord.RichEmbed();
    embed.setTitle('Burgbuilder Discord');
    embed.setDescription('Commands');
    embed.addField('!bb help', 'Displays this help');
    embed.addField('!bb rotation', 'Explains how the rotation reactions work');
    embed.addField('!bb queue', 'Join the queue for a random game');
    embed.addField('!bb game', 'Create a custom game');
    embed.addField('!bb join <id>', 'Join the game with the id');
    embed.addField('!bb start', 'Start the custom game (only when YOU created the custom game)');
    embed.addField(
        'Please read the github README for additional help and game instructions',
        'https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/README.md',
    );
    embed.setURL('https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/README.md');
    return embed;
}

export function init(client: discord.Client, gM: GameManager): void {
    client.on('message', message => {
        const split = message.content.split(' ');
        const msg = split[0] + ' ' + split[1];
        switch (msg) {
            case isBeta ? '!bbb queue' : '!bb queue':
                gM.queue(message);
                return;
            case isBeta ? '!bbb game' : '!bb game':
                gM.createCustomGame(message);
                return;
            case isBeta ? '!bbb join' : '!bb join':
                gM.joinGame(message);
                return;
            //only for testing purposes
            case '!bbb solo':
                if (isBeta) gM.soloGame(message);
                break;
            case isBeta ? '!bbb leave' : '!bb leave':
                gM.leaveGame(message);
                break;
            case isBeta ? '!bbb start' : '!bb start':
                gM.startGame(message);
                break;
            case isBeta ? '!bbb help' : '!bb help':
                message.channel.send(printHelp());
                break;
            case isBeta ? '!bbb rotation' : '!bb rotation':
                message.channel.send(rotationMessage(client));
                break;
            default:
                break;
        }
    });
}
