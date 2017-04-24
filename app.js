/*jshint esversion: 6 */

const request   = require('request');
const Discord   = require('discord.js');
const music     = require('discord.js-music-v11');
const firebase  = require("firebase");
const snoowrap  = require('snoowrap');
const math      = require('mathjs');
const config    = require('./config.json');
const version   = require('./package.json').version;
const commands  = require('./commands');

firebase.initializeApp(config.firebase);
const database  = firebase.database();
const userDB    = database.ref('users');
const client    = new Discord.Client();
const reddit    = new snoowrap(config.reddit);

music(client);
client.login(config.token);

client.on('ready', () => {
  client.user.setGame(config.game);
  console.log(`\n// ${config.name} Online and listening for input`);
  client.setInterval(function () {
    for(var guild of client.guilds)
      commands.addGbp(userDB,guild[1]);
    console.log('Added +1 GBP to all Online Users');
  },300000);
});

client.on('guildCreate', (guild)=>{
  var embed = new Discord.RichEmbed()
    .setTitle(`// ${config.name} Online and listening for input`)
    .setDescription(`Thanks for adding me to your server!
Please have a look at my command list using **!help**
or for more detailed information at [GitHub](https://github.com/Fshy/FshyBot) | [arc.moe](http://arc.moe)

Currently running v${version} on a Linux EC2 Instance in the US-East
My latency to your server is ${Math.round(client.ping)}ms`)
    .setThumbnail('http://i.imgur.com/4D1IKh8.png')
    .setColor(config.decimalColour);
  guild.defaultChannel.sendEmbed(embed);
});

client.on('guildMemberAdd', (member) => {
  var embed = new Discord.RichEmbed()
    .setDescription(`${member.user.username} has joined the server.\n@everyone please welcome them to ${member.guild.name}`)
    .setImage('https://i.imgur.com/v177BWr.gif')
    .setColor(config.decimalColour);
  member.guild.defaultChannel.sendEmbed(embed);
});

client.on('message', (message)=>{
  if(message.author.bot && !message.content.startsWith(`${config.prefix}play`)) return;
  if(!message.content.startsWith(config.prefix) && !message.content.startsWith('2B') && !message.content.startsWith('2b')) return;
  console.log(`-- ${message.author.username}: ${message.content}`);

  let command = message.content.split(/\s+/g)[0].slice(config.prefix.length);
  let args    = message.content.split(/\s+/g).slice(1);

  switch (command) {
    // General
    case 'rules':       commands.rules(client,message);           break;
    case 'help':        commands.help(client,message);            break;
    case 'ping':        commands.ping(client,message);            break;
    case 'uptime':      commands.uptime(client,message);          break;
    case 'version':     commands.version(version,message);        break;

    // Owner Commands
    case 'update':      commands.update(message);                 break;

    // Admin Commands
    case 'setname':     commands.setName(client,args,message);    break;
    case 'setgame':     commands.setGame(client,args,message);    break;
    case 'setavatar':   commands.setAvatar(client,args,message);  break;
    case 'setstatus':   commands.setStatus(client,args,message);  break;

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

    // Points System
    case 'gbp':         commands.getGbp(userDB,message);          break;
    case 'shop':        commands.displayShop(userDB,message);     break;
    case 'bet':         commands.betGbp(userDB,args,message);     break;

    // Misc
    case 'btc':         commands.btc(message);                    break;
    case 'eth':         commands.eth(message);                    break;
    case 'calc':        commands.calc(math,args,message);         break;
    case 'b':
    case 'B':           commands.chatbot(args,message);           break;
    case 'r':           commands.rslash(reddit,message,args);     break;
    case 'roll':        commands.roll(args,message);              break;

    // Default
    default:            message.channel.sendEmbed({description: 'A-Are you talking to me? Because that\'s not a command I understand..\nReference !help to see what I can do, or adjust the prefix I listen for.',color: config.decimalColour});
  }

});
