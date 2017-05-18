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
const lib       = require('./lib');

firebase.initializeApp(config.firebase);
const database  = firebase.database();
const userDB    = database.ref('users');
const guildDB   = database.ref('guilds');
const client    = new Discord.Client();
const reddit    = new snoowrap(config.reddit);

var guildsMap = new Map();
var timer;

client.login(config.token);

client.on('ready', () => {
  guildDB.once("value", (data) => {
    var guilds = data.val();
    if (guilds) {
      var keys = Object.keys(guilds);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        guildsMap.set(guilds[key].id,{prefix:guilds[key].prefix});
      }
    }else {
      var clientGuilds = client.guilds.keyArray();
      for (var i = 0; i < clientGuilds.length; i++) {
        guildDB.push({id: clientGuilds[i], prefix: config.prefix});
        guildsMap.set(clientGuilds[i],{prefix:config.prefix});
      }
    }
  });
  console.log(`\n\x1b[32m\x1b[1m// ${config.name} Online and listening for input\x1b[0m`);
  // Alternate setGame
  var i = 0;
  timer = client.setInterval(function () {
    switch (i%5) {
      case 4:   client.user.setGame(`${client.guilds.size} Guilds - ${client.users.size} Users`);  break;
      case 3:   client.user.setGame(`Commands: !help`);                                               break;
      case 2:   client.user.setGame(`@Fshy#0986`);                                                    break;
      case 1:   client.user.setGame(`arc.moe`);                                                       break;
      case 0:   client.user.setGame(`NieR: Automata™`);                                               break;
    }
    i++;
  },15000);
  // Log Current Stats
  client.setInterval(function () {
    var d = new Date(Date.now());
    console.log(`\n\x1b[32m[${d.getDate()}/${(d.getMonth()+1)}/${d.getFullYear()} | ${d.toLocaleTimeString()}]\x1b[0m Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB | Users: ${client.users.size} | Guilds: ${client.guilds.size}`);
  },300000);
});

client.on('guildCreate', (guild)=>{
  var guildPrefix = '!';
  var toInsert = true;
  guildDB.once("value", (data) => {
    var guilds = data.val();
    if (guilds) {
      var keys = Object.keys(guilds);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (guilds[key].id===guild.id) {
          guildPrefix = guilds[key].prefix;
          toInsert = false;
          break;
        }
      }
      if (toInsert) {
        guildDB.push({id: guild.id, prefix: config.prefix});
        guildsMap.set(guilds[key].id,{prefix:config.prefix});
      }
    }else {
      var clientGuilds = client.guilds.keyArray();
      for (var i = 0; i < clientGuilds.length; i++) {
        guildDB.push({id: clientGuilds[i], prefix: config.prefix});
        guildsMap.set(clientGuilds[i],{prefix:config.prefix});
      }
    }
    guild.defaultChannel.send({embed:new Discord.RichEmbed()
      .setTitle(`// ${config.name} Online and listening for input`)
      .setDescription(`
        Thanks for adding me to your server!
        Please have a look at my command list using **${guildPrefix}help**
        or for more detailed information at [GitHub](https://github.com/Fshy/FshyBot) | [arc.moe](http://arc.moe)

        Currently running v${version} on a ${process.platform}-${process.arch} platform
        My latency to your server is ${Math.round(client.ping)}ms`)
      .setThumbnail('http://i.imgur.com/4D1IKh8.png')
      .setColor(config.hexColour)});
  });
});

client.on('guildMemberAdd', (member) => {
  member.guild.defaultChannel.send({embed:new Discord.RichEmbed()
    .setDescription(`${member.user.username} has joined the server.\nPlease welcome them to ${member.guild.name}`)
    .setThumbnail(member.user.displayAvatarURL)
    .setColor(config.hexColour)});
    // .setImage('https://i.imgur.com/v177BWr.gif')
});

client.on('message', (message)=>{
  if(message.author.bot) return;

  // Receive DM
  if (message.channel.type===`dm`)
    return commands.chatbot(message.content.split(),message);

  // Chatbot
  if (message.content.startsWith(`2B`) || message.content.startsWith(`2b`))
    return commands.chatbot(message.content.split(/\s+/g).slice(1),message);

  // Custom Prefixes
  let guildPrefix = guildsMap.get(message.guild.id).prefix;
  if(!message.content.startsWith(guildPrefix)) return;

  // Command Parsing
  console.log(`\x1b[36m[${message.guild}] \x1b[1m${message.author.username}: \x1b[0m${message.content}`);
  let command = message.content.split(/\s+/g)[0].slice(guildPrefix.length);
  let args    = message.content.split(/\s+/g).slice(1);

  switch (command.toLowerCase()) {
    // General
    case 'help':        return commands.help(guildPrefix,message);
    case 'ping':        return commands.ping(client,message);
    case 'stats':       return commands.stats(version,client,message);
    case 'version':     return commands.ver(version,guildPrefix,message);
    case 'invite':      return commands.invite(client,message);

    // Owner Commands
    case 'update':      return commands.update(message);

    // Admin Commands
    case 'setname':     return commands.setName(client,args,message);
    case 'setgame':     return commands.setGame(timer,client,args,message);
    case 'setavatar':   return commands.setAvatar(client,args,message);
    case 'setstatus':   return commands.setStatus(client,guildPrefix,args,message);
    case 'setprefix':   return commands.setprefix(guildDB,guildsMap,guildPrefix,args,message);

    // Music
    case 'play':        return commands.play(ytdl,client,args,message);
    case 'stop':        return commands.stop(guildsMap,client,message);
    case 'pause':       return commands.pause(client,message);
    case 'resume':      return commands.resume(client,message);
    case 'leave':       return commands.leave(guildsMap,client,message);
    case 'stream':      return commands.stream(client,args,message);
    case 'radio':       return commands.radio(client,guildPrefix,guildsMap,args,message);
    case 'np':
    case 'nowplaying':  return commands.nowPlaying(guildsMap,message);

    // World of Warcraft
    // case 'wow':         return commands.wowlogs(args,message);

    // League of Legends
    // case 'lol':         return commands.leagueoflegends(args,message);

    // Anime/NSFW
    case 'sfw':         return commands.danbooru(args,`s`,100,message);
    case 'nsfw':
    case 'lewd':        return commands.danbooru(args,`e`,100,message);
    case 'tags':        return commands.danbooruTags(args,message);
    case '2b':          return commands.img2B(args,message);
    case 'smug':        return commands.smug(message);

    // Misc
    case 'btc':         return commands.coin(`BTC`,message);
    case 'eth':         return commands.coin(`ETH`,message);
    case 'calc':        return commands.calc(math,args,message);
    case 'r':           return commands.rslash(reddit,guildPrefix,message,args);
    case 'roll':        return commands.roll(args,message);
    case 'riddle':      return commands.riddle(message);

    // Default
    // default:            return message.channel.send(lib.embed(`A-Are you talking to me? Because that's not a command I understand..\nReference \`${guildPrefix}help\` to see what I can do, or use \`${guildPrefix}setprefix\`.`));
  }

});
