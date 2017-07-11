const request   = require('request');
const fs        = require('fs');
const readline  = require('readline');
const Discord   = require('discord.js');
const config    = require('./config.json');
const lib       = require('./lib');

// Methods to export
class Commands {

  help(guildPrefix,message) {
    var desc = `
-- General
**${guildPrefix}help** - Displays all available commands
**${guildPrefix}ping** - Displays response time to server
**${guildPrefix}stats** - Displays bot usage statistics
**${guildPrefix}version** - Checks for updates to the bot
**${guildPrefix}invite** - Generates a link to invite 2B to your server

-- Admin | Requires user to have a role titled "Admin"
**${guildPrefix}setprefix [newprefix]** - Sets the prefix that the bot listens to

-- Music
**${guildPrefix}play [title/link]** - Searches and queues the given term/link
**${guildPrefix}stop** - Stops the current song and leaves the channel
**${guildPrefix}pause** - Pauses playback of the current song
**${guildPrefix}resume** - Resumes playback of the current song
**${guildPrefix}leave** - Stops any playback and leaves the channel
**${guildPrefix}stream [url]** - Plays a given audio stream, or file from direct URL
**${guildPrefix}radio** - Displays some available preprogrammed radio streams
**${guildPrefix}np** - Displays Now Playing info for radio streams

-- Anime/NSFW
**${guildPrefix}smug** - Posts a random smug reaction image
**${guildPrefix}lewd [search term]** - Uploads a random NSFW image of the term
**${guildPrefix}sfw  [search term]** - Uploads a random SFW image of the term
**${guildPrefix}tags [search term]** - Searches Danbooru for related search tags
**${guildPrefix}2B [nsfw]** - Uploads a 2B image, or a NSFW version if supplied

-- Misc
**${guildPrefix}crypto [coin] [amount]** - Displays current cryptocurrency price or calculated value (optional)
**${guildPrefix}calc [expression]** - Evaluates a given expression
**${guildPrefix}r    [subreddit]** - Uploads a random image from a given subreddit
**${guildPrefix}roll [n] [m]** - Rolls an n-sided die, m times and displays the result

-- Chatbot
2B answers her callsign in response to the user
Eg. 2B How are you? | 2B What's the time?

For source code and other dank memes check [GitHub](https://github.com/Fshy/FshyBot) | [arc.moe](http://arc.moe)`;
      message.channel.send({embed:new Discord.RichEmbed()
        .setTitle(`Commands:`)
        .setDescription(desc)
        .setImage('http://i.imgur.com/a96NGOY.png')
        .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
  }

  ping(client,message){
    message.channel.send(lib.embed(`Response time to discord server: ${Math.round(client.ping)}ms`,message));
  }

  say(guildPrefix,message) {
    var str = message.content.slice(guildPrefix.length+3);
    message.channel.send(lib.embed(str,message));
  }

  logs(args,message){
    var logLines = parseInt(args[0]);
    if (!isNaN(logLines)) {
      var logs = [];
      if (fs.existsSync('winston.log')) {
        var rd = readline.createInterface({
          input: fs.createReadStream('winston.log'),
          output: process.stdout,
          console: false
        });
        rd.on('line', function(line) {
          var item = JSON.parse(line);
          if (item.guildID===message.guild.id) {
            logs.push(JSON.parse(line));
          }
        });
        rd.on('close', function () {
          var startIndex = 0;
          var count = 0;
          var desc = '';
          if (logs.length>logLines) startIndex = logs.length - logLines;
          for (var i = startIndex; i < logs.length; i++) {
            if (logs[i].guildID===message.guild.id) {
              desc += `${logs[i].timestamp.slice(0,-5).replace(/T/g, ' ')} - ${logs[i].message}\n`;
              count++;
            }
          }
          message.channel.send({embed:new Discord.RichEmbed()
            .setTitle(`Showing last ${count} Voice Channel logs`)
            .setDescription(`\`\`\`${desc}\`\`\``)
            .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
        });
      }else {
        message.channel.send(lib.embed(`**ERROR:** Log file not found`,message));
      }
    }else {
      message.channel.send(lib.embed(`**ERROR:** Parameter is not a number`,message));
    }
  }

  ver(version,guildPrefix,message) {
    request('https://raw.githubusercontent.com/Fshy/FshyBot/master/package.json', function (error, response, body) {
      response = JSON.parse(body);
      if (error!=null) {
        message.channel.send(lib.embed(`**ERROR:** Could not access repository`,message));
      }else {
        if (response.version!=version) {
          message.channel.send(lib.embed(`Currently Running v${version}\nNightly Build: v${response.version}\n\n:warning: *Use **${guildPrefix}update** to fetch master branch and restart bot | [Changelog](https://github.com/Fshy/FshyBot/commits/master)*`,message));
        }else {
          message.channel.send(lib.embed(`Currently Running v${version}\nNightly Build: v${response.version}\n\n:white_check_mark: *I'm fully updated to the latest build | [Changelog](https://github.com/Fshy/FshyBot/commits/master)*`,message));
        }
      }
    });
  }

  stats(version,client,message){
    message.channel.send({embed:new Discord.RichEmbed()
      .setTitle(`2B | FshyBot Statistics:`)
      .setDescription(`Currently serving **${client.users.size}** user${client.users.size>1 ? 's':''} on **${client.guilds.size}** guild${client.guilds.size>1 ? 's':''}`)
      .addField(`Ping`,`${Math.round(client.ping)}ms`,true)
      .addField(`Uptime`,`${parseInt(client.uptime/86400000)}:${parseInt(client.uptime/3600000)%24}:${parseInt(client.uptime/60000)%60}:${parseInt(client.uptime/1000)%60}`,true)
      .addField(`Build`,`v${version}`,true)
      .addField(`Memory Usage`,`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,true)
      .addField(`Platform`,`${process.platform}`,true)
      .addField(`Architecture`,`${process.arch}`,true)
      .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
  }

  coin(args,message) {
    if (args[0]) {
      var currency = args[0].toUpperCase();
      request(`https://min-api.cryptocompare.com/data/price?fsym=${currency}&tsyms=USD`, function (error, response, body) {
        var price = JSON.parse(body).USD;
        if (error!=null) {
          message.channel.send(lib.embed(`**ERROR:** Could not access cryptocompare API`,message));
        }else {
          if (args[1]) {
            var amt = args[1];
            if (!isNaN(amt)) {
              request(`https://www.cryptocompare.com/api/data/coinlist`, function (error, response, body) {
                body = JSON.parse(body).Data;
                if (error!=null) {
                  message.channel.send(lib.embed(`**ERROR:** Could not access cryptocompare API`,message));
                }else {
                  for (var coin in body) {
                    if (body[coin].Name===currency) {
                      return message.channel.send({embed:new Discord.RichEmbed()
                        .setAuthor(`${body[coin].CoinName} (${body[coin].Name}) - $${price}`,`https://www.cryptocompare.com${body[coin].ImageUrl}`)
                        .setDescription(`${amt} ${body[coin].Name} = $${(price*parseFloat(amt)).toFixed(2)}`)
                        .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
                    }
                  }
                  message.channel.send(lib.embed(`**ERROR:** ${currency} not found in database`,message));
                }
              });
            }else {
              message.channel.send(lib.embed(`**ERROR:** Parameter is not a number`,message));
            }
          }else {
            request(`https://www.cryptocompare.com/api/data/coinlist`, function (error, response, body) {
              body = JSON.parse(body).Data;
              if (error!=null) {
                message.channel.send(lib.embed(`**ERROR:** Could not access cryptocompare API`,message));
              }else {
                for (var coin in body) {
                  if (body[coin].Name===currency) {
                    return message.channel.send({embed:new Discord.RichEmbed()
                      .setAuthor(`${body[coin].CoinName} (${body[coin].Name}) - $${price}`,`https://www.cryptocompare.com${body[coin].ImageUrl}`)
                      .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
                  }
                }
                message.channel.send(lib.embed(`**ERROR:** ${currency} not found in database`,message));
              }
            });
          }
        }
      });
    }else {
      request(`https://www.cryptocompare.com/api/data/coinlist`, function (error, response, body) {
        body = JSON.parse(body).Data;
        if (error!=null) {
          message.channel.send(lib.embed(`**ERROR:** Could not access cryptocompare API`,message));
        }else {
          var coinStack = [];
          for (var i = 0; coinStack.length < 10; i++) {
            for (var coin in body) {
              if (parseInt(body[coin].SortOrder)===i+1) {
                coinStack.push(body[coin]);
              }
            }
          }
          //
          var desc = [];
          for (var i = 0; i < coinStack.length; i++) {
            desc.push({name:'­', value:`${coinStack[i].Name}\t-\t${coinStack[i].CoinName}`});
          }
          message.channel.send({embed:{title: `Usage: !crypto [coin] or !crypto [coin] [amount]`, description:'Current Popular Cryptocurrencies:\n', fields: desc, color: 15514833}});
          //
        }
      });
    }
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
    message.channel.send(lib.embed(output,message));
  }

  anime(args,message) {
    var tag = args.join('+');
    request(`https://myanimelist.net/api/anime/search.xml?q=${tag}`, function (error, response, body) {
      if (error!=null) {
        message.channel.send(lib.embed(`**ERROR:** Could not find any matches on MyAnimeList`,message));
      }else {
        const parseString = require('xml2js').parseString;
        parseString(body, function (err, result) {
            const decode = require('he').decode;
            var anime = result.anime.entry[0];
            message.channel.send({embed:new Discord.RichEmbed()
              .setTitle(anime.title[0])
              .setImage(anime.image[0])
              .addField(`English Title:`,`${anime.english[0]!='' ? anime.english[0] : '­'}`,true)
              .addField(`Episodes:`,`${anime.episodes[0]!='' ? anime.episodes[0] : '­'}`,true)
              .addField(`Start Date:`,`${anime.start_date[0]!='' ? anime.start_date[0] : '­'}`,true)
              .addField(`External Link:`,`${anime.id[0]!='' ? `[MyAnimeList](https://myanimelist.net/anime/${anime.id[0]})` : '­'}`,true)
              .addField(`Score:`,`${anime.score[0]!='' ? anime.score[0] : '­'}`,true)
              .addField(`End Date:`,`${anime.end_date[0]!='' ? anime.end_date[0] : '­'}`,true)
              .setDescription(decode(anime.synopsis[0].replace(/<[^>]*>/g, '')).split('\n')[0])
              .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
        });
      }
    }).auth(config.myAnimeList.user, config.myAnimeList.password);
  }

  danbooru(args,rating,amount,message) {
    var tag = args.join('_');
    if ((tag.toLowerCase().match(/kanna/g) && rating==='e') || (tag.toLowerCase().match(/kamui/g) && rating==='e'))
      return message.channel.send(lib.embed(`Don't lewd the dragon loli`,message));
    request(`http://danbooru.donmai.us/posts.json?tags=*${tag}*+rating%3A${rating}+limit%3A${amount}`, function (error, response, body) {
      body = JSON.parse(body);
      if (error!=null) {
        message.channel.send(lib.embed(`**ERROR:** Could not access Danbooru API`,message));
      }else {
        var random = Math.floor(Math.random() * body.length);//Picks one randomly to post
        if (body[random]) {
          message.channel.send({embed:new Discord.RichEmbed()
            .setImage(`http://danbooru.donmai.us${body[random].file_url}`)
            .setDescription(`[Source](${body[random].source})`)
            .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
        }else {
          message.channel.send(lib.embed(`**ERROR:** Could not find any posts matching ${tag}\nTry using the ${config.prefix}tags [search term] command to narrow down the search`,message));
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
      message.channel.send(lib.embed(suggestions,message));
    });
  }

  rslash(reddit,guildPrefix,message,args) {
    if (args[0]) {
      reddit.getSubreddit(args[0]).getHot().then(function (data) {
        if (data[0].url) {
          var urls = [];
          for (var i = 0; i < 25; i++) { //Top 25 sorted by Hot
            if ((/\.(jpe?g|png|gif|bmp)$/i).test(data[i].url)) { //If matches image file push to array
              urls.push(data[i]);
            }
          }
          if (urls.length!=0) {
            var random = Math.floor(Math.random() * urls.length);//Picks one randomly to post
            message.channel.send({embed:new Discord.RichEmbed()
            .setImage(urls[random].url)
            .setDescription(`${urls[random].title}\n[Source](http://reddit.com${urls[random].permalink})`)
            .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
          }else {
            message.channel.send(lib.embed(`Sorry, no images could be found on r/${args[0]}`,message));
          }
        }
      }).catch(e =>{
        if (e.error) {
          message.channel.send(lib.embed(`**ERROR ${e.statusCode}:** ${e.error.message} - ${e.error.reason}`,message));
        }else {
          message.channel.send(lib.embed(`**ERROR:** No suitable posts were found on r/${args[0]}`,message));
        }
      });
    }else {
      message.channel.send(lib.embed(`**ERROR:** No subreddit specified | Use ${guildPrefix}r [subreddit]`,message));
    }
  }

  img2B(args,message){
    if(args[0]==='nsfw')
      this.danbooru([`yorha_no._2_type_b`],`e`,100,message);
    else
      this.danbooru([`yorha_no._2_type_b`],`s`,100,message);
  }

  setName(client,args,message){
    if (lib.checkOwner(message)) {
      if (args[0]) {
        var name = args.join(' ');
        client.user.setUsername(name).then(message.channel.send(lib.embed(`Name successfully updated!`,message)));
      }else {
        message.channel.send(lib.embed(`**ERROR:** Specify a string to change username to`,message));
      }
    }else {
      message.channel.send(lib.embed(`**ERROR:** Insufficient permissions to perform that command`,message));
    }
  }

  setGame(timer,client,args,message){
    if (lib.checkOwner(message)) {
      clearInterval(timer);
      if (args[0]) {
        var game = args.join(' ');
        client.user.setGame(game).then(message.channel.send(lib.embed(`Game successfully updated!`,message)));
      }else {
        client.user.setGame(null).then(message.channel.send(lib.embed(`Game successfully cleared!`,message)));
      }
    }else {
      message.channel.send(lib.embed(`**ERROR:** Insufficient permissions to perform that command`,message));
    }
  }

  setStatus(client,guildPrefix,args,message){
    if (lib.checkOwner(message)) {
      if (args[0]==='online' || args[0]==='idle' || args[0]==='invisible' || args[0]==='dnd') {
        client.user.setStatus(args[0]).then(message.channel.send(lib.embed(`Status successfully updated!`,message)));
      }else {
        message.channel.send(lib.embed(`**ERROR:** Incorrect syntax | Use ${guildPrefix}setstatus [status]\nStatuses: online, idle, invisible, dnd`,message));
      }
    }else {
      message.channel.send(lib.embed(`**ERROR:** Insufficient permissions to perform that command`,message));
    }
  }

  setAvatar(client,args,message){
    if (lib.checkOwner(message)) {
      if ((/\.(jpe?g|png|gif|bmp)$/i).test(args[0])) {
        client.user.setAvatar(args[0]).then(message.channel.send(lib.embed(`Avatar successfully updated!`,message)));
      }else {
        message.channel.send(lib.embed(`**ERROR:** That's not an image filetype I recognize | Try: .jpg .png .gif .bmp`,message));
      }
    }else {
      message.channel.send(lib.embed(`**ERROR:** Insufficient permissions to perform that command`,message));
    }
  }

  calc(math,args,message){
    var expr = args.join(' ');
    if (args[0]) {
      try {
        message.channel.send(lib.embed(`${expr} = ${math.eval(expr)}`,message));
      } catch (e) {
        message.channel.send(lib.embed(`**ERROR:** ${e.message}`,message));
      }
    }else {
      message.channel.send(lib.embed(`**ERROR:** Enter an expression to evaluate`,message));
    }
  }

  update(message){
    if (lib.checkOwner(message)) {
      message.channel.send(lib.embed(`Updating...`,message));
      lib.series([
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
      message.channel.send(lib.embed(`**ERROR:** Insufficient permissions to perform that command`,message));
    }
  }

  chatbot(args,message){
    var expr = args.join(' ');
    request({url:`https://jeannie.p.mashape.com/api?input=${expr}`,headers: {'X-Mashape-Key': config.mashape.jeannie,'Accept': 'application/json'}}, function (error, response, body) {
      if (error!=null) {
        message.reply(lib.embed(`**ERROR:** Could not access Jeannie API`,message));
      }else {
        response = JSON.parse(body);
        message.reply(response.output[0].actions.say.text.substring(0, 2000));
      }
    });
  }

  play(ytdl,guildsMap,client,args,message){
    const voiceChannel = message.member.voiceChannel;
    var controls = this.controls;
    if (!voiceChannel) {
      message.channel.send(lib.embed(`**ERROR:** Please join a voice channel first`,message));
    }else {
      let regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      let match = args[0].match(regExp);
      if (match) {
        request(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${match[2]}&key=${config.youtube.apiKey}`, function (error, response, body) {
          if (error!=null) {
            message.channel.send(lib.embed(`**ERROR:** Could not access YouTube API`,message));
          }else {
            response = JSON.parse(body);
            let res = response.items[0];
            let stream = ytdl(match[2], {
              filter : 'audioonly'
            });
            let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
            if (vconnec) {
              let dispatch = vconnec.player.dispatcher;
              if (dispatch)
                dispatch.end();
            }
            client.setTimeout(function () {
              voiceChannel.join().then(connnection => {
                var dispatcher = connnection.playStream(stream, {passes:2});
                message.channel.send({embed:new Discord.RichEmbed()
                  .setDescription(`:headphones: Now Playing: ${res.snippet.title}`)
                  .setThumbnail(res.snippet.thumbnails.default.url)
                  .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)}).then(m =>{
                    controls(guildsMap,client,m);
                  });
                dispatcher.on('end', () => {
                  client.removeAllListeners('messageReactionAdd');
                  client.removeAllListeners('messageReactionRemove');
                  // voiceChannel.leave();
                });
              })
            }, 250);
          }
        });
      }else {
        let expr = args.join('+');
        request(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${expr}&type=video&videoCategoryId=10&key=${config.youtube.apiKey}`, function (error, response, body) {
          if (error!=null) {
            message.channel.send(lib.embed(`**ERROR:** Could not access YouTube API`,message));
          }else {
            response = JSON.parse(body);
            let res = response.items[0];
            let stream = ytdl(res.id.videoId, {
              filter : 'audioonly'
            });
            let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
            if (vconnec) {
              let dispatch = vconnec.player.dispatcher;
              if (dispatch)
                dispatch.end();
            }
            client.setTimeout(function () {
              voiceChannel.join().then(connnection => {
                var dispatcher = connnection.playStream(stream, {passes:2});
                message.channel.send({embed:new Discord.RichEmbed()
                  .setDescription(`:headphones: Now Playing: ${res.snippet.title}`)
                  .setThumbnail(res.snippet.thumbnails.default.url)
                  .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)}).then(m =>{
                    controls(guildsMap,client,m);
                  });
                dispatcher.on('end', () => {
                  client.removeAllListeners('messageReactionAdd');
                  client.removeAllListeners('messageReactionRemove');
                  // voiceChannel.leave();
                });
              })
            }, 250);
          }
        });
      }
    }
  }

  stream(client,args,message){
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
      message.channel.send(lib.embed(`**ERROR:** Please join a voice channel first`,message));
    }else {
      if (args[0]) {
        let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
        if (vconnec) {
          let dispatch = vconnec.player.dispatcher;
          if (dispatch)
            dispatch.end();
        }
        if (args[0].startsWith('https')) {
          require('https').get(args[0], (res) => {
            voiceChannel.join().then(connnection => {
              connnection.playStream(res, {passes:2});
              dispatcher.on('end', () => {
                // voiceChannel.leave();
              });
            });
          });
        }else {
          require('http').get(args[0], (res) => {
            voiceChannel.join().then(connnection => {
              connnection.playStream(res, {passes:2});
              dispatcher.on('end', () => {
                // voiceChannel.leave();
              });
            });
          });
        }
      }else {
        message.channel.send(lib.embed(`**ERROR:** Please specify the stream url as a parameter`,message));
      }
    }
  }

  stop(guildsMap,client,message){
    let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      if (dispatch)
        dispatch.end();
      var np = guildsMap.get(message.guild.id);
      delete np.playing;
      guildsMap.set(message.guild.id, np);
      // message.channel.send(lib.embed(`:mute: ${message.author.username} Stopped Playback`,message));
    }
  }

  leave(guildsMap,client,message){
    let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      if (dispatch)
        dispatch.end();
      var np = guildsMap.get(message.guild.id);
      delete np.playing;
      guildsMap.set(message.guild.id, np);
      vconnec.channel.leave();
    }
  }

  pause(client,message){
    let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      if (dispatch)
        dispatch.pause();
      // message.channel.send(lib.embed(`:speaker: ${message.author.username} Paused Playback`,message));
    }
  }

  resume(client,message){
    let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      if (dispatch)
        dispatch.resume();
      // message.channel.send(lib.embed(`:loud_sound: ${message.author.username} Resumed Playback`,message));
    }
  }

  radio(client,guildPrefix,guildsMap,args,message){
    var stream = this.stream;
    if (args[0]) {
      var choice = parseInt(args[0])-1;
      if (choice<config.radio.length) {
        request(`https://feed.tunein.com/profiles/${config.radio[choice].tuneinId}/nowPlaying`, function (error, response, body) {
          if (error!=null) {
            message.channel.send(lib.embed(`**ERROR:** Could not access TuneIn API`,message));
          }else {
            body = JSON.parse(body);
            stream(client,[config.radio[choice].url],message);
            var guildData = guildsMap.get(message.guild.id);
            guildData.playing = config.radio[choice].tuneinId;
            guildsMap.set(message.guild.id,guildData);
            message.channel.send({embed:new Discord.RichEmbed()
              .setDescription(`:headphones: **Now Streaming:** ${config.radio[choice].title}\n${body.Secondary ? `**Currently Playing:** ${body.Secondary.Title}`:''}`)
              .setThumbnail(body.Primary.Image)
              .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
          }
        });
      }else {
        message.channel.send(lib.embed(`**ERROR:** Selection does not exist`,message));
      }
    }else {
      var desc = [];
      for (var i = 0; i < config.radio.length; i++) {
        if (i===0) {
          desc.push({name:'Command',        value:`${guildPrefix}radio ${i+1}`,            inline:true});
          desc.push({name:'Radio Station',  value:`${config.radio[i].title}`, inline:true});
          desc.push({name:'Genre',          value:`${config.radio[i].genre}`, inline:true});
        }else {
          desc.push({name:'­', value:`${guildPrefix}radio ${i+1}`,             inline:true});
          desc.push({name:'­', value:`${config.radio[i].title}`,  inline:true});
          desc.push({name:'­', value:`${config.radio[i].genre}`,  inline:true});
        }
      }
      message.channel.send({embed:{title: `:radio: Programmed Stations:`, description:'\n', fields: desc, color: 15514833}});
    }
  }

  nowPlaying(guildsMap,message){
    var np = guildsMap.get(message.guild.id).playing;
    if (np) {
      request(`https://feed.tunein.com/profiles/${np}/nowPlaying`, function (error, response, body) {
        if (error!=null) {
          message.channel.send(lib.embed(`**ERROR:** Could not access TuneIn API`,message));
        }else {
          body = JSON.parse(body);
          message.channel.send({embed:new Discord.RichEmbed()
            .setDescription(`${body.Secondary ? `**Currently Playing:** ${body.Secondary.Title}`:'No ID3 Tags found for this stream'}`)
            .setThumbnail(body.Secondary ? body.Secondary.Image:'')
            .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
        }
      });
    }else {
      message.channel.send(lib.embed(`**ERROR:** No streaming data could be found`,message));
    }
  }

  smug(message){
    request(`http://arc.moe/smug`, function (error, response, body) {
      body = JSON.parse(body);
      if (error!=null) {
        message.channel.send(lib.embed('**ERROR:** Could not access arc.moe resource',message));
      }else {
        var random = Math.floor(Math.random() * body.length);//Picks one randomly to post
        if (body[random]) {
          message.channel.send({embed:new Discord.RichEmbed()
            .setImage(`${body[random]}`)
            .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
        }else {
          message.channel.send(lib.embed(`**ERROR:** Could not find the image requested`,message));
        }
      }
    });
  }

  invite(client,message){
    client.generateInvite(8).then(link => {
      message.channel.send({embed:new Discord.RichEmbed()
        .setDescription(`You can use this [LINK](${link}) to invite me to your server! :sparkling_heart:`)
        .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
    });
  }

  setprefix(guildDB,guildsMap,guildPrefix,args,message){
    if (message.guild.roles.exists('name', 'Admin')) {
      var newprefix = args.join('');
      if(newprefix){
        var admins = message.guild.roles.find('name', 'Admin').members;
        if (admins.has(message.author.id)) {
          // set the prefix here
          guildDB.once("value", (data) => {
            var guilds = data.val();
            if (guilds) {
              var keys = Object.keys(guilds);
              for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (guilds[key].id===message.guild.id) {
                  guildDB.child(key).update({"prefix": newprefix});
                  guildsMap.set(message.guild.id,{prefix:newprefix});
                  message.channel.send(lib.embed(`**SUCCESS:** Now listening for the prefix: \`${newprefix}\``,message));
                  break;
                }
              }
            }
          });
          // end prefix
        }else {
          message.channel.send(lib.embed(`**ERROR:** Insufficient permissions to perform that command\n**Required Role:** \`Admin\``,message));
        }
      }else {
        message.channel.send(lib.embed(`**ERROR:** Failed to specify a parameter, i.e. ${guildPrefix}setprefix [newprefix]`,message));
      }
    }else {
      message.channel.send(lib.embed(`**ERROR:** Guild must have a role titled \`Admin\` to use this command`,message));
    }
  }

  controls(guildsMap,client,message){

    function leave(guildsMap,client,message){
      let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
      if (vconnec) {
        let dispatch = vconnec.player.dispatcher;
        if (dispatch)
          dispatch.end();
        var np = guildsMap.get(message.guild.id);
        delete np.playing;
        guildsMap.set(message.guild.id, np);
        vconnec.channel.leave();
      }
    }

    function stop(guildsMap,client,message) {
      let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
      if (vconnec) {
        let dispatch = vconnec.player.dispatcher;
        if (dispatch)
          dispatch.end();
        var np = guildsMap.get(message.guild.id);
        delete np.playing;
        guildsMap.set(message.guild.id, np);
      }
    }
    message.react('⏯').then(r => {
      // playpause
      client.on('messageReactionAdd', (messageReaction)=>{
        if (messageReaction===r && messageReaction.count>2){
          let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
          if (vconnec) {
            let dispatch = vconnec.player.dispatcher;
            if (dispatch){
              if (dispatch.speaking)
                dispatch.pause();
              else
                dispatch.resume();
            }
          }
        } //this.resume(client,message);
      });
      client.on('messageReactionRemove', (messageReaction)=>{
        if (messageReaction===r){
          let vconnec = client.voiceConnections.get(message.guild.defaultChannel.id);
          if (vconnec) {
            let dispatch = vconnec.player.dispatcher;
            if (dispatch){
              if (dispatch.speaking)
                dispatch.pause();
              else
                dispatch.resume();
            }
          }
        }// this.resume(client,message);
      });
        message.react('⏹').then(r => {
          // stop
          client.on('messageReactionAdd', (messageReaction)=>{
            if (messageReaction===r && messageReaction.count>2) stop(guildsMap,client,message);
          });
          client.on('messageReactionRemove', (messageReaction)=>{
            if (messageReaction===r) stop(guildsMap,client,message);
          });
          message.react('❌').then(r => {
            //close
            client.on('messageReactionAdd', (messageReaction)=>{
              if (messageReaction===r && messageReaction.count>2) leave(guildsMap,client,message);
            });
            client.on('messageReactionRemove', (messageReaction)=>{
              if (messageReaction===r) leave(guildsMap,client,message);
            });
          })
        })
    })
  }

  insta(args,message){
    if (args[0]) {
      const instagramPosts = require('instagram-posts');
      instagramPosts(args[0],{
      	filter: data => data.type === 'image'
      }).then(posts => {
        if (posts[0]) {
          message.channel.send({embed:new Discord.RichEmbed()
            .setAuthor(`@${posts[0].username}`)
            .setDescription(`https://www.instagram.com/p/${posts[0].id}\n${posts[0].text}`)
            .setImage(posts[0].media)
            .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
        }else {
          message.channel.send(lib.embed(`**ERROR:** Could not retrieve any images for @${args[0]}`,message));
        }
      });
    }else {
      message.channel.send(lib.embed(`**Usage:** !insta [username]`,message));
    }
  }

  pubg(scraper,args,message){
    if (args[0]) {
      scraper(`https://pubg.me/player/${args[0]}`, {
          username: ".username-header h1",
          avatar: {
            selector: ".steam-avatar",
            attr: "src"
          },
          soloRating: ".profile-match-overview-solo .stat-blue .value",
          soloKD: ".profile-match-overview-solo .stat-red .value",
          duoRating: ".profile-match-overview-duo .stat-blue .value",
          duoKD: ".profile-match-overview-duo .stat-red .value",
          squadRating: ".profile-match-overview-squad .stat-blue .value",
          squadKD: ".profile-match-overview-squad .stat-red .value"
      }).then(stats => {
          if (stats.username) {
            message.channel.send({embed:new Discord.RichEmbed()
              .setAuthor(`PUBG.ME | ${stats.username}`,stats.avatar)
              .addField(`Solo`,`${stats.soloRating ? `${stats.soloRating}`:'N/A'} Rating`,true)
              .addField(`Duo`,`${stats.duoRating ? `${stats.duoRating}`:'N/A'} Rating`,true)
              .addField(`Squad`,`${stats.squadRating ? `${stats.squadRating}`:'N/A'} Rating`,true)
              .addField('­',`${stats.soloKD ? `${stats.soloKD}`:'0.00'} K/D`,true)
              .addField('­',`${stats.duoKD ? `${stats.duoKD}`:'0.00'} K/D`,true)
              .addField('­',`${stats.squadKD ? `${stats.squadKD}`:'0.00'} K/D`,true)
              .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
          }else {
            message.channel.send(lib.embed(`**ERROR:** Could not retrieve stats for ${args[0]}`,message));
          }
      });
    }else {
      message.channel.send(lib.embed(`**Usage:** !pubg [username]`,message));
    }
  }

}

module.exports = new Commands();
