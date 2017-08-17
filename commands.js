const request   = require('request');
const _         = require('lodash');
const fs        = require('fs');
const readline  = require('readline');
const Discord   = require('discord.js');
const config    = require('./config.json');
const lib       = require('./lib');

// Methods to export
class Commands {

  help(guildPrefix,message) {
    var desc = `
**${guildPrefix}help** - Displays all available commands
**${guildPrefix}diag** - Displays bot diagnostics and channel permissions
**${guildPrefix}invite** - Generates a link to invite 2B to your server
**${guildPrefix}setprefix <newprefix>** - Requires user to have a role titled "Admin"

**${guildPrefix}play <song name/link>** - Searches and plays a given song
**${guildPrefix}playlist <link> <shuffle>** - Queues a given YouTube playlist
**${guildPrefix}stop** - Stops the current song
**${guildPrefix}pause** - Pauses playback of the current song
**${guildPrefix}resume** - Resumes playback of the current song
**${guildPrefix}clear** - Clears the current playlist queue
**${guildPrefix}join** - Joins the user's VoiceChannel
**${guildPrefix}leave** - Stops any playback and leaves the channel
**${guildPrefix}stream <url>** - Plays a given audio stream, or file from direct URL
**${guildPrefix}radio** - Displays some available preprogrammed radio streams

**${guildPrefix}smug** - Posts a random smug reaction image
**${guildPrefix}sfw <search term>** - Uploads a random SFW image of the term
**${guildPrefix}nsfw <search term>** - Uploads a random NSFW image of the term
Tags are separated by a / symbol, Example: **${guildPrefix}sfw kancolle/thighhighs**

**${guildPrefix}insta <username>** - Uploads a user's most recent instagram post
**${guildPrefix}crypto <coin> <amount>** - Cryptocurrency price lookup
**${guildPrefix}r <subreddit>** - Uploads a random image from a given subreddit
**${guildPrefix}calc <expression>** - Evaluates a given expression

**-- Chatbot**
Start a sentence with "2B ..." and she'll respond, also try DM'ing her.

*For the full commands list check the [GitHub](https://github.com/Fshy/FshyBot/blob/master/README.md) repo*`;
      message.channel.send({embed:new Discord.MessageEmbed()
        .setTitle(`${message.guild.me.displayName} Commands:`)
        .setDescription(desc)
        // .setImage('http://i.imgur.com/a96NGOY.png')
        .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
  }

  ping(client,message){
    message.channel.send(lib.embed(`Response time to discord server: ${Math.round(client.ping)}ms`,message));
  }

  say(guildPrefix,message) {
    var str = message.content.slice(guildPrefix.length+3);
    message.channel.send(lib.embed(str,message));
  }

  // CHANGED defaultChannel deprecated in discord-js v12
  // broadcast(client,guildPrefix,args,message) {
  //   if (lib.checkOwner(message)) {
  //     if (args[0]) {
  //       var str = message.content.slice(guildPrefix.length+9);
  //       client.guilds.forEach(function (guild) {
  //         if (guild.defaultChannel.permissionsFor(client.user).has('SEND_MESSAGES'))
  //           guild.defaultChannel.send({embed:new Discord.MessageEmbed().setDescription(str).setColor(`${guild.me.displayHexColor!=='#000000' ? guild.me.displayHexColor : config.hexColour}`)});
  //       });
  //     }else {
  //       message.channel.send(lib.embed(`**ERROR:** Enter a message to broadcast`,message));
  //     }
  //   }else {
  //     message.channel.send(lib.embed(`**ERROR:** Insufficient permissions to perform that command`,message));
  //   }
  // }

  logs(args,message){
    if (args[0]) {
      var logLines = parseInt(args[0]);
    }else {
      var logLines = 10;
    }
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
          if (item.guildID===message.guild.id && item.type==='voice') {
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
              var timestamp = new Date(logs[i].timestamp+(config.localization.timezoneOffset*60000));
              desc += `<${timestamp.toISOString().slice(0,-5).replace(/T/g, ' ')} ${config.localization.timezone}> ${logs[i].message}\n<!--------------------------------------------------------->\n`;
              count++;
            }
          }
          desc = desc.substring(0, desc.lastIndexOf("\n<!--------------------------------------------------------->\n"));
          message.channel.send({embed:new Discord.MessageEmbed()
            .setTitle(`Showing last ${count} Voice Channel logs`)
            .setDescription(`\`\`\`html\n${desc==='' ? 'No logs found for this guild' : desc}\n\`\`\``)
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
      var gitPackage = JSON.parse(body);
      if (error!=null) {
        message.channel.send(lib.embed(`**ERROR:** Could not access repository`,message));
      }else {
        request({url:`https://api.github.com/repos/Fshy/FshyBot/git/refs/heads/master`,headers: {'User-Agent': 'FshyBot'}}, function (error, response, body) {
          if (error!=null) {
            message.channel.send(lib.embed(`**ERROR:** Could not access repository`,message));
          }else {
            request({url:JSON.parse(body).object.url,headers: {'User-Agent': 'FshyBot'}}, function (error, response, body) {
              body = JSON.parse(body);
              var version = require('./package').version;
              message.channel.send(lib.embed(`\`\`\`js\nCurrent:      ${version}\nLatest Build: ${gitPackage.version}\n\n//Latest Commit on FshyBot/master\nMessage:     '${body.message}'\nAuthor:      '${body.author.name}'\nTimestamp:   '${new Date(body.author.date).toLocaleString()}'\nSHA:         '${body.sha}'\`\`\``,message));
            });

          }
        });
      }
    });

    // request('https://raw.githubusercontent.com/Fshy/FshyBot/master/package.json', function (error, response, body) {
    //   response = JSON.parse(body);
    //   if (error!=null) {
    //     message.channel.send(lib.embed(`**ERROR:** Could not access repository`,message));
    //   }else {
    //     if (response.version!=version) {
    //       message.channel.send(lib.embed(`Currently Running v${version}\nNightly Build: v${response.version}\n\n:warning: *Use **${guildPrefix}update** to fetch master branch and restart bot | [Changelog](https://github.com/Fshy/FshyBot/commits/master)*`,message));
    //     }else {
    //       message.channel.send(lib.embed(`Currently Running v${version}\nNightly Build: v${response.version}\n\n:white_check_mark: *I'm fully updated to the latest build | [Changelog](https://github.com/Fshy/FshyBot/commits/master)*`,message));
    //     }
    //   }
    // });
  }

  stats(version,client,message){
    var textChannels = message.guild.channels.findAll('type','text');
    var voiceChannels = message.guild.channels.findAll('type','voice');
    var textRes = '';
    var voiceRes = '';
    for (var i = 0; i < textChannels.length; i++) {
      textChannels.find(function (channel) {
        if (channel.position===i) {
          if (channel.name.length+1<38) {
            var padding = '';
            for (var x = channel.name.length+1; x < 38; x++) {
              padding+=' ';
            }
            textRes+=`#${channel.name} ${padding}Send ${channel.permissionsFor(client.user).has('SEND_MESSAGES') ? '✔':'✘'} | Read ${channel.permissionsFor(client.user).has('READ_MESSAGES') ? '✔':'✘'}\n`;
          }else {
            textRes+=`#${channel.name.slice(0, 37)} Send ${channel.permissionsFor(client.user).has('SEND_MESSAGES') ? '✔':'✘'} | Read ${channel.permissionsFor(client.user).has('READ_MESSAGES') ? '✔':'✘'}\n`;
          }
        }
      });
    }
    for (var i = 0; i < voiceChannels.length; i++) {
      voiceChannels.find(function (channel) {
        if (channel.position===i) {
          if (channel.name.length<38) {
            var padding = '';
            for (var x = channel.name.length+1; x < 38; x++) {
              padding+=' ';
            }
            voiceRes+=`${channel.name} ${padding}Speak ${channel.speakable ? '✔':'✘'} | Join ${channel.joinable ? '✔':'✘'}\n`;
          }else {
            voiceRes+=`${channel.name.slice(0, 37)} Speak ${channel.speakable ? '✔':'✘'} | Join ${channel.joinable ? '✔':'✘'}\n`;
          }
        }
      });
    }
    message.channel.send({embed:new Discord.MessageEmbed()
      .setTitle(`${config.name} Diagnostics:`)
      .addField(`\`\`\`------------------------ Process ------------------------\`\`\``,
        `\`\`\`Uptime  | ${parseInt(client.uptime/86400000)}:${parseInt(client.uptime/3600000)%24}:${parseInt(client.uptime/60000)%60}:${parseInt(client.uptime/1000)%60}\nBuild   | v${version}\nMemory  | ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`\`\``,false)
      .addField(`\`\`\`------------------------- Guild -------------------------\`\`\``,
        `\`\`\`ID      | ${message.guild.id}\nRegion  | ${message.guild.region.toUpperCase()}\nPing    | ${Math.round(client.ping)}ms\nMembers | ${message.guild.memberCount}\`\`\``,false)
      .addField(`\`\`\`------------------- TextChannel Perms -------------------\`\`\``,
        `\`\`\`${textRes}\`\`\``,false)
      .addField(`\`\`\`------------------- VoiceChannel Perms ------------------\`\`\``,
      `\`\`\`${voiceRes}\`\`\``,false)
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
                      return message.channel.send({embed:new Discord.MessageEmbed()
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
                    return message.channel.send({embed:new Discord.MessageEmbed()
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
          message.channel.send({embed:{title: `Usage: !crypto <coin> or !crypto <coin> <amount>`, description:'Current Popular Cryptocurrencies:\n', fields: desc, color: 15514833}});
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
            message.channel.send({embed:new Discord.MessageEmbed()
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

  danbooru(guildPrefix,args,rating,message) {
    if (!message.channel.nsfw && rating==='e') return message.channel.send(lib.embed(`**ERROR:** This channel has not been marked for NSFW content`,message));
    var tag1 = '';
    var tag2 = '';
    var tag = '';
    var flag = false;
    var count = 0;
    var sp = message.content.replace(/\//g,' / ').split(/\s+/g);
    sp.shift();
    for (var i = 0; i < sp.length && count<2; i++) {
      if (sp[i]==='/') {
        flag = true;
        count++;
      }
      if (sp[i]!=='/' && flag===false) {//tag 1
        tag1 += `${sp[i]}_`;
      }else {
        if (sp[i]!=='/' && flag===true) {//tag 2
          tag2 += `${sp[i]}_`;
        }
      }
    }
    tag1 = tag1.slice(0,tag1.length-1);
    tag2 = tag2.slice(0,tag2.length-1);
    if (flag===true) {
      tag = `${tag1}+${tag2}`;
    }else {
      tag = `*${tag1}*`;
    }
    if ((tag.toLowerCase().match(/kanna/g) && rating==='e') || (tag.toLowerCase().match(/kamui/g) && rating==='e'))
      return message.channel.send(lib.embed(`Don't lewd the dragon loli`,message));
    request(`https://danbooru.donmai.us/posts.json?tags=${tag}&rating=${rating}&limit=1&random=true`, function (error, response, body) {
      body = JSON.parse(body);
      if (error!=null) {
        message.channel.send(lib.embed(`**ERROR:** Could not access Danbooru API`,message));
      }else {
        if (body[0]) {
          var post = body[0];
          message.channel.send({embed:new Discord.MessageEmbed()
            .setImage(`http://danbooru.donmai.us${post.file_url}`)
            .setDescription(`Artist: ${post.tag_string_artist} | [Source](https://danbooru.donmai.us/posts/${post.id}) | [Original Source](${post.source})`)
            .setFooter(`Not what you expected? Try using ${guildPrefix}tags ${tag1} ${tag2 ? `or ${guildPrefix}tags ${tag2}`:``}`)
            .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
        }else {//no posts found -- so lets see if any of the tags are invalid and display subsequent suggestions
          var valid1 = false;
          var valid2 = false;
          var sugg = '';

          request(`https://danbooru.donmai.us/tags.json?search[name]=${tag1}`, function (e, r, b) {//validate tag 1
            if (b!=='[]') {//tag is valid
              // console.log('tag 1 valid');
              request(`https://danbooru.donmai.us/tags.json?search[name]=${tag2}`, function (e, r, b) {//validate tag 2
                if (b!=='[]') {//tag is valid
                  // console.log('tag 2 valid');
                  message.channel.send(lib.embed(`**ERROR:** Could not find posts matching ${tag2? `**${tag1}** and **${tag2}**`:`**${tag1}**`}\n\nMaybe try some different tags.`,message));
                }else {//tag is invalid -- do an autocomplete lookup
                  // console.log('tag 2 invalid');
                  sugg += `Suggested tags for ${tag2}\n`;
                  request(`https://danbooru.donmai.us/tags/autocomplete.json?search[name_matches]=*${tag2}*`, function (e, r, b) {
                    b = JSON.parse(b);
                    if (b[0]!=null) {
                      for (var i = 0; i < b.length && i < 3; i++)
                        sugg += `${b[i].name}\n`;
                    }else {
                      sugg += 'None found\n';
                    }
                  }).auth(config.danbooru.login, config.danbooru.api_key);
                  message.channel.send(lib.embed(`**ERROR:** Could not find posts matching ${tag2? `**${tag1}** and **${tag2}**`:`**${tag1}**`}\n\nTry re-wording the parameters with the **${guildPrefix}tags [search term]** command to find what you're looking for\n\nHere are some suggestions we generated:\n\`\`\`${sugg}\`\`\``,message));
                }
              }).auth(config.danbooru.login, config.danbooru.api_key);
            }else {//tag is invalid -- do an autocomplete lookup
              // console.log('tag 1 invalid');
              sugg += `--- Suggested tags for ${tag1}\n`;
              request(`https://danbooru.donmai.us/tags/autocomplete.json?search[name_matches]=*${tag1}*`, function (e, r, b) {
                b = JSON.parse(b);
                if (b[0]!=null) {
                  for (var i = 0; i < b.length && i < 3; i++)
                    sugg += `${b[i].name}\n`;
                }else {
                  sugg += 'None found\n';
                }
                request(`https://danbooru.donmai.us/tags.json?search[name]=${tag2}`, function (e, r, b) {//validate tag 2
                  if (b!=='[]') {//tag is valid
                    // console.log('tag 2 valid');
                    message.channel.send(lib.embed(`**ERROR:** Could not find posts matching ${tag2? `**${tag1}** and **${tag2}**`:`**${tag1}**`}\n\nMaybe try some different tags.`,message));
                  }else {//tag is invalid -- do an autocomplete lookup
                    // console.log('tag 2 invalid');
                    sugg += `--- Suggested tags for ${tag2}\n`;
                    request(`https://danbooru.donmai.us/tags/autocomplete.json?search[name_matches]=*${tag2}*`, function (e, r, b) {
                      b = JSON.parse(b);
                      if (b[0]!=null) {
                        for (var i = 0; i < b.length && i < 3; i++)
                          sugg += `${b[i].name}\n`;
                      }else {
                        sugg += 'None found\n';
                      }
                      message.channel.send(lib.embed(`**ERROR:** Could not find posts matching ${tag2? `**${tag1}** and **${tag2}**`:`**${tag1}**`}\n\nTry re-wording the parameters with the **${guildPrefix}tags [search term]** command to find what you're looking for\n\nHere are some suggestions we generated:\n\`\`\`${sugg}\`\`\``,message));
                    }).auth(config.danbooru.login, config.danbooru.api_key);
                  }
                }).auth(config.danbooru.login, config.danbooru.api_key);
              }).auth(config.danbooru.login, config.danbooru.api_key);
            }
          }).auth(config.danbooru.login, config.danbooru.api_key);
        }
      }
    }).auth(config.danbooru.login, config.danbooru.api_key);
  }

  danbooruTags(args,message) {
    var tag = '';
    for (var i = 0; i < args.length; i++) {
      tag += `*${args[i]}*+`;
    }
    tag = tag.slice(0,tag.length-1);
    request(`http://danbooru.donmai.us/tags/autocomplete.json?search[name_matches]=*${tag}*`, function (e, r, b) {
      var suggestions = '';
      b = JSON.parse(b);
      if (b[0]!=null) {
        for (var i = 0; i < b.length; i++) {
          suggestions += b[i].name;
          suggestions += '\n';
        }
      }else {
        suggestions = `No suggestions found for ${tag}`;
      }
      message.channel.send({embed:new Discord.MessageEmbed()
        .setTitle(`Tags matching '${tag}'`)
        .setDescription(`\`\`\`${suggestions}\`\`\``)
        .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});//return in code tags - markdown parsing tags
    });
  }

  rslash(guildPrefix,message,args) {
    const snoowrap  = require('snoowrap');
    const reddit    = new snoowrap(config.reddit);
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
            message.channel.send({embed:new Discord.MessageEmbed()
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
      message.channel.send(lib.embed(`**Usage:** ${guildPrefix}r <subreddit>`,message));
    }
  }

  img2B(guildPrefix,args,message){
    message.content=`! yorha_no._2_type_b`;
    if(args[0]==='nsfw')
      this.danbooru(guildPrefix,[`yorha_no._2_type_b`],`e`,message);
    else
      this.danbooru(guildPrefix,[`yorha_no._2_type_b`],`s`,message);
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
      request('https://raw.githubusercontent.com/Fshy/FshyBot/master/package.json', function (error, response, body) {
        response = JSON.parse(body);
        if (error!=null) {
          message.channel.send(lib.embed(`**ERROR:** Could not access repository`,message));
        }else {
          var version = require('./package').version;
          if (response.version>version) {
            //TODO Properly log each shell process/error to the end user
            message.channel.send(lib.embed(`\`\`\`js\nCurrent:      ${version}\nLatest Build: ${response.version}\n\n// Updating from Fshy/FshyBot master Branch..\n// Installing Dependencies..\n// Restarting Script..\`\`\``,message));
            lib.series([
              'git fetch',
              'git reset --hard origin/master',
              'sudo npm install --silent',
              'pm2 restart all'
            ], function(err){
              if (err) {
                console.log(err.message);
              }
            });
          }else {
            message.channel.send(lib.embed(`\`\`\`js\nCurrent:      ${version}\nLatest Build: ${response.version}\n\n// Update Not Required\`\`\``,message));
          }
        }
      });
    }else {
      message.channel.send(lib.embed(`**ERROR:** Insufficient permissions to perform that command`,message));
    }
  }

  chatbot(client,args,message){
    var expr = args.join(' ');
    request({url:`https://jeannie.p.mashape.com/api?input=${expr}&locale=${config.localization.locale}&timeZone=${config.localization.timezoneOffset}&location=${config.localization.coordinates}`,headers: {'X-Mashape-Key': config.mashape.jeannie,'Accept': 'application/json'}}, function (error, response, body) {
      if (error!=null) {
        message.reply(lib.embed(`**ERROR:** Could not access Jeannie API`,message));
      }else {
        response = JSON.parse(body);
        if(response.output[0]){
          if (message.channel.type===`dm` || message.channel.permissionsFor(client.user).has('SEND_MESSAGES')) //Has write permissions
            message.reply(response.output[0].actions.say.text.substring(0, 2000));
        }else {
          if (message.channel.type===`dm` || message.channel.permissionsFor(client.user).has('SEND_MESSAGES')) //Has write permissions
            message.reply(`Sorry I couldn't process what you're trying to say.`);
        }
      }
    });
  }

  clearQueue(guildsMap,client,message){
    lib.clearQueue(guildsMap,client,message);
    let vconnec = client.voiceConnections.get(message.guild.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      if (dispatch){
        lib.clearQueue(guildsMap,client,message);
        dispatch.end();
      }
    }
  }

  playlist(ytdl,guildsMap,client,args,message){
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
      message.channel.send(lib.embed(`**ERROR:** Please join a voice channel first`,message));
    }else {
      if (!voiceChannel.permissionsFor(client.user).has('CONNECT') || !voiceChannel.permissionsFor(client.user).has('SPEAK')){
        var padding = '';
        for (var x = voiceChannel.name.length+1; x < 38; x++) padding+=' ';
        return message.channel.send(lib.embed(`**ERROR:** Insufficient permissions\n\`\`\`${voiceChannel.name} ${padding}Speak ${voiceChannel.speakable ? '✔':'✘'} | Join ${voiceChannel.joinable ? '✔':'✘'}\`\`\``,message));
      }
      if (args[0]) {
        if (args[0].match(/list=/g)) {
          var regExpMatch = args[0].match(/(?=list=).*/g)[0];
          let match = regExpMatch.slice(5,regExpMatch.length);
          request(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${match}&maxResults=50&key=${config.youtube.apiKey}`, function (error, response, body) {
            if (error!=null) {
              message.channel.send(lib.embed(`**ERROR:** Could not access YouTube API`,message));
            }else {
              var songQueue = [];
              body = JSON.parse(body);
              if (!body.items[0]) return message.channel.send(lib.embed(`**ERROR:** Could not process playlist items`,message));
              for (var i = 0; i < body.items.length; i++) {
                songQueue.push(body.items[i]);
              }
              songQueue = songQueue.reverse();
              if (args[1] && args[1].toLowerCase()==='shuffle')
                songQueue = lib.durstenfeldShuffle(songQueue);

              let vconnec = client.voiceConnections.get(message.guild.id);
              if (vconnec) {
                let dispatch = vconnec.player.dispatcher;
                if (dispatch){
                  lib.clearQueue(guildsMap,client,message);
                  dispatch.end();
                }
              }

              var gm = guildsMap.get(message.guild.id)
              gm.songQueue=songQueue;
              guildsMap.set(message.guild.id,gm);
              if (gm.songQueue.length===0) return;
              request(`https://www.googleapis.com/youtube/v3/playlists?part=id,snippet&id=${match}&key=${config.youtube.apiKey}`, function (error, response, body) {
                if (error!=null) {
                  message.channel.send(lib.embed(`**ERROR:** Could not access YouTube API`,message));
                }else {
                  body = JSON.parse(body);
                  if (!body.items[0]) return;
                  message.channel.send({embed:new Discord.MessageEmbed()
                    .setDescription(`:pager: **Playlist:** [${body.items[0].snippet.title}](https://www.youtube.com/playlist?list=${body.items[0].id}) - 0/${songQueue.length}\n:headphones: **Playing:** -------------------- Loading --------------------`)
                    .setThumbnail(body.items[0].snippet.thumbnails.default.url)
                    .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)})
                    .then(initMsg => {
                      initMsg.react('⏯').then(r => {
                        initMsg.react('⏭').then(r => {
                          initMsg.react('⏹').then(r => {
                            initMsg.react('❌').then(r => {
                              lib.queuePlayback(ytdl,guildsMap,voiceChannel,client,message,initMsg,body.items[0],{pos:0,pSize:songQueue.length});
                            });
                          });
                        });
                      });
                    });
                }
              });

            }
          });
        }else {
          let expr = args.join('+');
          request(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${expr}&type=playlist&key=${config.youtube.apiKey}`, function (error, response, body) {
            if (!JSON.parse(body).items[0]) return message.channel.send(lib.embed(`**ERROR:** No playlists found in search results`,message));
            let match = JSON.parse(body).items[0].id.playlistId;
            request(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${match}&maxResults=50&key=${config.youtube.apiKey}`, function (error, response, body) {
              if (error!=null) {
                message.channel.send(lib.embed(`**ERROR:** Could not access YouTube API`,message));
              }else {
                var songQueue = [];
                body = JSON.parse(body);
                for (var i = 0; i < body.items.length; i++) {
                  songQueue.push(body.items[i]);
                }
                songQueue = songQueue.reverse();
                if (args[1] && args[1].toLowerCase()==='shuffle')
                  songQueue = lib.durstenfeldShuffle(songQueue);

                let vconnec = client.voiceConnections.get(message.guild.id);
                if (vconnec) {
                  let dispatch = vconnec.player.dispatcher;
                  if (dispatch){
                    lib.clearQueue(guildsMap,client,message);
                    dispatch.end();
                  }
                }

                var gm = guildsMap.get(message.guild.id)
                gm.songQueue=songQueue;
                guildsMap.set(message.guild.id,gm);
                if (gm.songQueue.length===0) return;
                request(`https://www.googleapis.com/youtube/v3/playlists?part=id,snippet&id=${match}&key=${config.youtube.apiKey}`, function (error, response, body) {
                  if (error!=null) {
                    message.channel.send(lib.embed(`**ERROR:** Could not access YouTube API`,message));
                  }else {
                    body = JSON.parse(body);
                    if (!body.items[0]) return;
                    message.channel.send({embed:new Discord.MessageEmbed()
                      .setDescription(`:pager: **Playlist:** [${body.items[0].snippet.title}](https://www.youtube.com/playlist?list=${body.items[0].id}) - 0/${songQueue.length}\n:headphones: **Playing:** -------------------- Loading --------------------`)
                      .setThumbnail(body.items[0].snippet.thumbnails.default.url)
                      .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)})
                      .then(initMsg => {
                        initMsg.react('⏯').then(r => {
                          initMsg.react('⏭').then(r => {
                            initMsg.react('⏹').then(r => {
                              initMsg.react('❌').then(r => {
                                lib.queuePlayback(ytdl,guildsMap,voiceChannel,client,message,initMsg,body.items[0],{pos:0,pSize:songQueue.length});
                              });
                            });
                          });
                        });
                      });
                  }
                });

              }
            });
          });
        }
      }else{
        message.channel.send(lib.embed(`**ERROR:** Please specify a playlist link as a parameter`,message));
      }
    }
  }

  play(ytdl,winston,guildsMap,client,args,message){
    const voiceChannel = message.member.voiceChannel;
    var controls = this.controls;
    if (!voiceChannel) {
      message.channel.send(lib.embed(`**ERROR:** Please join a voice channel first`,message));
    }else {
      if (!voiceChannel.permissionsFor(client.user).has('CONNECT') || !voiceChannel.permissionsFor(client.user).has('SPEAK')){
        var padding = '';
        for (var x = voiceChannel.name.length+1; x < 38; x++) padding+=' ';
        return message.channel.send(lib.embed(`**ERROR:** Insufficient permissions\n\`\`\`${voiceChannel.name} ${padding}Speak ${voiceChannel.speakable ? '✔':'✘'} | Join ${voiceChannel.joinable ? '✔':'✘'}\`\`\``,message));
      }
      if (args[0]) {
        let regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        let match = args[0].match(regExp);
        if (args[0].match(/list=/g))
          message.channel.send(lib.embed(`**INFO:** If you're trying to queue this YouTube playlist,\nPlease use the \`${guildsMap.get(message.guild.id).prefix}playlist [link]\` command`,message));
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
              let vconnec = client.voiceConnections.get(message.guild.id);
              if (vconnec) {
                let dispatch = vconnec.player.dispatcher;
                if (dispatch){
                  lib.clearQueue(guildsMap,client,message);
                  dispatch.end();
                }
              }
              client.setTimeout(function () {
                voiceChannel.join().then(connnection => {
                  var dispatcher = connnection.playStream(stream, {passes:2, volume:0.15});
                  message.channel.send({embed:new Discord.MessageEmbed()
                    .setDescription(`:headphones: **Now Playing:** ${res.snippet.title}\n:speech_balloon: **Requested by:** ${message.member.nickname ? `${message.member.displayName} (${message.author.username})` : message.author.username}`)
                    .setThumbnail(res.snippet.thumbnails.default.url)
                    .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)}).then(m =>{
                      controls(guildsMap,client,m);
                      winston.log('info', `${res.snippet.title}`, {guildID: message.guild.id, type: 'music', messageID: m.id, ytID: match[2]});
                    });
                  // dispatcher.on('end', () => {
                    // voiceChannel.leave();
                  // });
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
              if (!response.items[0]) return;
              let res = response.items[0];
              let stream = ytdl(res.id.videoId, {
                filter : 'audioonly'
              });
              let vconnec = client.voiceConnections.get(message.guild.id);
              if (vconnec) {
                let dispatch = vconnec.player.dispatcher;
                if (dispatch){
                  lib.clearQueue(guildsMap,client,message);
                  dispatch.end();
                }
              }
              client.setTimeout(function () {
                voiceChannel.join().then(connnection => {
                  var dispatcher = connnection.playStream(stream, {passes:2, volume:0.15});
                  message.channel.send({embed:new Discord.MessageEmbed()
                    .setDescription(`:headphones: **Now Playing:** ${res.snippet.title}\n:speech_balloon: **Requested by:** ${message.member.nickname ? `${message.member.displayName} (${message.author.username})` : message.author.username}`)
                    .setThumbnail(res.snippet.thumbnails.default.url)
                    .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)}).then(m =>{
                      controls(guildsMap,client,m);
                      winston.log('info', `${res.snippet.title}`, {guildID: message.guild.id, type: 'music', messageID: m.id, ytID: res.id.videoId});
                    });
                  // dispatcher.on('end', () => {
                    // voiceChannel.leave();
                  // });
                })
              }, 250);
            }
          });
        }
      }else {
        message.channel.send(lib.embed(`**ERROR:** Please specify a search term or link as a parameter`,message));
      }
    }
  }

  stream(guildsMap,client,args,message){
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) {
      message.channel.send(lib.embed(`**ERROR:** Please join a voice channel first`,message));
    }else {
      if (!voiceChannel.permissionsFor(client.user).has('CONNECT') || !voiceChannel.permissionsFor(client.user).has('SPEAK')){
        var padding = '';
        for (var x = voiceChannel.name.length+1; x < 38; x++) padding+=' ';
        return message.channel.send(lib.embed(`**ERROR:** Insufficient permissions\n\`\`\`${voiceChannel.name} ${padding}Speak ${voiceChannel.speakable ? '✔':'✘'} | Join ${voiceChannel.joinable ? '✔':'✘'}\`\`\``,message));
      }
      if (args[0]) {
        let vconnec = client.voiceConnections.get(message.guild.id);
        if (vconnec) {
          let dispatch = vconnec.player.dispatcher;
          if (dispatch){
            lib.clearQueue(guildsMap,client,message);
            dispatch.end();
          }
        }
        if (args[0].startsWith('https')) {
          require('https').get(args[0], (res) => {
            voiceChannel.join().then(connnection => {
              var dispatcher = connnection.playStream(res, {passes:2, volume:0.15});
              dispatcher.on('end', () => {
                var np = guildsMap.get(message.guild.id);
                if (np) delete np.playing;
                guildsMap.set(message.guild.id, np);
              });
            });
          });
        }else {
          require('http').get(args[0], (res) => {
            voiceChannel.join().then(connnection => {
              var dispatcher = connnection.playStream(res, {passes:2, volume:0.15});
              dispatcher.on('end', () => {
                var np = guildsMap.get(message.guild.id);
                if (np) delete np.playing;
                guildsMap.set(message.guild.id, np);
              });
            });
          });
        }
      }else {
        message.channel.send(lib.embed(`**ERROR:** Please specify the stream url as a parameter`,message));
      }
    }
  }

  join(message){
    if (message.member.voiceChannel) {
      const voiceChannel = message.member.voiceChannel;
      if (!voiceChannel.permissionsFor(message.client.user).has('CONNECT') || !voiceChannel.permissionsFor(message.client.user).has('SPEAK')){
        var padding = '';
        for (var x = voiceChannel.name.length+1; x < 38; x++) padding+=' ';
        return message.channel.send(lib.embed(`**ERROR:** Insufficient permissions\n\`\`\`${voiceChannel.name} ${padding}Speak ${voiceChannel.speakable ? '✔':'✘'} | Join ${voiceChannel.joinable ? '✔':'✘'}\`\`\``,message));
      }else {
        return message.member.voiceChannel.join();
      }
    }else {
      message.channel.send(lib.embed(`**ERROR:** User is not connected to a Voice Channel`,message));
    }
  }

  repeat(ytdl,winston,guildsMap,client,user,message){
    const guildMember = message.guild.members.get(user.id);
    const voiceChannel = guildMember.voiceChannel;
    if (!voiceChannel) return message.channel.send(lib.embed(`**ERROR:** User is not connected to a Voice Channel\n:speech_balloon: **Requested by:** ${guildMember.nickname ? `${guildMember.displayName} (${user.username})` : user.username}`,message));
    if (!voiceChannel.permissionsFor(client.user).has('CONNECT') || !voiceChannel.permissionsFor(client.user).has('SPEAK')){
      var padding = '';
      for (var x = voiceChannel.name.length+1; x < 38; x++) padding+=' ';
      return message.channel.send(lib.embed(`**ERROR:** Insufficient permissions\n\`\`\`${voiceChannel.name} ${padding}Speak ${voiceChannel.speakable ? '✔':'✘'} | Join ${voiceChannel.joinable ? '✔':'✘'}\`\`\``,message));
    }
    var logs = [];
    if (fs.existsSync('winston.log')) {
      var rd = readline.createInterface({
        input: fs.createReadStream('winston.log'),
        output: process.stdout,
        console: false
      });
      rd.on('line', function(line) {
        var item = JSON.parse(line);
        if (item.guildID===message.guild.id && item.type==='music') {
          logs.push(JSON.parse(line));
        }
      });
      rd.on('close', function () {
        for (var i = 0; i < logs.length; i++) {
          if (logs[i].guildID===message.guild.id && logs[i].messageID===message.id) {
            let stream = ytdl(logs[i].ytID, {
              filter : 'audioonly'
            });
            const song = logs[i];
            voiceChannel.join().then(vconnec => {
              vconnec.playStream(stream, {passes:2, volume:0.15});
              return message.channel.send(lib.embed(`:headphones: **Re-playing:** ${song.message}\n:speech_balloon: **Requested by:** ${guildMember.nickname ? `${guildMember.displayName} (${user.username})` : user.username}`,message));
            });
          }
        }
      });
    }else {
      message.channel.send(lib.embed(`**ERROR:** Log file not found`,message));
    }
  }

  stop(guildsMap,client,message){
    let vconnec = client.voiceConnections.get(message.guild.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      if (dispatch)
        dispatch.end();
      var np = guildsMap.get(message.guild.id);
      if (np) delete np.playing;
      guildsMap.set(message.guild.id, np);
    }
  }

  leave(guildsMap,client,message){
    lib.clearQueue(guildsMap,client,message);
    this.stop(guildsMap,client,message);
    let vconnec = client.voiceConnections.get(message.guild.id);
    if (vconnec) vconnec.disconnect();
  }

  pause(client,message){
    let vconnec = client.voiceConnections.get(message.guild.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      if (dispatch)
        dispatch.pause();
    }
  }

  resume(client,message){
    let vconnec = client.voiceConnections.get(message.guild.id);
    if (vconnec) {
      let dispatch = vconnec.player.dispatcher;
      if (dispatch)
        dispatch.resume();
    }
  }

  radio(guildsMap,args,message){
    var prefix = guildsMap.get(message.guild.id).prefix;
    var stream = this.stream;
    if (args[0]) {
      var choice = parseInt(args[0])-1;
      if (choice>0 && choice<config.radio.length) {
        request(`https://feed.tunein.com/profiles/${config.radio[choice].tuneinId}/nowPlaying`, function (error, response, body) {
          if (error!=null) {
            message.channel.send(lib.embed(`**ERROR:** Could not access TuneIn API`,message));
          }else {
            body = JSON.parse(body);
            stream(guildsMap,client,[config.radio[choice].url],message);
            var guildData = guildsMap.get(message.guild.id);
            guildData.playing = config.radio[choice].tuneinId;
            guildsMap.set(message.guild.id,guildData);
            message.channel.send({embed:new Discord.MessageEmbed()
              .setDescription(`**Now Streaming:** ${config.radio[choice].title}\n${body.Secondary ? `**Currently Playing:**  ${body.Secondary.Title}`:''}`)
              .setThumbnail(body.Primary.Image)
              .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
          }
        });
      }else {
        message.channel.send(lib.embed(`**ERROR:** Selection does not exist`,message));
      }
    }else {
      var desc = ``;
      for (var i = 0; i < config.radio.length; i++) {
        var commandPadding = '';
        var titlePadding = '';
        for (var x = prefix.length+('radio').length+(i+1).toString().length; x < 11; x++) {
          commandPadding+=' ';
        }
        for (var x = config.radio[i].title.length; x < 30; x++) {
          titlePadding+=' ';
        }
        desc += `${guildsMap.get(message.guild.id).prefix}radio ${i+1}${commandPadding} | ${config.radio[i].title}${titlePadding} | ${config.radio[i].genre}\n`;
      }
      message.channel.send({embed:new Discord.MessageEmbed()
        .setTitle(`:radio: Programmed Stations:`)
        .setDescription(`\`\`\`Command      | Radio Station                  | Genre\n-------------------------------------------------------------\n${desc}\`\`\``)
        .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
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
          message.channel.send({embed:new Discord.MessageEmbed()
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
    request(`https://smugs.safe.moe/api/v1/i/r`, function (error, response, body) {
      if (!error && response.statusCode !== 200) {
        message.channel.send(lib.embed(`**ERROR:** Could not access safe.moe resource`,message));
      }else {
        try {
		      body = JSON.parse(body);
          if (body.nsfw) {
            return this.smug(message);
          }else {
            message.channel.send({embed:new Discord.MessageEmbed()
              .setImage(`https://smugs.safe.moe/${body.url}`)
              .setDescription(`ˢᵐᵘᵍˢ ᵖʳᵒᵛᶦᵈᵉᵈ ᵇʸ [ˢᵃᶠᵉ⋅ᵐᵒᵉ](https://smugs.safe.moe)`)
              .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
          }
  			} catch (e) {
          message.channel.send(lib.embed(`**ERROR:** ${e}`,message));
  			}
      }
    });
  }

  invite(client,message){
    client.generateInvite(8).then(link => {
      message.channel.send({embed:new Discord.MessageEmbed()
        .setDescription(`You can use this [LINK](${link}) to invite me to your server! :sparkling_heart:`)
        .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
    });
  }

  setprefix(guildsMap,guildPrefix,args,message){
    if (message.guild.roles.exists('name', 'Admin')) {
      var newprefix = args.join('');
      if(newprefix){
        var admins = message.guild.roles.find('name', 'Admin').members;
        if (admins.has(message.author.id)) {
          // set the prefix here
          guildsMap.set(message.guild.id,{prefix:newprefix});
          message.channel.send(lib.embed(`**SUCCESS:** Now listening for the prefix: \`${newprefix}\``,message));
          lib.writeMapToFile(guildsMap);
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
    message.react('⏯').then(r => {
        message.react('⏹').then(r => {
          message.react('🔁').then(r => {
            message.react('❌').then(r => {
            })
          })
        })
    })
  }

  insta(args,message){
    if (args[0]) {
      const scraper = require('insta-scraper');
      if (args[0].startsWith('#')) {
        var hashtag = args[0].slice(1);
        scraper.getMediaByTag(hashtag, function(error,response){
          var post = response.top_posts.nodes[0];
          message.channel.send({embed:new Discord.MessageEmbed()
                .setDescription(`https://www.instagram.com/p/${post.code}\n${post.caption}`)
                .setImage(post.display_src)
                .setFooter(`♥ ${post.likes.count} | 💬 ${post.comments.count}`)
                .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
        })
      }else {
        scraper.getAccountInfo(args[0], function(error,response){
          if (response.is_private)
          return message.channel.send({embed:new Discord.MessageEmbed()
                .setAuthor(`@${response.username} | ${response.full_name}`,response.profile_pic_url,`https://www.instagram.com/${response.username}`)
                .setDescription(`**ERROR:** User is a private account`)
                .setImage(response.profile_pic_url_hd)
                .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});

          for (var i = 0; i < response.media.nodes.length; i++) {
            if (!response.media.nodes[i].is_video) {
              var post = response.media.nodes[i];
              message.channel.send({embed:new Discord.MessageEmbed()
                    .setAuthor(`@${response.username} | ${response.full_name}`,response.profile_pic_url,`https://www.instagram.com/${response.username}`)
                    .setDescription(`https://www.instagram.com/p/${post.code}\n${post.caption}`)
                    .setImage(post.display_src)
                    .setFooter(`♥ ${post.likes.count} | 💬 ${post.comments.count}`)
                    .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
              break;
            }
          }
          if(i>=response.media.nodes.length) message.channel.send(lib.embed(`**ERROR:** No recent image posts found for @${args[0]}`,message));
        })
      }
    }else {
      message.channel.send(lib.embed(`**Usage:** !insta <username>`,message));
    }
  }

  pubg(args,message){
    if (args[0]) {
      const {PubgAPI, PubgAPIErrors} = require('pubg-api-redis');
      const api = new PubgAPI({apikey: config.pubg.apiKey});

      api.profile.byNickname(args[0]).then((data) => {
        var regionStats = [];
        var region = '';

        if (args[1])
          region = args[1];
        else
          region = data.selectedRegion;

        for (var i = 0; i < data.Stats.length; i++) {
          if (data.Stats[i].Region===region && data.Stats[i].Season===data.defaultSeason)
            regionStats.push(data.Stats[i]);
        }
        var statArray = ['KillDeathRatio','Rating'];
        var desc = ``;
        for (var i = 0; i < regionStats.length; i++) {
          desc += `\`\`\`\n${regionStats[i].Match.toUpperCase()}\n--------------------------------------------------------\n`;
          for (var j = 0; j < regionStats[i].Stats.length; j++) {
            if (statArray.includes(regionStats[i].Stats[j].field))
              desc += `${regionStats[i].Stats[j].label}: ${regionStats[i].Stats[j].displayValue}\n`;
            if (regionStats[i].Stats[j].field==='Rating')
              desc += `Rank: ${parseInt(regionStats[i].Stats[j].rank).toLocaleString()}\n`;
          }
          desc += `\`\`\``;
        }
        message.channel.send({embed:new Discord.MessageEmbed()
                .setAuthor(`${data.PlayerName}`,data.Avatar)
                .setDescription(`**Region:** ${region ? region.toUpperCase():'---'} | **Season:** ${data.seasonDisplay}\n${desc!==''? desc:`\`\`\`No stats recorded for ${data.PlayerName} ${region ? `on ${region.toUpperCase()}`:''}\n\nMaybe try using ${guildsMap.get(message.guild.id).prefix}pubg <username> <region>\nRegions: NA,SA,EU,AS,SEA,OC\`\`\``}`)
                .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
      }).catch((e) => {
        message.channel.send(lib.embed(`**ERROR:** ${e.message}`,message));
      });
    }else {
      message.channel.send(lib.embed(`**Usage:** !pubg <username>`,message));
    }
  }

  hearthstone(args,message){
    var card = args.join(' ');
    request({url:`https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/${card}?collectible=1`,headers: {'X-Mashape-Key': config.hearthstone.apiKey}}, function (error, response, body) {
      if (!body.error && response.statusCode !== 200) {
        try {
          body = JSON.parse(body);
          message.channel.send(lib.embed(`**ERROR:** ${body.message}`,message));
        } catch (e) {
          console.log(e);
        }
      }else {
        try {
		      body = JSON.parse(body);
          if (body[0]) {
            var desc = ``;
            if (body.length>1) {
              desc += `\`\`\`js\nMultiple Cards Matching <${args}>:\n`;
              for (var i = 0; i < body.length; i++) {
                desc += `"${_.escapeRegExp(body[i].name)}"\n`;
              }
              desc += `\`\`\``;
              message.channel.send({embed:new Discord.MessageEmbed()
                .setDescription(desc)
                .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
            }else {
              message.channel.send({embed:new Discord.MessageEmbed()
                .setDescription(`\`\`\`js\nCard:    '${body[0].name}'\nRarity:  '${body[0].rarity}'\nClass:   '${body[0].playerClass}'\nCardset: '${body[0].cardSet}'\`\`\``)
                .setImage(body[0].img)
                .setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
            }
          }else {
            message.channel.send(lib.embed(`**ERROR:** No cards found.`,message));
          }
  			} catch (e) {
          message.channel.send(lib.embed(`**ERROR:** ${e}`,message));
  			}
      }
    });
  }

}

module.exports = new Commands();
