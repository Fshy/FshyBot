const request = require('request');
const Discord = require('discord.js');
const music   = require('discord.js-music-v11');
const config  = require('./config.json');
const commands= require('./commands');
const bot     = new Discord.Client();

const token   = config.token;
const prefix  = config.prefix;
const name    = config.name;
const game    = config.game;

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
  if(command === 'help'){
    commands.help(message);
  }else

  // !ping = Displays latency between the bot and the server
  if(command === 'ping'){
    message.channel.sendMessage('Response Time between '+message.author+' and '+name+': \`'+(Date.now()-message.createdTimestamp)+'ms\`');
  }else

  // !uptime = Displays time since launch
  if(command === 'uptime'){
    commands.uptime(launchTime,message);
  }else

  // !btc - Displays current Bitcoin spot price
  if(command === 'btc'){
    commands.btc(message);
  }else

  // !eth - Displays current Ethereum spot price
  if(command === 'eth'){
    commands.eth(message);
  }else

  // !search <term> - Utilizes DDG API for an instant answer
  if(command === 'search'){
    commands.search(args,message);
  }else

  // !playlist <playlistId> - Queues all videos from a youtube playlist
  if(command === 'playlist'){
    commands.playlist(args,message);
  }

  // !register - Registers user to db
  if(command === 'register'){
    commands.register(message);
  }

  // !wallet <username> - Finds user balance
  if(command === 'wallet'){
    commands.wallet(args,message);
  }else

  // !walletadd <username> <amount> - Adds to User
  if(command === 'walletadd'){
    commands.walletadd(args,message);
  }

});

music(bot);

bot.login(token);
