module.exports = function (tennu) {
	var moment = require('moment');
	var addlist = function(message, action) {
		nicklist[message.nickname.toLowerCase()] = { "action" : action,
													 "timestamp" : new Date() };

	}
	var nickMessage = function(target) {
		var result = nicklist[target.toLowerCase()];
		return target + " " + result.action + " " + moment(result.timestamp).fromNow() + ".";

	}
	var nicklist = {};
	return {
		dependencies: [],
		exports: {
			help: "Usage:  seen <nick>"
		},
		handlers: {
			"!seen": function(command) {
				var target = command.args.shift();
				if (typeof nicklist[target.toLowerCase()] === 'undefined') {
					tennu.say(command.channel, target + " has not joined or left since I got here");
				} else {
					tennu.say(command.channel, nickMessage(target));
				}
			},
			"!who": function(command) {
				tennu.say(command.channel, "I don't do the who thing yet");
			},
			"privmsg": function(message) {
				addlist(message, "spoke");
			},
			"join": function(message) {
				addlist(message, "joined");
			},
			"quit": function(message) {
				addlist(message, "quit");
			},
			"part": function(message) {
				addlist(message, "parted");
			}
		}
	};
};
