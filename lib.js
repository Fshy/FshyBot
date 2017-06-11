const Discord   = require('discord.js');
const config    = require('./config.json');

// Helper Functions
class Lib {
  embed(text,message){
    return ({embed:new Discord.RichEmbed().setDescription(text).setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
  }

  checkOwner(message){
    return (message.author.id===config.ownerID);
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
}

module.exports = new Lib();
