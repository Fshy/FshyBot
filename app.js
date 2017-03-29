/*jshint esversion: 6 */

const request = require('request');
const Discord = require('discord.js');
const music   = require('discord.js-music-v11');
const snoowrap= require('snoowrap');
const config  = require('./config.json');
const commands= require('./commands');
const bot     = new Discord.Client();

const token   = config.token;
const prefix  = config.prefix;
const name    = config.name;
const game    = config.game;

const reddit  = new snoowrap({
  userAgent: config.name,
  clientId: config.reddit_id,
  clientSecret: config.reddit_secret,
  refreshToken: config.reddit_refresh
});

var launchTime = Date.now();

bot.on('ready', () => {
  bot.user.setUsername(name);
  bot.user.setGame(game);
  console.log("// "+bot.user.username+" took "+(Date.now()-launchTime)+"ms to boot");
  console.log("// Online and listening for input");
});

bot.on('message', (message)=>{
  if(message.author.bot && !message.content.startsWith(prefix+'play')) return;
  if(!message.content.startsWith(prefix)) return;

  console.log("-- "+message.author.username+": "+message.content);

  let command = message.content.split(/\s+/g)[0];
  command = command.slice(prefix.length);
  let args = message.content.split(/\s+/g).slice(1);

  // !help = Displays all available commands
  if (command === 'help') {
    commands.help(message);
  }else

  // !ping = Displays latency between the bot and the server
  if (command === 'ping') {
    message.channel.sendEmbed({description: 'Response time to discord server: '+(Date.now()-message.createdTimestamp)+'ms',color: 15514833});
  }else

  // !uptime = Displays time since launch
  if (command === 'uptime') {
    commands.uptime(launchTime,message);
  }else

  // !btc - Displays current Bitcoin spot price
  if (command === 'btc') {
    commands.btc(message);
  }else

  // !eth - Displays current Ethereum spot price
  if (command === 'eth') {
    commands.eth(message);
  }else

  // !playlist <playlistId> - Queues all videos from a youtube playlist
  if (command === 'playlist') {
    commands.playlist(args,message);
  }else

  // !roll <# of sides> <# of dice>
  if (command === 'roll') {
    commands.roll(args,message);
  }else

  // !anime_irl - Uploads a random image from the r/anime_irl frontpage
  if (command === 'r') {
    if (args[0]) {
      commands.getSubredditImages(reddit,message,args[0]);
    }else {
      message.channel.sendEmbed({description: 'ERROR: No subreddit specified | Use !r [subreddit]',color: 15514833});
    }
  }else

  // !2B - Uploads a random safe 2B image from danbooru
  if (command === '2B' || command === '2b') {
    if(args[0]==='nsfw')
      commands.danbooru('yorha_no._2_type_b','e',100,message);
    else
      commands.danbooru('yorha_no._2_type_b','s',100,message);
  }else

  // !lewd <search term> - Searches danbooru for a specific tag, and uploads a random nsfw image
  if (command === 'lewd') {
    var tag = args.join('_');
    commands.danbooru(tag,'e',100,message);
  }else

  // !sfw <search term> - Searches danbooru for a specific tag, and uploads a random safe image
  if (command === 'sfw') {
    var tag = args.join('_');
    commands.danbooru(tag,'s',100,message);
  }

  // !tags <search term> - Searches danbooru for possible related search tags
  if (command === 'tags') {
    var tag = args.join('_');
    commands.danbooruTags(tag,message);
  }

});

music(bot);

bot.login(token);
