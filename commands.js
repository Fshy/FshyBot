const request   = require('request');
const Discord   = require('discord.js');
const config    = require('./config.json');

module.exports = {
  rules: function (client,message) {
    var r = `
      1. This is an assignment-free zone
      2. If your mic echoes, you're fucking banned
      ~~3. No loitering in the lobby~~
      ~~4. No asking for Server Icons~~
      ~~5. If you have to ask for icons, ask Fshy~~
      6. Don't be a faggot
      7. Get Gud`;
      var embed = new Discord.RichEmbed()
        .setTitle(`Rules:`)
        .setDescription(r)
        .setColor(15514833);
      message.channel.sendEmbed(embed);
      message.delete();
  },
  help: function (client,message) {
    var h = `
      **!rules**\t- Displays the guild rules
      **!help**\t- Displays all available commands
      **!ping**\t- Displays response time to server
      **!uptime**\t- Displays time since launch
      **!setname    [name]**\t- [ADMIN] Sets the username of the bot, limited to 2 requests/hr
      **!setgame    [game]**\t- [ADMIN] Sets the "Playing" text for the bot, leave blank to clear
      **!setavatar  [image url]**\t- [ADMIN] Sets the avatar of te bot from an image url
      **!setstatus  [status]**\t- [ADMIN] Sets the status of the bot

      **!play [title/link]**\t- Searches and queues the given term/link for playback
      **!playlist [playlistId]**\t- Queues all videos from a youtube playlist
      **!skip [number]**\t- Skip some number of songs or 1 song if a number is not specified
      **!queue**\t- Display the current queue
      **!leave**\t- Clears the song queue and leaves the channel

      **!lewd [search term]**\t- Uploads a random NSFW image of the given search term
      **!sfw  [search term]**\t- Uploads a random SFW image of the given search term
      **!tags [search term]**\t- Searches Danbooru for possible related search tags
      **!2B [nsfw]**\t- Uploads a 2B image, or a NSFW version if supplied

      **!btc**\t- Displays current Bitcoin spot price
      **!eth**\t- Displays current Ethereum spot price
      **!r    [subreddit]**\t- Uploads a random image from the frontpage of a given subreddit
      **!roll [sides] [num]**\t- Rolls an n-sided die, m times and displays the result

      For source code and other dank memes check [GitHub](https://github.com/Fshy/FshyBot) | [arc.moe](http://arc.moe)`;
      var embed = new Discord.RichEmbed()
        .setTitle(`${config.name} Commands:`)
        .setDescription(h)
        .setImage(`http://i.imgur.com/a96NGOY.png`)
        .setFooter(`Updated at`)
        .setTimestamp()
        .setColor(15514833);
      message.channel.sendEmbed(embed);
      message.delete();
  },
  version: function (version,message) {
    request('https://raw.githubusercontent.com/Fshy/FshyBot/master/package.json', function (error, response, body) {
      response = JSON.parse(body);
      if (error!=null) {
        message.channel.sendEmbed({description: 'ERROR: Could not access repository',color: 15514833});
      }else {
        if (response.version!=version) {
          message.channel.sendEmbed({description: `Currently Running v${version}\nNightly Build: v${response.version}\n\n:warning: *Navigate to your installation folder and use **git pull** to update | [Changelog](https://github.com/Fshy/FshyBot/commits/master)*`,color: 15514833});
        }else {
          message.channel.sendEmbed({description: `Currently Running v${version}\nNightly Build: v${response.version}\n\n:white_check_mark: *I'm fully updated to the latest build | [Changelog](https://github.com/Fshy/FshyBot/commits/master)*`,color: 15514833});
        }
      }
    });
  },
  uptime: function (client,message) {
    var time = client.uptime;
    time = parseInt(time/1000);
    var seconds = time % 60;
    time = parseInt(time/60);
    var minutes = time % 60;
    time = parseInt(time/60);
    var hours = time % 24;
    time = parseInt(time/24);
    var days = time;
    message.channel.sendEmbed({description: `Uptime: ${days} days ${hours} hrs ${minutes} mins ${seconds} sec`,color: 15514833});
  },
  btc: function (message) {
    request('https://coinmarketcap-nexuist.rhcloud.com/api/btc', function (error, response, body) {
      response = JSON.parse(body);
      var change='';
      if (error!=null) {
        message.channel.sendEmbed({description: 'ERROR: Could not access coinmarketcap API',color: 15514833});
      }else {
        if (response.change<0) {
          change = '▼';
        }else {
          change = '▲';
        }
        message.channel.sendEmbed({description: `Current BTC Price: $${response.price.usd.toFixed(2)}\nChange: ${change}$${response.change}`,color: 15514833});
      }
    });
  },
  eth: function (message) {
    request('https://coinmarketcap-nexuist.rhcloud.com/api/eth', function (error, response, body) {
      response = JSON.parse(body);
      var change='';
      if (error!=null) {
        message.channel.sendEmbed({description: 'ERROR: Could not access coinmarketcap API',color: 15514833});
      }else {
        if (response.change<0) {
          change = '▼';
        }else {
          change = '▲';
        }
        message.channel.sendEmbed({description: `Current ETH Price: $${response.price.usd.toFixed(2)}\nChange: ${change}$${response.change}`,color: 15514833});
      }
    });
  },
  playlist: function (args,message) {
    var list = args[0];
    request(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&key=${config.youtube.apiKey}&maxResults=50&playlistId=${list}`, function (error, response, body) {
      body = JSON.parse(body);
      if (error!=null) {
        message.channel.sendEmbed({description: 'ERROR: Could not access YouTube API',color: 15514833});
      }else {
        message.member.voiceChannel.join();
        for (var i = 0; i < body.items.length; i++) {
          message.channel.sendMessage(`!play ${body.items[i].snippet.resourceId.videoId}`).then(message => message.delete());
        }
      }
    });
  },
  roll: function (args,message) {
    var res = 0;
    var sides = 6;
    var num = 1;
    var n;
    if (args[0]) {
      var sides = args[0];
      if (args[1]) {
        var num = args[1];
      }
    }
    var output = `Rolled a ${sides}-sided die ${num} times:\n`;
    for (var i = 0; i < num; i++) {
      n = Math.floor(Math.random() * sides) + 1;
      output += `[${n}] `;
      res += n;
    }
    output += "= "+res;
    message.channel.sendEmbed({description: output,color: 15514833});
  },
  getSubredditImages: function (reddit,message,subreddit) {
    reddit.getSubreddit(subreddit).getHot().then(function (data) {
      if (data) {
        var urls = [];
        for (var i = 0; i < 10; i++) { //Top 10 sorted by Hot
          if ((/\.(jpe?g|png|gif|bmp)$/i).test(data[i].url)) { //If matches image file push to array
            urls.push(data[i]);
          }
        }
        var random = Math.floor(Math.random() * urls.length);//Picks one randomly to post
        var embed = new Discord.RichEmbed().setImage(urls[random].url).setDescription(`${urls[random].title}\n[Source](http://reddit.com${urls[random].permalink})`).setColor(15514833);
        message.channel.sendEmbed(embed);
      }else {

      }
    });
  },
  danbooru: function (tag,rating,amount,message) {
    if (tag.toLowerCase().match(/kanna/g) || tag.toLowerCase().match(/kamui/g) &&rating==='e') {
      message.channel.sendEmbed({description: 'Don\'t lewd the dragon loli',color: 15514833});
      return;
    }
    request(`http://danbooru.donmai.us/posts.json?tags=*${tag}*+rating%3A${rating}+limit%3A${amount}`, function (error, response, body) {
      body = JSON.parse(body);
      if (error!=null) {
        message.channel.sendEmbed({description: 'ERROR: Could not access Danbooru API',color: 15514833});
      }else {
        var random = Math.floor(Math.random() * body.length);//Picks one randomly to post
        if (body[random]) {
          var embed = new Discord.RichEmbed().setImage(`http://danbooru.donmai.us${body[random].file_url}`).setDescription(`[Source](${body[random].source})`).setColor(15514833);
          message.channel.sendEmbed(embed);
        }else {
          var suggestions = `ERROR: Could not find any posts matching ${tag}\nTry using the ${config.prefix}tags [search term] command to narrow down the search`;
          message.channel.sendEmbed({description: suggestions,color: 15514833});
        }
      }
    });
  },
  danbooruTags: function (tag,message) {
    request(`http://danbooru.donmai.us/tags/autocomplete.json?search[name_matches]=*${tag}*`, function (e, r, b) {
      var suggestions = '';
      b = JSON.parse(b);
      if (b[0]!=null) {
        suggestions += 'Related tags:\n\n';
        for (var i = 0; i < b.length; i++) {
          suggestions += b[i].name;
          suggestions += '\n';
        }
      }else {
        suggestions = `No tags found for ${tag}`;
      }
      message.channel.sendEmbed({description: suggestions,color: 15514833});
    });
  },
  checkRole: function (message, requiredRole) {
    var role = message.guild.roles.find('name',requiredRole);
    if (message.member.roles.has(role.id)) {
      return true;
    }else {
      message.channel.sendEmbed({description: `ERROR: Insufficient permissions to perform that command\nRequired Role: ${requiredRole}`,color: 15514833});
      return false;
    }
  }
};
