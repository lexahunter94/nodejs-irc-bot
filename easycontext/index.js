// ANSI цвета для консоли NodeJS.
global.ansi = {
	// Константы кодов цветов консоли NodeJS.
	OFF: 0,
	BOLD: 1,
	ITALIC: 3,
	UNDERLINE: 4,
	BLINK: 5,
	INVERSE: 7,
	HIDDEN: 8,
	BLACK: 30,
	RED: 31,
	GREEN: 32,
	YELLOW: 33,
	BLUE: 34,
	MAGENTA: 35,
	CYAN: 36,
	WHITE: 37,
	_BLACK: 40,
	_RED: 41,
	_GREEN: 42,
	_YELLOW: 43,
	_BLUE: 44,
	_MAGENTA: 45,
	_CYAN: 46,
	_WHITE: 47,
	setColor: function(str, color) {
		// Обрамляет содержимое строки str, в терминальный цвет color, если он задан.
		if (!color) return str;
		return "\033[" + String(color) + "m" + str + "\033[" + global.ansi.OFF + "m";
	},
	write: function(message, color) {
		// Обрамляет содержимое строки str, в терминальный цвет color, если он задан и выводит в консоль без переводом строки.
		if (typeof color == "undefined") {
			process.stdout.write(String(message));
		} else process.stdout.write(global.ansi.setColor(String(message), color));
	},
	writeln: function(message, color) {
		// Обрамляет содержимое строки str, в терминальный цвет color, если он задан и выводит в консоль с переводом строки.
		global.ansi.write(String(message) + "\n", color);
	}
};

global.echo = function(data) {
	// Выводит данные в консоль
	ansi.write(" [FLEX]", ansi.CYAN);
	if ((typeof data == "string") || (typeof data == "number")) {
		process.stdout.write(": " + String(data) + "\n");
	} else {
		process.stdout.write(":\n");
		if (data instanceof Error) {
			process.stdout.write(data.stack);
		} else debug.inspectVar(data);
	}
};
global.reporterror = function(desc) {
	// Уведомляет об ошибке desc в терминале NodeJS
	if (CONFIG.logerrors) {
		process.stdout.write("\x07");
		ansi.write("[ERROR]", ansi.RED);
		process.stdout.write(": " + desc + "\r\nDetails:\r\n\r\n");
		if (lasterror != null) {
			console.log(lasterror);
			console.log(lasterror.stack);
		} else console.log("[no details]");
		console.log("\r\n");
	}
};