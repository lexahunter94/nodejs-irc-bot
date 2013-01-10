global.fs = require("fs");
global.filesystem = new Object();
filesystem.readtextfile = function(path, enc) {
	// Считывает текстовый файл path в кодировке enc (по умолчанию enc = "utf8"). В случает отсутствия файла или ошибки возращает пустую строку и помещает ошибку в global.lasterror.
	try {
		if (typeof enc == "undefined") var enc = CONFIG.encoding;
		return fs.readFileSync(path, enc);
	} catch(ex) {
		global.lasterror = ex;
		return "";
	}
};
filesystem.savetextfile = function(path, data) {
	// Сохраняет и перезаписывает текстовый файл path в кодировке с которой работает севрер (обычно это "utf8"). При отсутствии файла на диске создает его.
	return fs.writeFileSync(path, data, CONFIG.encoding);
};