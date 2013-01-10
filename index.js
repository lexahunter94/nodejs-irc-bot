global.irc = require("./irc");
irc.bot = new irc.Client("irc.rusnet.ru", "JS", {port: 6660, password: "alexcool6786", userName: "js", realName: "JavaScript Programming Bot", channels: ["#javascript"]});

irc.bot.addBan = function(nick) {
	if (irc.bot.checkBan(nick)) return false;
	cloud.object.irc.rusnet.banned.push(nick.trim().toLowerCase());
	return true;
};
irc.bot.checkBan = function(nick) {
	if (typeof cloud.object.irc.rusnet.banned == "undefined") cloud.object.irc.rusnet.banned = [];
	for (var i = 0; i < cloud.object.irc.rusnet.banned.length; i++) if (nick.trim().toLowerCase() == cloud.object.irc.rusnet.banned[i].trim().toLowerCase()) return true;
	return false;
};

irc.bot.eval = function(from, code, to) {
	if (irc.bot.checkBan(from)) {
		irc.bot.say(to, "Уважаемый " + from + ", вы занесены в банлист, ваши скрипты и вечные двигатели больше не выполняются.");
		return;
	}
	if (typeof cloud.object.irc.rusnet.history[from] == "undefined") cloud.object.irc.rusnet.history[from] = [];
	if (typeof to == "undefined") var to = "#javascript";
	var a = [];
	for (var i = 0; i < arguments.length; i++) a.push(arguments[i]);
	var arguments = a;
	irc.bot.timeout = setTimeout((function(f, fr, t) {
		f.from = fr;
		f.to = to;
		return f;
	})(function() {
		irc.bot.say(arguments.callee.to, "Уважаемый криворукий человек, по имени " + arguments.callee.from + ". Ты запустил скрипт, в котором есть вечный цикл или скрипт который не завершается в течении 15 сек., чтобы избежать нагрузки на CPU бот будет перезагружен, а ты добавлен в банлист Все sandbox'ы будут частично сохранены.");
		setTimeout(function() {
			irc.bot.addBan(arguments.callee.from);
			irc.exit();
		}, 5000);
	}, from, to), 15000);
	process.nextTick(function () {
		try {
			var e = vm.runInNewContext(code, irc.bot.context, from + ".js");
			var r = irc.bot.testMuch(irc.bot.context.console._output + util.inspect(e, false, null, false));
			irc.bot.say(to, r);
			irc.bot.context.console._output = "";
			clearTimeout(irc.bot.timeout);
		} catch(ex) {
			var r = "[ERROR: throw found]";
			if (typeof ex.message != "undefined") {
				var r = "[ERROR: " + irc.bot.testMuch(ex.message) + "]";
				irc.bot.say(to, r);
			} else irc.bot.say(to, r);
			clearTimeout(irc.bot.timeout);
		}
	});
	cloud.object.irc.rusnet.history[from].push([code, r]);
};
irc.bot.evalhistory = function() {
	for (var user in cloud.object.irc.rusnet.history) for (var c = 0; c < cloud.object.irc.rusnet.history[user].length; c++) {
		try {
			var a = [];
			for (var i = 0; i < arguments.length; i++) a.push(arguments[i]);
			var arguments = a;
			vm.runInNewContext(cloud.object.irc.rusnet.history[user][c][0], irc.bot.context, from + ".js");
		} catch(ex) { }
	}
};
irc.bot.history = function(from) {
	if (typeof cloud.object.irc.rusnet.history[from] == "undefined") cloud.object.irc.rusnet.history[from] = [];
	if (cloud.object.irc.rusnet.history[from].length == 0) {
		irc.bot.say(from, "У вас нет истории комманд");
	} else if (cloud.object.irc.rusnet.history[from].length <= 3) {
		var h = "История комманд " + from + "\n";
		for (var i = 0; i <= 2; i++) h += cloud.object.irc.rusnet.history[from][i][0] + "\n";
		irc.bot.say(from, h);
	} else {
		var h = "История комманд " + from + "\n";
		for (var i = cloud.object.irc.rusnet.history[from].length - 1; i >= cloud.object.irc.rusnet.history[from].length - 4; i--) h += cloud.object.irc.rusnet.history[from][i][0] + "\n";
		irc.bot.say(from, h);
	}
};

irc.bot.intro = function(from) {
	irc.bot.say(from, "Это простой бот для выполнения JavaScript в контексте IRC. Бот предоставлен для канала #javascript сети irc.rusnet.ru забавы ради. Чтобы выполнить запрос к боту в чате комнаты введите javascript: и ваш код, который вы хотите выполнить. Возможно также сохранение ваших кодов на сайте govnokod.ru, а также ваших sandbox'ов, но об этом чуть позже. Для просмотра этого текста ещё раз введите //intro");
	cloud.object.irc.rusnet.helpmessage[from] = true;
};

irc.bot.context = {
	console: {
		_output: "",
		_print: function() {
			var o = "";
			for (var i = 0; i < arguments.length; i++) {
				if (typeof arguments[i] == "object") {
					o += util.inspect(arguments[i], false, null, false);
				} else if (typeof arguments[i] == "string") {
					o += arguments[i];
				} else if (typeof arguments[i] == "number") {
					o += String(arguments[i]);
				} else if (arguments[i] == null) {
					o += "null";
				} else o += String(arguments[i]).trim();
			}
			return o;
		},
		log: function() {
			this._output += this._print.apply(this, arguments) + "\n";
		},
		info: function() {
			this._output += this._print.apply(this, arguments) + "\n";
		},
		warn: function() {
			this._output += this._print.apply(this, arguments) + "\n";
		},
		error: function() {
			this._output += this._print.apply(this, arguments) + "\n";
		}
	},
	iconv: {
		encode: function(text, encoding) {
			return iconv.encode(text, encoding).toString();
		},
		decode: function(text, encoding) {
			return iconv.decode(text, encoding).toString();
		}
	},
	Math: Math,
	arguments: { message: "Sorry, you don't have permission to this object." },
	process: { message: "Sorry, you don't have permission to this object." },
	irc: { message: "Sorry, you don't have permission to this object." },
	server: { message: "Sorry, you don't have permission to this object." },
	exec: function() { return "Sorry, you don't have permission to this function." }
};
irc.bot.testMuch = function(s) {
	if (String(s).length > 100) {
		return String(s).substr(0, 100) + "     [. . . Over 9000 result . . .]";
	} else if (String(s).split("\n", 3).length >= 3) {
		var a = String(s).split("\n", 3);
		return a[0] + "\n" + a[1] +  "     [. . . Over 9000 result . . .]";
	} else return String(s);
};
irc.bot.addListener('motd', function(motd) {
	irc.bot.send("NickServ", "IDENTIFY", "alexcool6786");
	irc.bot.evalhistory();
});
irc.bot.addListener('message#javascript', function (from, message) {
	if (message.trim().substr(0, 3).toLowerCase() == "js:") irc.bot.eval(from, message.trim().substr(3).trim());
});
irc.bot.addListener('ctcp-version', function(from, to) {
	irc.bot.ctcp(from, 'notice', "JavaScript programming bot by lexahunter94. (Type \/\/? for more info.)");
});
irc.bot.addListener('pm', function(from, text) {
	if (text.trim().substr(0, 2) == "\/\/") {
		var m = text.trim().substr(2).trim().toLowerCase();
		switch (m) {
			case "?": { irc.bot.say(from, "//? - показать это сообщение; //intro - показать вступительное сообщение; //history - вывести последнии три операции введенные вами; //last - вывести последнюю операцию и результат к ней."); }
			case "intro": { irc.bot.intro(from); }
			case "history": { irc.bot.history(from); }
		}
	}
	if (typeof cloud.object.irc.rusnet.helpmessage[from] == "undefined") {
		irc.bot.intro(from);
		return;
	} else irc.bot.eval(from, text.trim(), from);
});
irc.bot.addListener('error', function(message) {
	util.log("\033[01;31mBOT ERROR: " + util.inspect(message) + "\033[0m\n");
});
irc.exit = function() {
	irc.bot.part("#javascript");
	irc.bot.disconnect();
	cloud.save();
	process.exit();
};