module.exports = function (tennu) {
	var addlist = function(message) {
		nicklist[message.nickname.toLowerCase()] = message + " " + (new Date());
	}
	var nicklist = {};
	return {
		dependencies: [],
		exports: {
			help: "Usage:  last-seen <nick>"
		},
		handlers: {
			"!seen": function(command) {
				var target = command.args.shift();
				if (typeof nicklist[target.toLowerCase()] === 'undefined') {
					tennu.say(command.channel, target + " has not joined or left since I got here");
				} else {
					tennu.say(command.channel, nicklist[target.toLowerCase()]);
				}
			},
			"join": function(message) {
				addlist(message);
			},
			"quit": function(message) {
				addlist(message);
			},
			"part": function(message) {
				addlist(message);
			}
		}
	};
};
