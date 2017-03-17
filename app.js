const request = require('request');
const Discord = require('discord.js');
const music   = require('discord.js-music-v11');
const config  = require('./config.json');
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

  let command = message.content.split(" ")[0];
  command = command.slice(prefix.length);
  let args = message.content.split(" ").slice(1);

  // !help = Displays all available commands
  if(command === 'help'){
    message.channel.sendMessage('Commands: \`!help !ping !uptime !btc !eth\`');
  }else

  // !ping = Displays latency between user and bot
  if(command === 'ping'){
    message.channel.sendMessage('Response Time between '+message.author+' and '+name+': \`'+(Date.now()-message.createdTimestamp)+'ms\`');

  }else

  // !uptime = Displays time since launch
  if(command === 'uptime'){
    var time = Date.now()-launchTime;
    time = parseInt(time/1000);
    var seconds = time % 60;
    time = parseInt(time/60);
    var minutes = time % 60;
    time = parseInt(time/60);
    var hours = time % 24;
    message.channel.sendMessage('Uptime: \`'+hours+' hrs '+minutes+' mins '+seconds+' sec\`');
  }else

  // !btc - Displays current Bitcoin spot price
  if(command === 'btc'){
    request('https://coinmarketcap-nexuist.rhcloud.com/api/btc', function (error, response, body) {
      response = JSON.parse(body);
      if (error!=null) {
        message.channel.sendMessage('\`ERROR: Could not access coinmarketcap API\`');
      }else {
        message.channel.sendMessage('Current BTC Price: \`$'+response.price.usd.toFixed(2)+'\`');
      }
    });
  }else

  // !eth - Displays current Ethereum spot price
  if(command === 'eth'){
    request('https://coinmarketcap-nexuist.rhcloud.com/api/eth', function (error, response, body) {
      response = JSON.parse(body);
      if (error!=null) {
        message.channel.sendMessage('\`ERROR: Could not access coinmarketcap API\`');
      }else {
        message.channel.sendMessage('Current ETH Price: \`$'+response.price.usd.toFixed(2)+'\`');
      }
    });
  }else

  // !search - Utilizes DDG API for an instant answer
  if(command === 'search'){
    var a = args.join("%20");
    request('http://api.duckduckgo.com/?q='+a+'&format=json', function (error, response, body) {
      body = JSON.parse(body);
      if (error!=null) {
        message.channel.sendMessage('\`ERROR: Could not access DuckDuckGo API\`');
      }else {
        // console.log(response);
        if (body.Abstract) {
          message.channel.sendMessage('```Markdown\n#'+body.Heading+':\n'+body.Abstract+'```');
        }else {
          message.channel.sendMessage('\`No Instant Answer Available\`');
        }
      }
    });
  }else

  // !playlist <playlistId> - Utilizes DDG API for an instant answer
  if(command === 'playlist'){
    var list = args[0];
    request('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&key='+config.googleAPIkey+'&maxResults=50&playlistId='+list, function (error, response, body) {
      body = JSON.parse(body);
      if (error!=null) {
        message.channel.sendMessage('\`ERROR: Could not access Google API\`');
      }else {
        message.member.voiceChannel.join();
        for (var i = 0; i < body.items.length; i++) {
          message.channel.sendMessage('!play '+body.items[i].snippet.resourceId.videoId).then(message => message.delete());
        }
      }
    });
  }

  // !getbal <username> - Finds user balance
  if(command === 'getbal'){
    console.log('https://api.myjson.com/bins/'+config.jsonDB);
    request('https://api.myjson.com/bins/'+config.jsonDB, function (error, response, body) {
      res = JSON.parse(body);
      if (error!=null) {
        message.channel.sendMessage('\`ERROR: Could not access database\`');
      }else {
        if (args[0]) {
          var id = args[0].replace(/\D/g, '');
          for (var i = 0; i < res.user.length; i++) {
            if (res.user[i].id===id) {
              message.channel.sendMessage('Currency: $'+res.user[i].currency);
              console.log(body.user[i].currency);
            }
          }
        }else{
          for (var i = 0; i < res.user.length; i++) {
            if (res.user[i].id===message.author.id) {
              message.channel.sendMessage('Currency: $'+res.user[i].currency);
              console.log(res.user[i].currency);
            }
          }
        }

      }
    });
  }else

  // !addbal <username> <amount> - Adds to User
  if(command === 'addbal'){
    request('https://api.myjson.com/bins/'+config.jsonDB, function (error, response, body) {
      var res = JSON.parse(body);
      if (error!=null) {
        message.channel.sendMessage('\`ERROR: Could not access database\`');
      }else {
        if (args.length!=2) {
          message.channel.sendMessage('\`ERROR: Incorrect Format => !addbal <@user> <amount>\`');
        }else {
          var id = args[0].replace(/\D/g, '');
          for (var i = 0; i < res.user.length; i++) {
            if (res.user[i].id===id) {
              res.user[i].currency += parseInt(args[1]);
              message.channel.sendMessage('Added $'+parseInt(args[1])+' to '+message.mentions.users.get(id)+'\'s account | New Balance: $'+res.user[i].currency)
              .then(request({ url: 'https://api.myjson.com/bins/'+config.jsonDB, method: 'PUT', json: res }));
            }
          }
        }
      }
    });
  }

});

music(bot);

bot.login(token);
