module.exports = function (tennu) {
	var moment = require('moment');
	var fs = require('fs');
	var lodash = require('lodash');

	var addlist = function(message) {
		var messageSpecific = function(message) {
			switch(message.command) {
				case 'privmsg':
					return { action: "spoke",
							 message: message.message };
				case 'join':
					return { action: "joined",
							 message: ""};
				case 'part':
				    return { action: "parted",
				    	     message: message.reason || "" };
				case 'quit':
					return { action: "quit",
							 message: message.reason || "" };
			}
		};
		var record = { 
					"timestamp" : new Date(),
				    "channel": message.channel,
		};
		console.log("Detected event and serializing");
		console.log("command is " + JSON.stringify(message.command));
		console.log("message specific object is " + JSON.stringify(messageSpecific(message)));
		record = lodash.defaults(record, messageSpecific(message));
		console.log(JSON.stringify(record));
		nicklist[message.nickname.toLowerCase()] = record;
	};
	var channelText = function(channel) {
		if (typeof(channel) !== 'undefined') {
			return " in " + channel;
		} else {
			return "";
		}
	};

	var nickMessage = function(target) {
		var result = nicklist[target.toLowerCase()];
		return target + " " + result.action + " " + moment(result.timestamp).fromNow() + channelText(result.channel) + ".";
	};

	var allNickMessage = function(target) {
		var result = nicklist[target.toLowerCase()];
		var allText = target + " was last seen on " + moment(result.timestamp).format("dddd, MMMM Do YYYY [at] H:mm") + 
		              " " + result.action + channelText(result.channel);
		if (result.action === 'spoke') {
			if (result.message) {
				return allText + " saying \"" + result.message + "\"";
			} else { 
				return allText;
			}
		} 
		if (result.message && result.message.length > 0) {
			return allText + " with reason \"" + result.message +"\""; 
		}
		return allText;
	};

	var nicklist = {};
	var gotHere = new Date();
	return {
		dependencies: [],
		exports: {
			help: "Usage:  seen <nick>"
		},
		handlers: {
			"!seen": function(command) {
				var target = command.args.shift();
				if (typeof nicklist[target.toLowerCase()] === 'undefined') {
					tennu.say(command.channel, 
						target + " has not joined or left since I got here " + moment(gotHere).fromNow());
				} else {
					if (command.args[0] === 'all') {
						tennu.say(command.channel, allNickMessage(target));
					} else {
						tennu.say(command.channel, nickMessage(target));
					}
				}
			},
			"!who": function(command) {
				tennu.say(command.channel, "I don't do the who thing yet");
			},
			"!store": function(command) {
				var txt = JSON.stringify(nicklist, null, 4);
				console.log("Writing " + txt);
				fs.writeFile('nicklist.log', txt, {}, function(err) {
					if (err) throw err;
					console.log("nicklist object saved");
				});
			},
			"!load": function(command) {
				fs.readFile('nicklist.log', {}, function(err, data) {
					if (err) {
						console.log("Unable to read log file");
						return;
					}
					var oldList = JSON.parse(data);
					nicklist = lodash.defaults(nicklist, oldList);
				});
			},
			"privmsg": function(message) {
				addlist(message, "spoke");
			}
		}
	};
};
