[![2b1](http://i.imgur.com/hftWBMJ.jpg)](http://arc.moe)
[![2b2](http://i.imgur.com/W87etD2.jpg)](https://discordapp.com/oauth2/authorize?permissions=8&scope=bot&client_id=291311819354800150)
[![2b3](http://i.imgur.com/1WetvDx.jpg)](#installation)

[![Discord](https://discordapp.com/api/guilds/290982567564279809/embed.png)](http://discord.arc.moe/)
[![AppVeyor](https://img.shields.io/appveyor/ci/Fshy/FshyBot.svg?style=flat-square)](https://ci.appveyor.com/project/Fshy/fshybot)
[![David](https://img.shields.io/david/Fshy/FshyBot.svg?style=flat-square)](https://david-dm.org/Fshy/FshyBot)
[![David](https://img.shields.io/david/dev/Fshy/FshyBot.svg?style=flat-square)](https://david-dm.org/Fshy/FshyBot?type=dev)
---
<h2><p align="center">Commands</p></h2>

<h5>General</h5>
<pre>
!help                   - Displays all available commands
!ping                   - Displays response time to server
!stats                  - Displays bot usage statistics
!version                - Checks for updates to the bot
!invite                 - Generates a link to invite 2B to your server
</pre>

<h5>Admin</h5>
<pre>
Requires user to have a role titled "Admin"
!setprefix  [newprefix] - Sets the prefix that the bot listens to
</pre>

<h5>Owner</h5>
<pre>
!update                 - Updates to the master branch, IMPORTANT: Linux Only / Requires PM2
!setname    [name]      - Sets the username of the bot, limited to 2 requests/hr
!setgame    [game]      - Sets the "Playing" text for the bot, leave blank to clear
!setavatar  [image url] - Sets the avatar of the bot from an image url
!setstatus  [status]    - Sets the status of the bot
</pre>


<h5>Music</h5>

<pre>
!play   [search/link]   - Searches and queues the given term link for playback
!stop                   - Stops the current song and leaves the channel
!pause                  - Pauses playback of the current song
!resume                 - Resumes playback of the current song
!leave                  - Stops any playback and leaves the channel
!stream [url]           - Plays a given audio stream, or file from direct URL
!radio                  - Displays some available preprogrammed radio streams
!np                     - Displays Now Playing info for radio streams
</pre>

<h5>Anime/NSFW</h5>

<pre>
!smug                   - Posts a random smug reaction image
!lewd [search term]     - Uploads a random NSFW image from Danbooru, of the given search term
!sfw  [search term]     - Uploads a random SFW image from Danbooru, of the given search term
!tags [search term]     - Searches Danbooru for possible related search tags
!2B   [nsfw]            - Uploads a random 2B image, or a NSFW version if supplied as a parameter
</pre>

<h5>Misc</h5>

<pre>
!btc                    - Displays current Bitcoin spot price
!eth                    - Displays current Ethereum spot price
!calc [expression]      - Evaluates a given expression
!r    [subreddit]       - Uploads a random image from frontpage of a given subreddit
!roll [sides] [num]     - Rolls an n-sided die, m times and displays the result
</pre>

<h5>Chatbot</h5>

<pre>
2B answers her callsign in response to the user
Examples:
  Fshy: 2B How are you?
  2B:   Great! how about you?

  Fshy: 2B What's the time?
  2B:   It is 1:00 A.M.
</pre>

<hr>
<h2><p align="center">Installation</p></h2>
<h3>Prerequisites</h3>

* [Node.js](https://nodejs.org/en/download/) (Version 6.x or newer)
* [python 2.7](https://www.python.org/download/releases/2.7/)

<h5>Windows:</h5>

```shell
#Install Microsoft Build Tools
npm install --global --production windows-build-tools
```

<h5>Ubuntu/Linux:</h5>

```shell
#Install Node/npm
$ curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
$ sudo apt-get install -y nodejs

#Install python2.7
$ sudo apt-get install -y python2.7

#Install required build tools (make, gcc)
$ sudo apt-get install -y build-essential

#Configure python for node-gyp
$ npm config set python python2.7
```

<hr>

<h3>Build</h3>

```shell
$ git clone https://github.com/Fshy/FshyBot
$ cd FshyBot
$ npm install
```

Rename `config_example.json` to `config.json` and add your user token/API keys to suit.

<hr>

<h3>Running</h3>

With a working config file in place, we're ready to start the script from the terminal/command prompt.

```shell
#Launch bot
$ node app.js
```

It's recommended however, to run scripts using a process manager such as [PM2](https://github.com/Unitech/pm2). This ensures your bot automatically restarts in case of a crash. This also allows us to use the !update command to fetch new builds.

```shell
#Install pm2
$ npm install pm2 -g

#Launch using pm2
$ pm2 start app.js --name "2B"

# Configure pm2 to launch on startup
$ pm2 startup
$ pm2 save
```
