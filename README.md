# Burgbuilder #
![Banner](https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/docs/banner_bb.png)

Burgbuilder is a game for discord.<br>
It is inspired by the board game Carcassonne.<br>
Created for [Discord Hack Week 2019](https://blog.discordapp.com/discord-community-hack-week-build-and-create-alongside-us-6b2a7b7bba33)

Join the [Burgbuilder discord server](https://discord.gg/MnZ7eaP) to get acces to the hosted bot.<br>
If you want to selfhost the bot go to Setup to check how to set it up correctly.

## Usage ##
Type ```!bb help``` to view the help page<br>
Type ```!bb rotation``` to get an explanation on the reaction emojis<br>
Type ```!bb queue``` to join the queue and wait for a random game<br>
Type ```!bb game``` to create a custom game to play with your friends.<br>
Type ```!bb join <id>``` to join a custom game<br>
Type ```!bb start``` to start a game (only possible when you created a custom game first).<br>
The prefix changes to `!bbb` when and the additional command `!bbb solo` becomes available when using development mode. `!bbb solo` starts a single player game for testing purposes.


### Game ###
At the beginning of the game you will be messaged with a blank 10x10 board.<br>
![start board](https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/docs/start.png)

When it's your turn you will be messaged with a tile you can now place on board.<br>
React to the appropriate emojis to specify your prefered placement<br>
Start reacting when all messages and reactions have fully loaded.<br>
React to the stop sign to submit your choise.<br>
The rotation is clockwise.<br>
![tile placement](https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/docs/selection.png)

After that you will see your placement on the board.<br>
![](https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/docs/placement.png)<br>
There are 40 turns in total. With a total of 4 players per match it's 10 turns per player.

### Tile placement ###
There are 4 types of tiles as of now.<br>
- ![grass](https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/img/grass.png?raw=true)<br>
- ![castle](https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/img/castle.png?raw=true)<br>
- ![castle_2](https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/img/castle_wall2_0.png?raw=true)<br>
- ![castle_3](https://github.com/Drachenfrucht1/discord-burgbuilder/blob/master/img/castle_wall3_0.png?raw=true)<br>

(I'm not that good at drawing as you might see but the brown stuff is castle<br>and the green should be grass)<br>
Tiles can only be placed according to specific rules.<br>
If you try to place a differently your turn will not count.<br>
- Castle pieces can only connect to other castle pieces
- Grass pieces can only connect to other tile pieces

In the future there will be more tiles added.
This means also more complex rules.

### Points ###
You will get a point per tile when you have contributed the most tile to the castle.<br>
The player with the most points will (obviously) win the game.<br>

## Setup ##
You have to setup the picture in the img folder as emojis to a guild the bot is a user of.
##### Without Docker ####
1. Clone this repo using `git clone https://github.com/Drachenfrucht1/discord-burgbuilder.git`
2. `cd` into the directory and run `npm install`
3. Rename .env.example to .env and replace paste your bot token
4. Run `npm start` to start the bot
5. Have fun playing with the bot!!!

Use `npm run start:dev` instead to start the bot in development mode.

#### With Docker ####
1. Clone this repo using `git clone https://github.com/Drachenfrucht1/discord-burgbuilder.git`
2. `cd` into the directory, rename .env.example to .env and paste your bot token
3. Run `docker build -t drachenfrucht1/burg-builder .`
4. Start the docker container by typing `docker run -d drachenfrucht1/burg-builder`
5. Have fun playing with the bot!!!



## Used libraries: ##
- [Discord.js](https://github.com/discordjs/discord.js)
- [bufferutil](https://github.com/websockets/bufferutil)

## Contribute ##
If you have questions or just want to test the bot you can [join the Burgbuilder discord server](https://discord.gg/MnZ7eaP).
Feel free to contribute or file an issue if you have a bug or feature request.<br>

## Dev Setup ##
You first have to fork the repo to contribute to it.<br>
You can then clone your fork by running `git clone https://github.com/<YOUR USERNAME>/discord-burgbuilder.git`.<br>
Rename .env.example to .env and paste your bot token.<br>
Run `npm run start:dev` to start the bot in dev mode and test your changes.<br>
Commit your changes after you edited the code.<br>
The last step is to create a pull request to merge your changes.<br>
**Please run `npm run lint` and fix all occuring issues before submiting a PR.**