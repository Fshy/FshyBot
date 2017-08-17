[![2b1](http://i.imgur.com/LyhaP3h.jpg)](http://arc.moe)
[![2b2](http://i.imgur.com/W87etD2.jpg)](https://discordapp.com/oauth2/authorize?permissions=8&scope=bot&client_id=291311819354800150)
[![2b3](http://i.imgur.com/1WetvDx.jpg)](#installation)

[![Discord](https://discordapp.com/api/guilds/290982567564279809/embed.png)](#)
[![AppVeyor](https://img.shields.io/appveyor/ci/Fshy/FshyBot.svg?style=flat-square)](https://ci.appveyor.com/project/Fshy/fshybot)
[![David](https://img.shields.io/david/Fshy/FshyBot.svg?style=flat-square)](https://david-dm.org/Fshy/FshyBot)
[![David](https://img.shields.io/david/dev/Fshy/FshyBot.svg?style=flat-square)](https://david-dm.org/Fshy/FshyBot?type=dev)
---
<h2><p align="center">Commands</p></h2>

<h5>General</h5>
<pre>
!help                     - Displays all available commands
!ping                     - Displays response time to server
!diag                     - Displays bot diagnostics and channel permissions
!say &lt;text&gt;               - Repeat the given text in a neat RichEmbed message
!logs &lt;number&gt;            - Posts the most recent VoiceChannel logs (User Join/Move/Disconnect)
!invite                   - Generates a link to invite 2B to your server
</pre>

<h5>Admin</h5>
<pre>
Requires user to have a role titled "Admin"
!setprefix &lt;newprefix&gt;    - Sets the prefix that the bot listens to
</pre>

<h5>Music</h5>

<pre>
When requesting a song, reaction controls are available under the bot response message.
[▶] Play/Pause [⬛] Stop [🔁] Replay Song [X] Leave channel

!play &lt;search/link&gt;       - Searches and plays a given song
!playlist &lt;link&gt; &lt;shuffle&gt;- Queues a given YouTube playlist; Pass 'shuffle' as 2nd param to randomize
!stop                     - Stops the current song
!pause                    - Pauses playback of the current song
!resume                   - Resumes playback of the current song
!clear                    - Clears the current playlist queue
!join                     - Joins the user's VoiceChannel
!leave                    - Stops any playback and leaves the channel
!stream &lt;url&gt;             - Plays a given audio stream, or file from direct URL
!radio                    - Displays some available preprogrammed radio streams
!np                       - Displays Now Playing info for radio streams
</pre>

<h5>Games</h5>

<pre>
!pubg &lt;username&gt; &lt;region&gt; - PLAYERUNKNOWN'S BATTLEGROUNDS stats lookup (Regions:na/sa/eu/as/sea/oc)
!hearthstone &lt;card name&gt;  - Performs a search and returns basic hearthstone card information 
</pre>

<h5>Anime/NSFW</h5>

<pre>
!smug                     - Posts a random smug reaction image
!2B &lt;nsfw&gt;                - Uploads a random 2B image, or a NSFW version if supplied as a parameter

!tags &lt;search term&gt;       - Searches Danbooru for possible related search tags
!sfw &lt;tag&gt;                - Uploads a random SFW image from Danbooru, for up to two search tags
!nsfw &lt;tag&gt;               - Uploads a random NSFW image from Danbooru, for up to two search tags

Multiple tags are separated by a / symbol, Example: !sfw kancolle/thighhighs
</pre>

<h5>Web APIs</h5>

<pre>
!insta &lt;username&gt;         - Uploads the most recent instagram post from a given user
!crypto &lt;coin&gt; &lt;amount&gt;   - Displays current cryptocurrency price or calculated value (optional)
!r &lt;subreddit&gt;            - Uploads a random image from a given subreddit
</pre>

<h5>Misc</h5>

<pre>
!calc &lt;expression&gt;        - Evaluates a given expression
!roll &lt;sides&gt; &lt;num&gt;       - Rolls an n-sided die, m times and displays the result
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

* [Node.js](https://nodejs.org/en/download/) (Version 8.0.0 or newer)
* [python 2.7](https://www.python.org/download/releases/2.7/)
* [ffmpeg](https://www.ffmpeg.org/download.html)

<h5>Windows:</h5>

```shell
#Install Microsoft Build Tools
npm install --global --production windows-build-tools
```

<h5>Ubuntu/Linux:</h5>

```shell
#Install Node/npm
$ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
$ sudo apt-get install -y nodejs

#Install python2.7 and ffmpeg
$ sudo apt-get install -y python2.7 ffmpeg

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
$ chmod 0775 app.js
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
