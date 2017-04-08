/*jshint esversion: 6 */

const request   = require('request');
const Discord   = require('discord.js');
const music     = require('discord.js-music-v11');
const firebase  = require("firebase");
const snoowrap  = require('snoowrap');
const config    = require('./config.json');
const version   = require('./package.json').version;
const commands  = require('./commands');

firebase.initializeApp(config.firebase);
const database  = firebase.database();
const client    = new Discord.Client();
const reddit    = new snoowrap(config.reddit);

music(client);
client.login(config.token);

client.on('ready', () => {
  client.user.setUsername(config.name);
  client.user.setGame(config.game);
  client.user.setAvatar(config.avatar)
  console.log(`\n// ${config.name} Online and listening for input`);
});

client.on('message', (message)=>{
  if(message.author.bot && !message.content.startsWith(`${config.prefix}play`)) return;
  if(!message.content.startsWith(config.prefix)) return;
  console.log(`-- ${message.author.username}: ${message.content}`);

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
    // Moderator Only Commands
    case 'setname':
      if (commands.checkRole(message,config.modRole)) {
        if (args[0]) {
          var name = args.join(' ');
          client.user.setUsername(name).then(message.channel.sendEmbed({description: `Name successfully updated!`,color: 15514833}));
        }else {
          message.channel.sendEmbed({description: `ERROR: Specify a string to change username to`,color: 15514833});
        }
      }
      break;
    case 'setgame':
      if (commands.checkRole(message,config.modRole)) {
        if (args[0]) {
          var game = args.join(' ');
          client.user.setGame(game).then(message.channel.sendEmbed({description: `Game successfully updated!`,color: 15514833}));
        }else {
          client.user.setGame(null).then(message.channel.sendEmbed({description: `Game successfully cleared!`,color: 15514833}));
        }
      }
      break;
    case 'setstatus':
      if (commands.checkRole(message,config.modRole)) {
        if (args[0]==='online' || args[0]==='idle' || args[0]==='invisible' || args[0]==='dnd') {
          client.user.setStatus(args[0]).then(message.channel.sendEmbed({description: `Status successfully updated!`,color: 15514833}));
        }else {
          message.channel.sendEmbed({description: `ERROR: Incorrect syntax | Use !setstatus [status]\nStatuses: online, idle, invisible, dnd`,color: 15514833});
        }
      }
      break;
    case 'setavatar':
      if (commands.checkRole(message,config.modRole)) {
        if ((/\.(jpe?g|png|gif|bmp)$/i).test(args[0])) {
          client.user.setAvatar(args[0]).then(message.channel.sendEmbed({description: `Avatar successfully updated!`,color: 15514833}));
        }else {
          message.channel.sendEmbed({description: `ERROR: That's not an image filetype I recognize | Try: .jpg .png .gif .bmp`,color: 15514833});
        }
      }
      break;
    // !rules = Displays the guild rules
    case 'rules':
      commands.rules(client,message);
      break;
    // !help = Displays all available commands
    case 'help':
      commands.help(client,message);
      break;
    case 'version':
      commands.version(version,message);
      break;
    // !ping = Displays latency between the bot and the server
    case 'ping':
      message.channel.sendEmbed({description: `Response time to discord server: ${client.ping}ms`,color: 15514833});
      break;
    // !uptime = Displays time since launch
    case 'uptime':
      commands.uptime(client,message);
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
    // !2B - Uploads a random 2B image from danbooru
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
