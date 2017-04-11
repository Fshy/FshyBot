/*jshint esversion: 6 */

const request   = require('request');
const exec      = require('child_process').exec;
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
    // General
    case  'rules':      commands.rules(client,message);           break;
    case  'help':       commands.help(client,message);            break;
    case  'ping':       commands.ping(client,message);            break;
    case  'uptime':     commands.uptime(client,message);          break;
    case  'version':    commands.version(version,message);        break;

    // Admin Commands
    case  'update':     commands.update(exec,version,message);    break;
    case  'setname':    commands.setName(client,args,message);    break;
    case  'setgame':    commands.setGame(client,args,message);    break;
    case  'setavatar':  commands.setAvatar(client,args,message);  break;
    case  'setstatus':  commands.setStatus(client,args,message);  break;

    // Music
    case 'play':
    case 'skip':
    case 'queue':
    case 'pause':
    case 'resume':
    case 'leave':                                                 break;
    case 'playlist':    commands.playlist(args,message);          break;

    // Anime/NSFW
    case 'lewd':        commands.danbooru(args,'e',100,message);  break;
    case 'sfw':         commands.danbooru(args,'s',100,message);  break;
    case 'tags':        commands.danbooruTags(args,message);      break;
    case '2B':
    case '2b':          commands.img2B(args,message);             break;

    // Misc
    case 'btc':         commands.btc(message);                    break;
    case 'eth':         commands.eth(message);                    break;
    case 'r':           commands.rslash(reddit,message,args);     break;
    case 'roll':        commands.roll(args,message);              break;

    // Default
    default:            message.channel.sendEmbed({description: 'A-Are you talking to me? Because that\'s not a command I understand..\nReference !help to see what I can do, or adjust the prefix I listen for.',color: config.decimalColour});
  }

});
