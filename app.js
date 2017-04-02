/*jshint esversion: 6 */

const request = require('request');
const Discord = require('discord.js');
const music   = require('discord.js-music-v11');
const firebase= require("firebase");
const snoowrap= require('snoowrap');
const config  = require('./config.json');
const commands= require('./commands');

const client  = new Discord.Client();
const reddit  = new snoowrap(config.reddit);

music(client);
firebase.initializeApp(config.firebase);
client.login(config.token);

var launchTime = Date.now();

client.on('ready', () => {
  client.user.setUsername(config.name);
  client.user.setGame(config.game);
  console.log("// "+client.user.username+" took "+(Date.now()-launchTime)+"ms to boot");
  console.log("// Online and listening for input");
});

client.on('message', (message)=>{
  if(message.author.bot && !message.content.startsWith(config.prefix+'play')) return;
  if(!message.content.startsWith(config.prefix)) return;
  console.log("-- "+message.author.username+": "+message.content);

  let command = message.content.split(/\s+/g)[0].slice(config.prefix.length);
  let args    = message.content.split(/\s+/g).slice(1);

  switch (command) {
    // discord.js-music-v11 commands
    case 'play':
    case 'skip':
    case 'queue':
    case 'pause':
    case 'resume':
    case 'leave':
      break;
    // !help = Displays all available commands
    case 'help':
      commands.help(message);
      break;
    // !ping = Displays latency between the bot and the server
    case 'ping':
      message.channel.sendEmbed({description: 'Response time to discord server: '+(Date.now()-message.createdTimestamp)+'ms',color: 15514833});
      break;
    // !uptime = Displays time since launch
    case 'uptime':
      commands.uptime(launchTime,message);
      break;
    // !btc - Displays current Bitcoin spot price
    case 'btc':
      commands.btc(message);
      break;
    // !eth - Displays current Ethereum spot price
    case 'eth':
      commands.eth(message);
      break;
    // !playlist <playlistId> - Queues all videos from a youtube playlist
    case 'playlist':
      commands.playlist(args,message);
      break;
    // !roll <# of sides> <# of dice>
    case 'roll':
      commands.roll(args,message);
      break;
    // !r - Uploads a random image from the frontpage of a given subreddit
    case 'r':
      if (args[0]) {
        commands.getSubredditImages(reddit,message,args[0]);
      }else {
        message.channel.sendEmbed({description: 'ERROR: No subreddit specified | Use !r [subreddit]',color: 15514833});
      }
      break;
      case 'r':
    // !2B - Uploads a random safe 2B image from danbooru
    case '2B':
    case '2b':
      if(args[0]==='nsfw')
        commands.danbooru('yorha_no._2_type_b','e',100,message);
      else
        commands.danbooru('yorha_no._2_type_b','s',100,message);
      break;
    // !lewd <search term> - Searches danbooru for a specific tag, and uploads a random nsfw image
    case 'lewd':
      var tag = args.join('_');
      commands.danbooru(tag,'e',100,message);
      break;
    // !sfw <search term> - Searches danbooru for a specific tag, and uploads a random safe image
    case 'sfw':
      var tag = args.join('_');
      commands.danbooru(tag,'s',100,message);
      break;
    // !tags <search term> - Searches danbooru for possible related search tags
    case 'tags':
      var tag = args.join('_');
      commands.danbooruTags(tag,message);
      break;
    default:
      message.channel.sendEmbed({description: 'A-Are you talking to me? Because that\'s not a command I understand..\nReference !help to see what I can do, or adjust the prefix I listen for.',color: 15514833});
  }

});
