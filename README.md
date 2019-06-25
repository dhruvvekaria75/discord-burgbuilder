# Discord Castlebuilder #
Castlebuilder is a game for discord.<br>
It is inspired by the board game Carcassonne.<br>
Created for [Discord Hack Week 2019](https://blog.discordapp.com/discord-community-hack-week-build-and-create-alongside-us-6b2a7b7bba33)

## Usage ##
Type ```!cb``` help to the help page<br>
Type ```!cb queue``` to join the queue and wait for a random game<br>
Type ```!cb game``` to create a custom game to play with your friends.<br>
Type ```!cb join <id>``` to join a custom game

### Game ###
At the beginning of the game you will be messaged with a blank 10x10 board.<br>
![start board](https://cdn.drachenfrucht1.de/start.png)

When it's your turn you will be messaged with a tile you can now place on board.<br>
React to appropriate emojis to specify your prefered placement<br>
React to the stop sign to submit your choise.<br>
The rotation is clockwise<br>
![tile placement](https://cdn.drachenfrucht1.de/selection.png)

After that you will see your placement on the board.<br>
![](https://cdn.drachenfrucht1.de/placement.png)

### Tile placement ###
There are 4 types of tiles as of now.<br>
- Only Grass ![grass](https://github.com/Drachenfrucht1/discord-castlebuilder/blob/master/img/grass.png?raw=true)<br>
- Only caste ![castle](https://github.com/Drachenfrucht1/discord-castlebuilder/blob/master/img/castle.png?raw=true)<br>
- 1/4 Castle ![castle_2](https://github.com/Drachenfrucht1/discord-castlebuilder/blob/master/img/castle_wall2_0.png?raw=true)<br>
- 1/2 Castle ![castle_3](https://github.com/Drachenfrucht1/discord-castlebuilder/blob/master/img/castle_wall3_0.png?raw=true)<br>

Tiles can only be placed according to specific rules.<br>
If you try to place a differently your turn will not count.<br>
- Castle pieces can only connect to other castle pieces
- Grass pieces can only connect to other tile pieces

In the future there will be more tiles added.
This means also more complex rules.


### Used libraries: ###
- [Discord.js](https://github.com/discordjs/discord.js)