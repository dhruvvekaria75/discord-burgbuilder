import * as discord from "discord.js";
import { GameManager } from "./gameManager";

export function init(client: discord.Client, gM: GameManager) {
    client.on('message', message => {
        let split = message.content.split(" ");
        let msg = split[0] + ' ' + split[1];
        switch(msg) {
            case '!cb queue':
                gM.queue(message);
                return;
            case '!cb game':
                gM.createCustomGame(message);
                return;
            case '!cb join': 
                gM.joinGame(message);
                return;
            //only for testing purposes
            case '!cb solo':
                gM.soloGame(message);
            default: 
                break;
        }
    });
}