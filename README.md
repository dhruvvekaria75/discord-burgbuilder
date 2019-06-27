# Discord Burgbuilder #
Burgbuilder is a game for discord.<br>
It is inspired by the board game Carcassonne.<br>
Created for [Discord Hack Week 2019](https://blog.discordapp.com/discord-community-hack-week-build-and-create-alongside-us-6b2a7b7bba33)

Join the [Burgbuilder discord server](https://discord.gg/ae2avNc) to get acces to the hosted bot.

## Usage ##
Type ```!bb help``` to view the help page<br>
Type ```!bb rotation``` to get an explanation on the reaction emojis<br>
Type ```!bb queue``` to join the queue and wait for a random game<br>
Type ```!bb game``` to create a custom game to play with your friends.<br>
Type ```!bb join <id>``` to join a custom game<br>
Type ```!bb start``` to start a game (only possible when you created a custom game first).<br>

### Game ###
At the beginning of the game you will be messaged with a blank 10x10 board.<br>
![start board](https://cdn.drachenfrucht1.de/start.png)

When it's your turn you will be messaged with a tile you can now place on board.<br>
React to the appropriate emojis to specify your prefered placement<br>
React to the stop sign to submit your choise.<br>
The rotation is clockwise<br>
![tile placement](https://cdn.drachenfrucht1.de/selection.png)

After that you will see your placement on the board.<br>
![](https://cdn.drachenfrucht1.de/placement.png)

### Tile placement ###
There are 4 types of tiles as of now.<br>
- ![grass](https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/img/grass.png?raw=true)<br>
- ![castle](https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/img/castle.png?raw=true)<br>
- ![castle_2](https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/img/castle_wall2_0.png?raw=true)<br>
- ![castle_3](https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/img/castle_wall3_0.png?raw=true)<br>

Tiles can only be placed according to specific rules.<br>
If you try to place a differently your turn will not count.<br>
- Castle pieces can only connect to other castle pieces
- Grass pieces can only connect to other tile pieces

In the future there will be more tiles added.
This means also more complex rules.

## Points ##
You will get a point per tile when you have contributed the most tile to the castle.<br>
The player with the most points will (obviously) win the game.<br>


## Used libraries: ##
- [Discord.js](https://github.com/discordjs/discord.js)
- [bufferutil](https://github.com/websockets/bufferutil)

## Contribute ##
Feel free to contribute or file an issue if you have a bug or feature request.<br>
If you have questions you can [join the Burgbuilder discord server](https://discord.gg/ae2avNc).