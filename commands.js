const request   = require('request');
const Instafeed = require("instafeed.js");
const config    = require('./config.json');

module.exports = {
  help: function (message) {
    return message.channel.sendEmbed({
        description: `__**2B | FshyBot**__

          __**Rules:**__
          1. This is an assignment-free zone
          2. If your mic echoes, you're fucking banned
          ~~3. No loitering in the lobby~~
          ~~4. No asking for Server Icons~~
          ~~5. If you have to ask for icons, ask Fshy~~
          6. Don't be a faggot
          7. Get Gud

          __**FAQ:**__
          ???

          __**Commands:**__
          **!help**\t- Displays all available commands.
          **!ping**\t- Displays latency between the bot and the server.
          **!uptime**\t- Displays time since launch.

          **!btc**\t- Displays current Bitcoin spot price
          **!eth**\t- Displays current Ethereum spot price
          **!search \<term\>**\t- Utilizes DuckDuckGo API for an instant answer

          **!play \<search term | link\>**\t- Searches and queues the given term/link for playback
          **!playlist \<playlistId\>**\t- Queues all videos from a youtube playlist
          **!skip \<number\>**\t- Skip some number of songs or 1 song if a number is not specified
          **!queue**\t- Display the current queue
          **!leave**\t- Clears the song queue and leaves the channel

          For source code and other dank memes check [arc.moe](https://arc.moe)`,
        color: 15473237
      });
  },
  uptime: function (launchTime,message) {
    var time = Date.now()-launchTime;
    time = parseInt(time/1000);
    var seconds = time % 60;
    time = parseInt(time/60);
    var minutes = time % 60;
    time = parseInt(time/60);
    var hours = time % 24;
    message.channel.sendMessage('Uptime: \`'+hours+' hrs '+minutes+' mins '+seconds+' sec\`');
  },
  btc: function (message) {
    request('https://coinmarketcap-nexuist.rhcloud.com/api/btc', function (error, response, body) {
      response = JSON.parse(body);
      if (error!=null) {
        message.channel.sendMessage('\`ERROR: Could not access coinmarketcap API\`');
      }else {
        message.channel.sendMessage('Current BTC Price: \`$'+response.price.usd.toFixed(2)+'\`');
      }
    });
  },
  eth: function (message) {
    request('https://coinmarketcap-nexuist.rhcloud.com/api/eth', function (error, response, body) {
      response = JSON.parse(body);
      if (error!=null) {
        message.channel.sendMessage('\`ERROR: Could not access coinmarketcap API\`');
      }else {
        message.channel.sendMessage('Current ETH Price: \`$'+response.price.usd.toFixed(2)+'\`');
      }
    });
  },
  search: function (args,message) {
    var a = args.join("%20");
    request('http://api.duckduckgo.com/?q='+a+'&format=json', function (error, response, body) {
      body = JSON.parse(body);
      if (error!=null) {
        message.channel.sendMessage('\`ERROR: Could not access DuckDuckGo API\`');
      }else {
        if (body.Abstract) {
          message.channel.sendMessage('```Markdown\n#'+body.Heading+':\n'+body.Abstract+'```');
        }else {
          message.channel.sendMessage('\`No Instant Answer Available\`');
        }
      }
    });
  },
  playlist: function (args,message) {
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
  },
  register: function (message) {
    request('https://api.myjson.com/bins/'+config.jsonDB, function (error, response, body) {
      res = JSON.parse(body);
      var exists = false;
      if (error!=null) {
        message.channel.sendMessage('\`ERROR: Could not access database\`');
      }else {
        for (var i = 0; i < res.user.length; i++) {
          if (res.user[i].id===message.author.id) {
            message.channel.sendMessage('\`ERROR: User already exists in database\`');
            exists = true;
          }
        }
        if (!exists) {
          res.user.push({id: message.author.id, name:message.author.username, currency:5000});
          request({ url: 'https://api.myjson.com/bins/'+config.jsonDB, method: 'PUT', json: res});
          message.channel.sendMessage('Registered new wallet for <@'+message.author.id+'>');
        }
      }
    });
  },
  wallet: function (args,message) {
    request('https://api.myjson.com/bins/'+config.jsonDB, function (error, response, body) {
      res = JSON.parse(body);
      if (error!=null) {
        message.channel.sendMessage('\`ERROR: Could not access database\`');
      }else {
        var exists = false;
        if (args[0]) {
          var id = args[0].replace(/\D/g, '');
          for (var i = 0; i < res.user.length; i++) {
            if (res.user[i].id===id) {
              exists = true;
              message.channel.sendMessage('Currency: $'+res.user[i].currency);
            }
          }
          if (!exists) {
            message.channel.sendMessage('\`ERROR: User not found in database | Use !register to get started!\`');
          }
        }else{
          for (var i = 0; i < res.user.length; i++) {
            if (res.user[i].id===message.author.id) {
              exists = true;
              message.channel.sendMessage('Currency: $'+res.user[i].currency);
            }
          }
          if (!exists) {
            message.channel.sendMessage('\`ERROR: User not found in database | Use !register to get started!\`');
          }
        }
      }
    });
  },
  walletadd: function (args,message) {
    request('https://api.myjson.com/bins/'+config.jsonDB, function (error, response, body) {
      var res = JSON.parse(body);
      if (error!=null) {
        message.channel.sendMessage('\`ERROR: Could not access database\`');
      }else {
        var exists = false;
        if (args.length!=2) {
          message.channel.sendMessage('\`ERROR: Incorrect Format => !walletadd <@user> <amount>\`');
        }else {
          var id = args[0].replace(/\D/g, '');
          for (var i = 0; i < res.user.length; i++) {
            if (res.user[i].id===id) {
              exists = true;
              res.user[i].currency += parseInt(args[1]);
              message.channel.sendMessage('Added $'+parseInt(args[1])+' to '+message.mentions.users.get(id)+'\'s account | New Balance: $'+res.user[i].currency)
              .then(request({ url: 'https://api.myjson.com/bins/'+config.jsonDB, method: 'PUT', json: res }));
            }
          }
          if (!exists) {
            message.channel.sendMessage('\`ERROR: User not found in database | Use !register to get started!\`');
          }
        }
      }
    });
  },
  insta: function (args,message) {
    var username=args[0];
    request('https://www.instagram.com/'+username+'/?__a=1', function (error, response, body) {
      res = JSON.parse(body);
      var imgs = [];
      var feed = new Instafeed({
        get: 'user',
        userId: res.user.id,
        limit: '3',
        sortBy: 'most-liked',
        resolution: 'standard_resolution',
        clientId: config.IGclientId,
        accessToken: config.IGaccesstoken,
        // template:'{{image}}',
        mock:true,
        success: function (data) {
          var images = data.data, result, i, image;
          for (i = 0; i < images.length; i++) {
            console.log(images[i]);
          }
        }
      });
      feed.run();
      // console.log(feed);
    });
  }
};
