const request   = require('request');
const Discord   = require('discord.js');
const config    = require('./config.json');

class Commands {

  rules(client,message) {
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
        .setColor(config.decimalColour);
      message.channel.sendEmbed(embed);
      message.delete();
  }

  help(client,message) {
    var h = `
      -- General
      **!rules** - Displays the guild rules
      **!help** - Displays all available commands
      **!ping** - Displays response time to server
      **!uptime** - Displays time since launch
      **!version** - Checks for updates to the bot

      -- Admin
      **!update** - Updates to the master branch
      **!setname    [name]** - Sets the username of the bot
      **!setgame    [game]** - Sets the "Playing" text for the bot
      **!setavatar  [image url]** - Sets the avatar of the bot
      **!setstatus  [status]** - Sets the status of the bot

      -- Music
      **!play [title/link]** - Searches and queues the given term/link
      **!playlist [playlistId]** - Queues all videos from a youtube playlist
      **!skip [number]** - Skip some number of songs or 1 song if not specified
      **!queue** - Display the current queue
      **!leave** - Clears the song queue and leaves the channel

      -- Anime/NSFW
      **!lewd [search term]** - Uploads a random NSFW image of the term
      **!sfw  [search term]** - Uploads a random SFW image of the term
      **!tags [search term]** - Searches Danbooru for related search tags
      **!2B [nsfw]** - Uploads a 2B image, or a NSFW version if supplied

      -- Misc
      **!btc** - Displays current Bitcoin spot price
      **!eth** - Displays current Ethereum spot price
      **!calc [expression]** - Evaluates a given expression
      **!r    [subreddit]** - Uploads a random image from a given subreddit
      **!roll [n] [m]** - Rolls an n-sided die, m times and displays the result

      -- Chatbot
      2B answers her callsign in response to the user
      Eg. 2B How are you? | 2B What's the time?

      For source code and other dank memes check [GitHub](https://github.com/Fshy/FshyBot) | [arc.moe](http://arc.moe)`;
      var embed = new Discord.RichEmbed()
        .setTitle(`Commands:`)
        .setDescription(h)
        .setImage('http://i.imgur.com/a96NGOY.png')
        .setColor(config.decimalColour);
      message.channel.sendEmbed(embed);
      message.delete();
  }

  ping(client,message){
    message.channel.sendEmbed({description: `Response time to discord server: ${Math.round(client.ping)}ms`,color: config.decimalColour});
  }

  version(version,message) {
    request('https://raw.githubusercontent.com/Fshy/FshyBot/master/package.json', function (error, response, body) {
      response = JSON.parse(body);
      if (error!=null) {
        message.channel.sendEmbed({description: 'ERROR: Could not access repository',color: config.decimalColour});
      }else {
        if (response.version!=version) {
          message.channel.sendEmbed({description: `Currently Running v${version}\nNightly Build: v${response.version}\n\n:warning: *Use **!update** to fetch master branch and restart bot | [Changelog](https://github.com/Fshy/FshyBot/commits/master)*`,color: config.decimalColour});
        }else {
          message.channel.sendEmbed({description: `Currently Running v${version}\nNightly Build: v${response.version}\n\n:white_check_mark: *I'm fully updated to the latest build | [Changelog](https://github.com/Fshy/FshyBot/commits/master)*`,color: config.decimalColour});
        }
      }
    });
  }

  stats(version,client,message){
    var embed = new Discord.RichEmbed()
      .setTitle(`2B | FshyBot Statistics:`)
      .setDescription(`Currently serving **${client.users.size}** user${client.users.size>1 ? 's':''} on **${client.guilds.size}** guild${client.guilds.size>1 ? 's':''}`)
      .addField(`Ping`,`${Math.round(client.ping)}ms`,true)
      .addField(`Uptime`,`${parseInt(client.uptime/86400000)}:${parseInt(client.uptime/3600000)%24}:${parseInt(client.uptime/60000)%60}:${parseInt(client.uptime/1000)%60}`,true)
      .addField(`Build`,`v${version}`,true)
      .addField(`Memory Usage`,`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,true)
      .addField(`Platform`,`${process.platform}`,true)
      .addField(`Architecture`,`${process.arch}`,true)
      .setColor(config.decimalColour);
    message.channel.sendEmbed(embed);
  }

  uptime(client,message) {
    var time = client.uptime;
    time = parseInt(time/1000);
    var seconds = time % 60;
    time = parseInt(time/60);
    var minutes = time % 60;
    time = parseInt(time/60);
    var hours = time % 24;
    time = parseInt(time/24);
    var days = time;
    message.channel.sendEmbed({description: `Uptime: ${days} days ${hours} hrs ${minutes} mins ${seconds} sec`,color: config.decimalColour});
  }

  btc(message) {
    request('https://coinmarketcap-nexuist.rhcloud.com/api/btc', function (error, response, body) {
      response = JSON.parse(body);
      var change='';
      if (error!=null) {
        message.channel.sendEmbed({description: 'ERROR: Could not access coinmarketcap API',color: config.decimalColour});
      }else {
        if (response.change<0) {
          change = '▼';
        }else {
          change = '▲';
        }
        message.channel.sendEmbed({description: `Current BTC Price: $${response.price.usd.toFixed(2)}\nChange: ${change}$${response.change}`,color: config.decimalColour});
      }
    });
  }

  eth(message) {
    request('https://coinmarketcap-nexuist.rhcloud.com/api/eth', function (error, response, body) {
      response = JSON.parse(body);
      var change='';
      if (error!=null) {
        message.channel.sendEmbed({description: 'ERROR: Could not access coinmarketcap API',color: config.decimalColour});
      }else {
        if (response.change<0) {
          change = '▼';
        }else {
          change = '▲';
        }
        message.channel.sendEmbed({description: `Current ETH Price: $${response.price.usd.toFixed(2)}\nChange: ${change}$${response.change}`,color: config.decimalColour});
      }
    });
  }

  playlist(args,message) {
    var list = args[0];
    request(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&key=${config.youtube.apiKey}&maxResults=50&playlistId=${list}`, function (error, response, body) {
      body = JSON.parse(body);
      if (error!=null) {
        message.channel.sendEmbed({description: 'ERROR: Could not access YouTube API',color: config.decimalColour});
      }else {
        message.member.voiceChannel.join();
        for (var i = 0; i < body.items.length; i++) {
          message.channel.sendMessage(`!play ${body.items[i].snippet.resourceId.videoId}`).then(message => message.delete());
        }
      }
    });
  }

  roll(args,message) {
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
    message.channel.sendEmbed({description: output,color: config.decimalColour});
  }

  danbooru(args,rating,amount,message) {
    var tag = args.join('_');
    if ((tag.toLowerCase().match(/kanna/g) && rating==='e') || (tag.toLowerCase().match(/kamui/g) && rating==='e')) {
      message.channel.sendEmbed({description: 'Don\'t lewd the dragon loli',color: config.decimalColour});
      return;
    }
    request(`http://danbooru.donmai.us/posts.json?tags=*${tag}*+rating%3A${rating}+limit%3A${amount}`, function (error, response, body) {
      body = JSON.parse(body);
      if (error!=null) {
        message.channel.sendEmbed({description: 'ERROR: Could not access Danbooru API',color: config.decimalColour});
      }else {
        var random = Math.floor(Math.random() * body.length);//Picks one randomly to post
        if (body[random]) {
          var embed = new Discord.RichEmbed().setImage(`http://danbooru.donmai.us${body[random].file_url}`).setDescription(`[Source](${body[random].source})`).setColor(config.decimalColour);
          message.channel.sendEmbed(embed);
        }else {
          var suggestions = `ERROR: Could not find any posts matching ${tag}\nTry using the ${config.prefix}tags [search term] command to narrow down the search`;
          message.channel.sendEmbed({description: suggestions,color: config.decimalColour});
        }
      }
    });
  }

  danbooruTags(args,message) {
    var tag = args.join('_');
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
      message.channel.sendEmbed({description: suggestions,color: config.decimalColour});
    });
  }

  rslash(reddit,message,args) {
    if (args[0]) {
      reddit.getSubreddit(args[0]).getHot().then(function (data) {
        if (data) {
          var urls = [];
          for (var i = 0; i < 10; i++) { //Top 10 sorted by Hot
            if ((/\.(jpe?g|png|gif|bmp)$/i).test(data[i].url)) { //If matches image file push to array
              urls.push(data[i]);
            }
          }
          if (urls.length!=0) {
            var random = Math.floor(Math.random() * urls.length);//Picks one randomly to post
            var embed = new Discord.RichEmbed().setImage(urls[random].url).setDescription(`${urls[random].title}\n[Source](http://reddit.com${urls[random].permalink})`).setColor(config.decimalColour);
            message.channel.sendEmbed(embed);
          }else {
            message.channel.sendEmbed({description: `Sorry, no images could be found on r/${args[0]}`,color: config.decimalColour});
          }
        }else {
          message.channel.sendEmbed({description: 'ERROR: Could not retrieve subreddit data',color: config.decimalColour});
        }
      });
    }else {
      message.channel.sendEmbed({description: 'ERROR: No subreddit specified | Use !r [subreddit]',color: config.decimalColour});
    }
  }

  img2B(args,message){
    if(args[0]==='nsfw')
      this.danbooru(['yorha_no._2_type_b'],'e',100,message);
    else
      this.danbooru(['yorha_no._2_type_b'],'s',100,message);
  }

  checkRole(message){
    var role = false;
    role = message.guild.roles.get(config.adminRoleID);
    if (role===undefined) {
      return false;
    }else {
      return true;
    }
  }

  checkOwner(message){
    return (message.author.id===config.ownerID);
  }

  setName(client,args,message){
    if (this.checkRole(message)) {
      if (args[0]) {
        var name = args.join(' ');
        client.user.setUsername(name).then(message.channel.sendEmbed({description: `Name successfully updated!`,color: config.decimalColour}));
      }else {
        message.channel.sendEmbed({description: `ERROR: Specify a string to change username to`,color: config.decimalColour});
      }
    }else {
      message.channel.sendEmbed({description: `ERROR: Insufficient permissions to perform that command`,color: config.decimalColour});
    }
  }

  setGame(client,args,message){
    if (this.checkRole(message)) {
      if (args[0]) {
        var game = args.join(' ');
        client.user.setGame(game).then(message.channel.sendEmbed({description: `Game successfully updated!`,color: config.decimalColour}));
      }else {
        client.user.setGame(null).then(message.channel.sendEmbed({description: `Game successfully cleared!`,color: config.decimalColour}));
      }
    }else {
      message.channel.sendEmbed({description: `ERROR: Insufficient permissions to perform that command`,color: config.decimalColour});
    }
  }

  setStatus(client,args,message){
    if (this.checkRole(message)) {
      if (args[0]==='online' || args[0]==='idle' || args[0]==='invisible' || args[0]==='dnd') {
        client.user.setStatus(args[0]).then(message.channel.sendEmbed({description: `Status successfully updated!`,color: config.decimalColour}));
      }else {
        message.channel.sendEmbed({description: `ERROR: Incorrect syntax | Use !setstatus [status]\nStatuses: online, idle, invisible, dnd`,color: config.decimalColour});
      }
    }else {
      message.channel.sendEmbed({description: `ERROR: Insufficient permissions to perform that command`,color: config.decimalColour});
    }
  }

  setAvatar(client,args,message){
    if (this.checkRole(message)) {
      if ((/\.(jpe?g|png|gif|bmp)$/i).test(args[0])) {
        client.user.setAvatar(args[0]).then(message.channel.sendEmbed({description: `Avatar successfully updated!`,color: config.decimalColour}));
      }else {
        message.channel.sendEmbed({description: `ERROR: That's not an image filetype I recognize | Try: .jpg .png .gif .bmp`,color: config.decimalColour});
      }
    }else {
      message.channel.sendEmbed({description: `ERROR: Insufficient permissions to perform that command`,color: config.decimalColour});
    }
  }

  getGbp(userDB,message){
    userDB.once("value", (data) => {
      var users = data.val();
      if (users) {
        var keys = Object.keys(users);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if (users[key].id===message.author.id) {
            message.channel.sendEmbed({description: `:moneybag: ${message.author.username}'s Balance: ${users[key].gbp} GBP`,color: config.decimalColour});
            return;
          }
        }
      }
      userDB.push({id: message.author.id,gbp: 1000});
      message.channel.sendEmbed({description: `Registered new user ${message.author.username} with 1000 GBP`,color: config.decimalColour});
    });
  }

  addGbp(userDB,guild){
    guild.fetchMembers().then(function (data) {
      var onlineUsers = [];
      for(var u of data.presences.keys()){
        onlineUsers.push(u);
      }
      userDB.once("value", (data) => {
        var users = data.val();
        if (users) {
          var keys = Object.keys(users);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (onlineUsers.includes(users[key].id)) {
              var gbp = users[key].gbp + 1;
              userDB.child(key).update({"gbp": gbp});
            }
          }
        }
      });
    });
  }

  betGbp(userDB,args,message){
    var wager = Number.parseInt(args[0]);
    if (wager>0) {
      var roll = Math.floor(Math.random() * 100) + 1;
      userDB.once("value", (data) => {
        var users = data.val();
        if (users) {
          var keys = Object.keys(users);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (users[key].id===message.author.id) {
              if (users[key].gbp<wager) {
                message.channel.sendEmbed({description: `ERROR: Insufficient Funds | Your Balance: ${users[key].gbp}`,color: config.decimalColour});
              }else {
                if (roll<50) {
                  userDB.child(key).update({"gbp": users[key].gbp - wager});
                  message.channel.sendEmbed({description: `:anger: Sorry, You Rolled ${roll}/100 | New Balance: ${users[key].gbp-wager}`,color: config.decimalColour});
                }else {
                  userDB.child(key).update({"gbp": users[key].gbp + wager});
                  message.channel.sendEmbed({description: `:dollar: Congrats! You Rolled ${roll}/100 | New Balance: ${users[key].gbp+wager}`,color: config.decimalColour});
                }
              }
              return;
            }
          }
        }
        userDB.push({id: message.author.id,gbp: 1000});
        message.channel.sendEmbed({description: `Registered new user ${message.author.username} with 1000 GBP, try placing your wager again`,color: config.decimalColour});
      });
    }else {
      message.channel.sendEmbed({description: `ERROR: Specify an amount to wager using !bet [amount]`,color: config.decimalColour});
    }
  }

  displayShop(userDB,message){
    var bal = 0;
    userDB.once("value", (data) => {
      var users = data.val();
      if (users) {
        var keys = Object.keys(users);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if (users[key].id===message.author.id) {
            bal = users[key].gbp;
          }
        }
      }
      var embed = new Discord.RichEmbed()
        .setTitle(`Points Shop | :moneybag: Balance: ${bal} GBP`)
        .setImage(`http://i.imgur.com/5tk87o1.png`)
        .setDescription(`Facilitates the purchasing of server perks`)
        .addField(`:gay_pride_flag: Custom Name Colour - 5000 GBP`,
          `!buy name [#hex colour code]`)
        .addField(`:thinking: Custom Emoji Slot - 7500 GBP`,
          `!buy emoji [image link]`)
        .setColor(config.decimalColour)
        .setFooter(`Disclaimer: Purchases may be revoked at Admin discretion`);
      message.channel.sendEmbed(embed);
    });
  }

  calc(math,args,message){
    var expr = args.join(' ');
    if (args[0]) {
      try {
        message.channel.sendEmbed({description: `${expr} = ${math.eval(expr)}`,color: config.decimalColour});
      } catch (e) {
        message.channel.sendEmbed({description: `ERROR: ${e.message}`,color: config.decimalColour});
      }
    }else {
      message.channel.sendEmbed({description: `ERROR: Enter an expression to evaluate`,color: config.decimalColour});
    }
  }

  // execute a single shell command where "cmd" is a string
  exec(cmd, cb){
    var child_process = require('child_process');
    var parts = cmd.split(/\s+/g);
    var p = child_process.spawn(parts[0], parts.slice(1), {stdio: 'inherit'});
    p.on('exit', function(code){
      var err = null;
      if (code) {
        err = new Error('command "'+ cmd +'" exited with wrong status code "'+ code +'"');
        err.code = code;
        err.cmd = cmd;
      }
      if (cb) cb(err);
    });
  };

  // execute multiple commands in series
  series(cmds, cb){
    var ex = this.exec;
    var execNext = function(){
      ex(cmds.shift(), function(err){
        if (err) {
          cb(err);
        } else {
          if (cmds.length) execNext();
          else cb(null);
        }
      });
    };
    execNext();
  };

  update(message){
    if (this.checkOwner(message)) {
      message.channel.sendEmbed({description: `Updating...`,color: config.decimalColour});
      this.series([
        'git fetch',
        'git reset --hard origin/master',
        'npm install',
        'pm2 restart all'
      ], function(err){
        if (err) {
          console.log(err.message);
        }
      });
    }else {
      message.channel.sendEmbed({description: `ERROR: Insufficient permissions to perform that command`,color: config.decimalColour});
    }
  }

  chatbot(args,message){
    var expr = args.join(' ');
    request({url:`https://jeannie.p.mashape.com/api?input=${expr}`,headers: {'X-Mashape-Key': config.mashape.jeannie,'Accept': 'application/json'}}, function (error, response, body) {
      if (error!=null) {
        message.channel.sendEmbed({description: 'ERROR: Could not access Jeannie API',color: config.decimalColour});
      }else {
        response = JSON.parse(body);
        message.channel.sendEmbed({description: response.output[0].actions.say.text,color: config.decimalColour});
      }
    });
  }

  play(ytdl,client,args,message){
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
      message.channel.sendEmbed({description: 'ERROR: Please join a voice channel first',color: config.decimalColour});
    }else {
      let regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      let match = args[0].match(regExp);
      if (match) {
        request(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${match[2]}&key=${config.youtube.apiKey}`, function (error, response, body) {
          if (error!=null) {
            message.channel.sendEmbed({description: 'ERROR: Could not access YouTube API',color: config.decimalColour});
          }else {
            response = JSON.parse(body);
            let res = response.items[0];
            let stream = ytdl(match[2], {
              filter : 'audioonly'
            });
            let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
            if (vconnec) {
              let dispatch = vconnec.player.dispatcher;
              dispatch.end();
            }
            voiceChannel.join().then(connnection => {
              var embed = new Discord.RichEmbed()
                .setDescription(`:headphones: Now Playing: ${res.snippet.title}`)
                .setThumbnail(res.snippet.thumbnails.default.url)
                .setColor(config.decimalColour);
              const dispatcher = connnection.playStream(stream, {passes:2});
              message.channel.sendEmbed(embed);
              dispatcher.on('end', () => {
                voiceChannel.leave();
              });
            });
          }
        });

      }else {
        let expr = args.join('+');
        request(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${expr}&type=video&videoCategoryId=10&key=${config.youtube.apiKey}`, function (error, response, body) {
          if (error!=null) {
            message.channel.sendEmbed({description: 'ERROR: Could not access YouTube API',color: config.decimalColour});
          }else {
            response = JSON.parse(body);
            let res = response.items[0];
            let stream = ytdl(res.id.videoId, {
              filter : 'audioonly'
            });
            let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
            if (vconnec) {
              let dispatch = vconnec.player.dispatcher;
              dispatch.end();
            }
            voiceChannel.join().then(connnection => {
              var embed = new Discord.RichEmbed()
                .setDescription(`:headphones: Now Playing: ${res.snippet.title}`)
                .setThumbnail(res.snippet.thumbnails.default.url)
                .setColor(config.decimalColour);
              const dispatcher = connnection.playStream(stream, {passes:2});
              message.channel.sendEmbed(embed);
              dispatcher.on('end', () => {
                voiceChannel.leave();
              });
            });
          }
        });
      }
    }
  }

  stream(client,args,message){
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
      message.channel.sendEmbed({description: 'ERROR: Please join a voice channel first',color: config.decimalColour});
    }else {
      if (args[0]) {
        let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
        if (vconnec) {
          let dispatch = vconnec.player.dispatcher;
          dispatch.end();
        }
        if (args[0].startsWith('https')) {
          require('https').get(args[0], (res) => {
            voiceChannel.join().then(connnection => {
              connnection.playStream(res, {passes:2});
            });
          });
        }else {
          require('http').get(args[0], (res) => {
            voiceChannel.join().then(connnection => {
              connnection.playStream(res, {passes:2});
            });
          });
        }
      }else {
        message.channel.sendEmbed({description: 'ERROR: Please specify the stream url as a parameter',color: config.decimalColour});
      }
    }
  }

  stop(client,message){
    let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      dispatch.end();
      message.channel.sendEmbed({description: `:mute: ${message.author.username} Stopped Playback`,color: config.decimalColour});
      vconnec.channel.leave();
    }
  }

  leave(client,message){
    let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      dispatch.end();
      vconnec.channel.leave();
    }
  }

  pause(client,message){
    let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      dispatch.pause();
      message.channel.sendEmbed({description: `:speaker: ${message.author.username} Paused Playback`,color: config.decimalColour});
    }
  }

  resume(client,message){
    let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      dispatch.resume();
      message.channel.sendEmbed({description: `:loud_sound: ${message.author.username} Resumed Playback`,color: config.decimalColour});
    }
  }

  radio(client,args,message){
    if (args[0]) {
      var choice = parseInt(args[0])-1;
      if (choice<config.radio.length) {
        this.stream(client,[config.radio[choice].url],message);
      }else {
        message.channel.sendEmbed({description: `ERROR: Selection does not exist`,color: config.decimalColour});
      }
    }else {
      var desc = [];
      for (var i = 0; i < config.radio.length; i++) {
        if (i===0) {
          desc.push({name:'Command',        value:`!radio ${i+1}`,            inline:true});
          desc.push({name:'Radio Station',  value:`${config.radio[i].title}`, inline:true});
          desc.push({name:'Genre',          value:`${config.radio[i].genre}`, inline:true});
        }else {
          desc.push({name:'­', value:`!radio ${i+1}`,             inline:true});
          desc.push({name:'­', value:`${config.radio[i].title}`,  inline:true});
          desc.push({name:'­', value:`${config.radio[i].genre}`,  inline:true});
        }
      }
      message.channel.sendEmbed({title: `:radio: Programmed Stations:`, description:'\n', fields: desc, color: config.decimalColour});
    }
  }

}

module.exports = new Commands();
