/*jshint esversion: 6 */

const request   = require('request');
const Discord   = require('discord.js');
const fs        = require('fs');
const ytdl      = require('ytdl-core');
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
    case 'rules':       return commands.rules(client,message);
    case 'help':        return commands.help(client,message);
    case 'ping':        return commands.ping(client,message);
    case 'uptime':      return commands.uptime(client,message);
    case 'version':     return commands.version(version,message);

    // Owner Commands
    case 'update':      return commands.update(message);

    // Admin Commands
    case 'setname':     return commands.setName(client,args,message);
    case 'setgame':     return commands.setGame(client,args,message);
    case 'setavatar':   return commands.setAvatar(client,args,message);
    case 'setstatus':   return commands.setStatus(client,args,message);

    // Music
    case 'play':        return commands.play(ytdl,client,args,message);
    case 'stop':        return commands.stop(client,message);
    case 'pause':       return commands.pause(client,message);
    case 'resume':      return commands.resume(client,message);
    case 'leave':       return commands.leave(client,message);
    case 'stream':      return commands.stream(client,args,message);
    case 'radio':       return commands.radio(client,args,message);
    // case 'playlist':    commands.playlist(args,message);          break;

    // Anime/NSFW
    case 'lewd':        return commands.danbooru(args,'e',100,message);
    case 'sfw':         return commands.danbooru(args,'s',100,message);
    case 'tags':        return commands.danbooruTags(args,message);
    case '2B':
    case '2b':          return commands.img2B(args,message);

    // Points System
    case 'gbp':         return commands.getGbp(userDB,message);
    case 'shop':        return commands.displayShop(userDB,message);
    case 'bet':         return commands.betGbp(userDB,args,message);

    // Misc
    case 'btc':         return commands.btc(message);
    case 'eth':         return commands.eth(message);
    case 'calc':        return commands.calc(math,args,message);
    case 'b':
    case 'B':           return commands.chatbot(args,message);
    case 'r':           return commands.rslash(reddit,message,args);
    case 'roll':        return commands.roll(args,message);

    // Default
    default:            return message.channel.sendEmbed({description: `A-Are you talking to me? Because that's not a command I understand..\nReference !help to see what I can do, or adjust the prefix I listen for.`,color: config.decimalColour});
  }

});
