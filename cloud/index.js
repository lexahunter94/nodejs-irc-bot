database.CloudInstance = function(/* class */) {
	this.object = new Object(); // Объект данных
	this.path = "./cloud.json"; // Путь к файлу, в котором хранятся данные
	this.save = function() {
		// Сохранить базу на диск.
		var info;
		try {
			info = JSON.stringify(this.object);
			filesystem.savetextfile(this.path, info);
		} catch(ex) {
			global.lasterror = ex;
		}
	};
	this.restore = function() {
		// Восстановить базу с диска. Возвращает количество корневых записей.
		var i = 0;
		if (filesystem.fileexists(this.path)) {
			try {
				var info = JSON.parse(filesystem.readtextfile(this.path));
				if (typeof info != "undefined") for (var x in info) {
					this.object[x] = info[x];
					i++;
				} else echo("Cloud base cleanup.");
			} catch(ex) {
				global.lasterror = ex;
				reporterror("Failed load cloud database");
			}
		}
		return i;
	};
	this.fragment = function() {
		// Возращает количество корневых записей, сохраненных на диске.
		var i = 0;
		if (filesystem.fileexists(this.path)) {
			try {
				var info = JSON.parse(filesystem.readtextfile(this.path));
				if (typeof info != "undefined") for (var x in info) i++;
			} catch(ex) {
				global.lasterror = ex;
			}
		}
		return i;
	};
	this.clear = function(force) {
		// Очищает базу на диске и при заданном параметре force удаляет базу с диска.
		filesystem.savetextfile(this.path, nullstring);
		if (typeof force != "undefined") {
			for (var x in this.object) delete this.object[x];
			filesystem.deletefile(this.path);
		}
		return true;
	}
	this.kill = function() {
		// Очищает объект данных.
		for (var x in this.object) delete this.object[x];
		return true;
	};
	this.concatSearch = function() {
		// Объединяет результаты поисков в базе. Аргументы - результаты работы функций cloud.search... ()
		var a = {query: [], data: []};
		for (var i = 0; i < arguments.length; i++) {
			a.query.push(arguments[i].query);
			for (var j = 0; j < arguments[i].data.length; j++) a.data.push(arguments[i].data[j]);
		}
		return a;
	};
	this.create = function(dest, name, templ) {
		// Воссоздает данные из шаблона, содержащимся в базе cloud.object.__creators__
		var t = templ.trim().toLowerCase();
		dest[name] = new Object();
		for (var x in this.object.__creators__[t]) dest[name][x] = this.object.__creators__[t][x];
	};
	this.searchLT = function(str, obj) {
		// Поиск свойств в объекте obj, удовлетворяющим str, по соответствию слева.
		var result = { data: [], query: str.toLowerCase() };
		for (var x in obj) if (result.query == x.substr(0, str.length).toLowerCase()) result.data.push({name: x, value: obj[x]});
		return result;
	};
	this.searchRT = function(str, obj) {
		// Поиск свойств в объекте obj, удовлетворяющим str, по соответствию справа.
		var result = { data: [], query: str.replace(" ", "_").toLowerCase() };
		for (var x in obj) if (result.query == x.substr(x, -str.length).toLowerCase()) result.data.push({name: x, value: obj[x]});
		return result;
	};
	this.searchGE = function(str, obj) {
		// Поиск свойств в объекте obj, удовлетворяющим str, по частичному соответствию в ключе значении.
		var result = { data: [], query: str.toLowerCase() };
		for (var x in obj) if (x.toLowerCase().search(result.query) >= 0) result.data.push({name: x, value: obj[x]});
		return result;
	};
	this.searchEQ = function(str, obj) {	
		// Поиск свойств в объекте obj, удовлетворяющим str, по точному соответствию в ключе значении.
		var result = { data: [], query: str.replace(" ", "_").toLowerCase() };
		for (var x in obj) if (result.query == x.toLowerCase()) result.data.push({name: x, value: obj[x]});
		return result;
	};
	this.searchNE = function(str, obj) {
		// Поиск свойств в объекте obj, удовлетворяющим str, по несоответствию в ключе значении.
		var result = { data: [], query: str.replace(" ", "_").toLowerCase() };
		for (var x in obj) if (result.query != x.toLowerCase()) result.data.push({name: x, value: obj[x]});
		return result;
	};
	this.searchLTV = function(str, obj, name, slash) {
		// Поиск свойств с ключем name в объекте obj, удовлетворяющим str, по соответствию слева. Если задано свойство slash, то пробелы преобразуются в нижнее подчеркивание ("_")
		var result = { data: [], query: str.toLowerCase() };
		if (typeof slash != "undefined") result.query = result.query.replace(" ", "_");
		if (typeof name == "undefined") {
			for (var x in obj) if (result.query == obj[x].substr(0, str.length).toLowerCase()) result.data.push({name: x, value: obj[x]});
		} else for (var x in obj) if (result.query == obj[x][name.toLowerCase()].substr(0, str.length).toLowerCase()) result.data.push({name: x, value: obj[x]});
		return result;
	};
	this.searchRTV = function(str, obj, name, slash) {
		// Поиск свойств с ключем name в объекте obj, удовлетворяющим str, по соответствию справа. Если задано свойство slash, то пробелы преобразуются в нижнее подчеркивание ("_")
		var result = { data: [], query: str.toLowerCase() };
		if (slash) result.query = result.query.replace(" ", "_");
		if (typeof name == "undefined") {
			for (var x in obj) if (result.query == obj[x].substr(obj[x].length - str.length).toLowerCase()) result.data.push({name: x, value: obj[x]});
		} else for (var x in obj) if (result.query == obj[x][name.toLowerCase()].substr(obj[x][name.toLowerCase()].length - str.length)) result.data.push({name: x, value: obj[x]});
		return result;
	};
	this.searchGEV = function(str, obj, name, slash) {
		// Поиск свойств с ключем name в объекте obj, удовлетворяющим str, по частичному соответствию. Если задано свойство slash, то пробелы преобразуются в нижнее подчеркивание ("_")
		var result = { data: [], query: str.toLowerCase() };
		if (slash) result.query = result.query.replace(" ", "_");
		if (typeof name == "undefined") {
			for (var x in obj) {
				try {
					if (obj[x].toLowerCase().search(new RegExp(result.query.replace(/\s/g, "\\s"), "gm")) != -1) result.data.push({name: x, value: obj[x]});
				} catch(ex) { }
			}
		} else for (var x in obj) {
			try {
				if (obj[x][name.toLowerCase()].search(new RegExp(result.query.replace(/\s/g, "\\s").replace(/\"/g, "\\\"").replace(/\'/g, "\\\'"), "gm")) != -1) result.data.push({name: x, value: obj[x]});
			} catch(ex) { }
		}
		return result;
	};
	this.searchEQV = function(str, obj, name, slash) {
		// Поиск свойств с ключем name в объекте obj, удовлетворяющим str, по точному соответствию. Если задано свойство slash, то пробелы преобразуются в нижнее подчеркивание ("_")
		var result = { data: [], query: str.toLowerCase() };
		if (slash) result.query = result.query.replace(" ", "_");
		if (typeof name == "undefined") {
			for (var x in obj) if (result.query == obj[x].toLowerCase()) result.data.push({name: x, value: obj[x]});
		} else for (var x in obj) if (result.query == obj[x][name.toLowerCase()].toLowerCase()) result.data.push({name: x, value: obj[x]});
		return result;
	};
	this.searchNEV = function(str, obj, name, slash) {
		// Поиск свойств с ключем name в объекте obj, удовлетворяющим str, по несоответствию. Если задано свойство slash, то пробелы преобразуются в нижнее подчеркивание ("_")
		var result = { data: [], query: str.toLowerCase() };
		if (slash) result.query = result.query.replace(" ", "_");
		if (typeof name == "undefined") {
			for (var x in obj) if (result.query != obj[x].toLowerCase()) result.data.push({name: x, value: obj[x]});
		} else for (var x in obj) if (result.query != obj[x][name.toLowerCase()].toLowerCase()) result.data.push({name: x, value: obj[x]});
		return result;
	};
	this.searchQuery = function(str, obj) {
		// Запрос в локальную базу на языке SQL. В стадии разработки.
		var result = { data: [], query: str.replace(" ", "_").toLowerCase() };
		for (var name in obj) {
			var value = obj[name];
			if (eval(str)) result.data.push({name: query, value: obj[query]});
		}
		return result;
	};
};
global.cloud = new database.CloudInstance();