/*jshint esversion: 6 */

const request   = require('request');
const Discord   = require('discord.js');
const fs        = require('fs');
const ytdl      = require('ytdl-core');
// const firebase  = require("firebase");
const snoowrap  = require('snoowrap');
const math      = require('mathjs');
const scraper   = require("scrape-it");
const winston   = require('winston');
const config    = require('./config');
const version   = require('./package').version;
const commands  = require('./commands');
const lib       = require('./lib');

winston.configure({
  transports: [
    new (winston.transports.File)({
      filename: 'winston.log',
      timestamp: function () {
        return +new Date()
      }
    })
  ]
});

// firebase.initializeApp(config.firebase);
// const database  = firebase.database();
// const userDB    = database.ref('users');
// const guildDB   = database.ref('guilds');
const client    = new Discord.Client();
const reddit    = new snoowrap(config.reddit);

var guildsMap = new Map();
var timer;

client.login(config.token);

client.on('ready', () => {
  var clientGuilds = client.guilds.keyArray();
  for (var i = 0; i < clientGuilds.length; i++) {
    guildsMap.set(clientGuilds[i],{prefix:config.prefix,playing:null});
  }
  console.log(`\n\x1b[32m\x1b[1m// ${config.name} Online and listening for input\x1b[0m`);
  // Alternate setGame
  var i = 0;
  timer = client.setInterval(function () {
    switch (i%5) {
      case 4:   client.user.setGame(`on ${client.guilds.size} Guilds for ${client.users.size} Users`);break;
      case 3:   client.user.setGame(`Commands: !help`);                                               break;
      case 2:   client.user.setGame(`@Fshy#0986`);                                                    break;
      case 1:   client.user.setGame(`on arc.moe`);                                                    break;
      case 0:   client.user.setGame(`NieR: Automata™`);                                               break;
    }
    i++;
  },15000);
  // Log Current Stats
  client.setInterval(function () {
    var d = new Date(Date.now());
    console.log(`\n\x1b[32m[${d.getDate()}/${(d.getMonth()+1)}/${d.getFullYear()} | ${d.toLocaleTimeString()}]\x1b[0m Mem: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB | Users: ${client.users.size} | Guilds: ${client.guilds.size}`);
  },300000);
});

client.on('guildCreate', (guild)=>{
  if (guild.defaultChannel.permissionsFor(client.user).has('SEND_MESSAGES')) {//Has write permissions
  guild.defaultChannel.send({embed:new Discord.RichEmbed()
    .setTitle(`// ${client.user.username} is now serving ${guild.name}`)
    .setDescription(`
Thanks for adding me to your server!
Please have a look at my command list using **!help**
or for more detailed information at [GitHub](https://github.com/Fshy/FshyBot) | [arc.moe](http://arc.moe)

Currently running v${version} on a ${process.platform}-${process.arch} platform`)
    .setThumbnail(client.user.displayAvatarURL)
    .setColor(`${guild.me.displayHexColor!=='#000000' ? guild.me.displayHexColor : config.hexColour}`)});
  }
});

client.on('guildMemberAdd', (member) => {
  if (member.guild.defaultChannel.permissionsFor(client.user).has('SEND_MESSAGES')) {//Has write permissions
    member.guild.defaultChannel.send({embed:new Discord.RichEmbed()
      .setDescription(`${member.user.username} has joined the server.\nPlease welcome them to ${member.guild.name}`)
      .setThumbnail(member.user.displayAvatarURL)
      .setColor(`${member.guild.me.displayHexColor!=='#000000' ? member.guild.me.displayHexColor : config.hexColour}`)});
  }
});

client.on('presenceUpdate', (oldMember, newMember) => {
  if (!oldMember.user.bot) {//Not a Bot User - else null
    if (newMember.presence.game) {//A game status exists - else null
      if (newMember.presence.game.streaming) {//The new game status is a stream - else null
        if (oldMember.presence.game) {//Still playing a game - else now started a game
          if (!oldMember.presence.game.streaming) {//If user was streaming before update do nothing
            if (newMember.guild.defaultChannel.permissionsFor(client.user).has('SEND_MESSAGES')) {//Has write permissions
              newMember.guild.defaultChannel.send({embed:new Discord.RichEmbed()
                .setDescription(`${newMember.user.username} is now streaming **${newMember.presence.game.name}** at ${newMember.presence.game.url}`)
                .setThumbnail(newMember.user.displayAvatarURL)
                .setColor(`${newMember.guild.me.displayHexColor!=='#000000' ? newMember.guild.me.displayHexColor : config.hexColour}`)});
            }
          }
        }else {
          if (newMember.guild.defaultChannel.permissionsFor(client.user).has('SEND_MESSAGES')) {//Has write permissions
            newMember.guild.defaultChannel.send({embed:new Discord.RichEmbed()
              .setDescription(`${newMember.user.username} is now streaming **${newMember.presence.game.name}** at ${newMember.presence.game.url}`)
              .setThumbnail(newMember.user.displayAvatarURL)
              .setColor(`${newMember.guild.me.displayHexColor!=='#000000' ? newMember.guild.me.displayHexColor : config.hexColour}`)});
          }
        }
      }
    }
  }
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  if (oldMember.voiceChannel) {//Was in a voiceChannel
    if (newMember.voiceChannel !== oldMember.voiceChannel) {//If state changed, but channel remains the same i.e. Mute, Deafen
      if (newMember.voiceChannel) {//If moved to a new voiceChannel
        winston.log('info', `${newMember.user.username} moved from ${oldMember.voiceChannel.name} to ${newMember.voiceChannel.name}`, {guildID: oldMember.guild.id, type: 'voice'});
      }else {
        winston.log('info', `${newMember.user.username} disconnected from ${oldMember.voiceChannel.name}`, {guildID: oldMember.guild.id, type: 'voice'});
      }
    }
  }else {//Was not in a voiceChannel
    if (newMember.voiceChannel !== oldMember.voiceChannel) {//If connected to a new voiceChannel
      winston.log('info', `${newMember.user.username} connected to ${newMember.voiceChannel.name}`, {guildID: newMember.guild.id, type: 'voice'});
    }
  }
});

client.on('messageReactionAdd', (messageReaction,user)=>{
  if (user.bot) return;
  if (messageReaction.message.author.id!==client.user.id) return;
  switch (messageReaction.emoji.identifier) {
    case '%E2%8F%AF'://PlayPause
      let vconnec = client.voiceConnections.get(messageReaction.message.guild.defaultChannel.id);
      if (vconnec) {
        let dispatch = vconnec.player.dispatcher;
        if (dispatch){
          if (dispatch.speaking)
            dispatch.pause();
          else
            dispatch.resume();
        }
      }
      break;
    case '%E2%8F%B9'://Stop
      commands.stop(guildsMap,client,messageReaction.message);
      break;
    case '%F0%9F%94%81'://Repeat
      commands.repeat(ytdl,winston,guildsMap,client,user,messageReaction.message);
      break;
    case '%E2%9D%8C'://Leave
      commands.leave(guildsMap,client,messageReaction.message);
      break;
  }
});

client.on('messageReactionRemove', (messageReaction,user)=>{
  if (user.bot) return;
  if (messageReaction.message.author.id!==client.user.id) return;
  switch (messageReaction.emoji.identifier) {
    case '%E2%8F%AF'://PlayPause
      let vconnec = client.voiceConnections.get(messageReaction.message.guild.defaultChannel.id);
      if (vconnec) {
        let dispatch = vconnec.player.dispatcher;
        if (dispatch){
          if (dispatch.speaking)
            dispatch.pause();
          else
            dispatch.resume();
        }
      }
      break;
    case '%E2%8F%B9'://Stop
      commands.stop(guildsMap,client,messageReaction.message);
      break;
    case '%F0%9F%94%81'://Repeat
      commands.repeat(ytdl,winston,guildsMap,client,user,messageReaction.message);
      break;
    case '%E2%9D%8C'://Leave
      commands.leave(guildsMap,client,messageReaction.message);
      break;
  }
});

client.on('message', (message)=>{
  if(message.author.bot) return;

  // Receive DM
  if (message.channel.type===`dm`)
    return commands.chatbot(client,message.content.split(),message);

  // Chatbot
  if (message.content.startsWith(`2B`) || message.content.startsWith(`2b`)){
    console.log(`\x1b[36m[${message.guild}] \x1b[1m${message.author.username}: \x1b[0m${message.content}`);
    return commands.chatbot(client,message.content.split(/\s+/g).slice(1),message);
  }

  // Custom Prefixes
  // let guildPrefix = guildsMap.get(message.guild.id).prefix;
  let guildPrefix = config.prefix;
  if(!message.content.startsWith(guildPrefix)) return;

  // Command Parsing
  console.log(`\x1b[36m[${message.guild}] \x1b[1m${message.author.username}: \x1b[0m${message.content}`);
  let command = message.content.split(/\s+/g)[0].slice(guildPrefix.length);
  let args    = message.content.split(/\s+/g).slice(1);

  switch (command.toLowerCase()) {

    // TO-DO List
    // --1
    // Notes: These commands may not disabled themselves | Require MANAGE_GUILD Perms
    // case 'disable':     return commands.disableCommand(guildDB,guildsMap,guildPrefix,args,message);
    // case 'enable':      return commands.enableCommand(guildDB,guildsMap,guildPrefix,args,message);
    // --2
    // Apply a SEND_MESSAGES check before attempting output
    // --3
    // Adjust Embed Colours based on message type (success, error, warning, info)
    // --4
    // Music Queue
    // --5
    // Use createReactionCollector() to generate timed responses/polls

    // General
    case 'help':        return commands.help(guildPrefix,message);
    case 'ping':        return commands.ping(client,message);
    case 'stats':       return commands.stats(version,client,message);
    case 'version':     return commands.ver(version,guildPrefix,message);
    case 'invite':      return commands.invite(client,message);
    case 'say':         return commands.say(guildPrefix,message);
    case 'logs':        return commands.logs(args,message);

    // Owner Commands
    case 'update':      return commands.update(message);
    case 'broadcast':   return commands.broadcast(client,guildPrefix,args,message);

    // Admin Commands
    case 'setname':     return commands.setName(client,args,message);
    case 'setgame':     return commands.setGame(timer,client,args,message);
    case 'setavatar':   return commands.setAvatar(client,args,message);
    case 'setstatus':   return commands.setStatus(client,guildPrefix,args,message);
    // case 'setprefix':   return commands.setprefix(guildDB,guildsMap,guildPrefix,args,message);

    // Music
    // case 'controls':    return commands.controls(guildsMap,client,message);
    case 'join':        return commands.join(message);
    case 'play':        return commands.play(ytdl,winston,guildsMap,client,args,message);
    case 'stop':        return commands.stop(guildsMap,client,message);
    case 'pause':       return commands.pause(client,message);
    case 'resume':      return commands.resume(client,message);
    case 'leave':       return commands.leave(guildsMap,client,message);
    case 'stream':      return commands.stream(client,args,message);
    case 'radio':       return commands.radio(client,guildPrefix,guildsMap,args,message);
    case 'np':
    case 'nowplaying':  return commands.nowPlaying(guildsMap,message);

    // PUBG
    case 'pubg':        return commands.pubg(scraper,args,message);

    // Web APIs
    case 'r':           return commands.rslash(reddit,guildPrefix,message,args);
    case 'crypto':      return commands.coin(args,message);
    case 'insta':       return commands.insta(args,message);

    // Anime/NSFW
    case 'anime':       return commands.anime(args,message);
    case 'sfw':         return commands.danbooru(args,`s`,100,message);
    case 'nsfw':
    case 'lewd':        return commands.danbooru(args,`e`,100,message);
    case 'tags':        return commands.danbooruTags(args,message);
    case '2b':          return commands.img2B(args,message);
    case 'smug':        return commands.smug(message);

    // Misc
    case 'calc':        return commands.calc(math,args,message);
    case 'roll':        return commands.roll(args,message);

  }

});
