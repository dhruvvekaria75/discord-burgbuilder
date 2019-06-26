import * as discord from "discord.js";
import { GameManager } from "./gameManager";
let config = require("../config.json");

export function init(client: discord.Client, gM: GameManager) {
    client.on('message', message => {
        let split = message.content.split(" ");
        let msg = split[0] + ' ' + split[1];
        switch(msg) {
            case config.beta ? '!bbb queue': '!bb queue':
                gM.queue(message);
                return;
            case config.beta ? '!bbb game': '!bb game':
                gM.createCustomGame(message);
                return;
            case config.beta ? '!bbb join': '!bb join':
                gM.joinGame(message);
                return;
            //only for testing purposes
            case '!bbb solo':
                if(config.beta)gM.soloGame(message);
                break;
            case config.beta ? '!bbb leave': '!bb leave':
                gM.leaveGame(message);
                break;
            case config.beta ? '!bbb start': '!bb start':
                gM.startGame(message);
            case config.beta ? '!bbb help': '!bb help':
                message.channel.send(printHelp());
            default:
                break;
        }
    });
}

export function joinMessage() {

}

/**
 * created an embed that the commands of burgbuilder
 * @returns the created embed
 */
function printHelp(): discord.RichEmbed {
    let embed = new discord.RichEmbed;
    embed.setTitle("Burgbuilder Discord");
    embed.setDescription("Commands");
    embed.addField("!cb help", "Displays this help");
    embed.addField("!cb queue", "Join the queue for a random game");
    embed.addField("!cb game", "Create a custom game");
    embed.addField("!cb join <id>", "Join the game with the id");
    embed.addField("!cb start", "Start the custom game (only when YOU created the custom game)");
    embed.addField("Please read the github README for additional help and game instructions", "https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/README.md");
    embed.setURL("https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/README.md");  
    return embed;
}