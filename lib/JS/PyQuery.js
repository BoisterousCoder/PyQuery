/*
	If you'd like to make changes to the api, start here.
	This is where you can add handlers for commands and requests
*/

var pyDir = '../lib/PY/main.py';
var root;
var platform;

$(function () {
	var indexedElements = [];
	var placeholderIds = 0;

	python = makePython();
	
	//commands
	python.add.commandHandler('warn', function (data) {
		console.warn('Python Warns:' + data.msg);
	});
	python.add.commandHandler('alert', function (data) {
		alert(data.msg);
	});
	python.add.commandHandler('killMe', function (data) {
		py.kill();
		console.warn("Python is requesting death");
		alert("Python Suicided");
	});
	python.add.commandHandler('css', function (data) {
		getJqueryObj(data.selector, data.index).css(data.rules);
	});
	python.add.commandHandler('html', function (data) {
		getJqueryObj(data.selector, data.index).html(data.text);
	});
	python.add.commandHandler('append', function (data) {
		getJqueryObj(data.selector, data.index).append(data.text);
	});
	python.add.commandHandler('attribute', function (data) {
		getJqueryObj(data.selector, data.index).attr(data.property, data.value);
	});
	python.add.commandHandler('value', function (data) {
		return getJqueryObj(data.selector, data.index).value(data.value);
	});
	python.add.commandHandler('toggleClass', function(data){
		getJqueryObj(data.selector, data.index).toggleClass(data.class)
	})
	python.add.commandHandler('callback', function (data) {
		getJqueryObj(data.selector, data.index)[data.type](function (event) {
			if(this.id==''){
				placeholderIds++;
				this.id = 'PlaceholderId'+placeholderIds;
			}
			py.call(data.name, '#'+this.id);
		});
	});
	
	//requests
	python.add.requestHandler('index', function (data) {
		i = indexedElements.length;
		indexedElements[i] = $(data.selector);
		return i;
	});
	python.add.requestHandler('attribute', function (data) {
		return getJqueryObj(data.selector, data.index).attr(data.property);
	});
	python.add.requestHandler('css', function (data) {
		return getJqueryObj(data.selector, data.index).css(data.property);
	});
	python.add.requestHandler('html', function (data) {
		return getJqueryObj(data.selector, data.index).html();
	});
	python.add.requestHandler('size', function (data) {
		return getJqueryObj(data.selector, data.index).size();
	});
	python.add.requestHandler('value', function (data) {
		return getJqueryObj(data.selector, data.index).value();
	});
	
	function getJqueryObj(selector, index) {
		if (isNaN(index)) {
			return $(selector)
		} else {
			return indexedElements[index]
		}
	}
});




/*
	main API portion
	it is not recomended you make changes to this section unless you know what you are doing
*/


function makePython() {
	platform = require("os").platform;
	root = process.cwd() + '/';

	console.info('nw.js version:' + process.version);
	console.info('platform:' + platform());
	console.info('root directory:' + root);

	if (platform == 'win32') {
		root = root.replaceAll('/', '\\');
		pyDir = pyDir.replaceAll('/', '\\');
	}


	var spawnChild = require('child_process').spawn;

	py = {
		process: spawnChild('python', ['-u', root + pyDir]), //launches python
		onLog: function (data) {
			console.log('python log: ' + data);
		},
		onCommand: {
			
		},
		onRequest:{
			
		},
		call: function (name, eventData) {
			res = '<*>'+name+'<*>'+eventData;
			res = res.replaceAll('\n', ' ');
			res += '\n';
			py.process.stdin.write(res);
		},
		onClose: function (code) {
			console.log('python exited with code ' + code);
		},
		onError: function (data) {
			console.error('python had error:\n' + data);
		},
		add: {
			commandHandler: function (name, callback) {
				py.onCommand[name] = callback;
			},
			requestHandler: function (name, callback) {
				py.onRequest[name] = callback;
			}
		}
	}

	py.process.stdout.on('data', function (msg) {
		msg = msg.toString();
		msg.split('\n').forEach(function (data) {
			if (data.substring(0, 3) == '<*>') {
				data = data.split('<*>');
				py.onCommand[data[1]](JSON.parse(data[2]));
			}else if (data.substring(0, 3) == '<:>'){
				data = data.split('<:>');
				res = py.onRequest[data[1]](JSON.parse(data[2]));
				res = JSON.stringify(res)
				res = '<:>'+data[1]+'<:>'+res;
				res = res.replaceAll('\n', ' ');
				res += '\n';
				py.process.stdin.write(res);
			}else if (data != '') {
				py.onLog(data)
			}
		});
	});

	py.process.stderr.on('data', function (data) {
		data = data.toString();
		py.onError(data);
	});

	py.process.on('close', function (code) {
		py.onClose(code);
	});
	py.kill = function () {
		py.process.kill();
		console.warn('killing Python...')
	}

	return py;
}



/*
	Utils
*/


//Replace last util
String.prototype.reverse = function () {
	return this.split('').reverse().join('');
};

String.prototype.replaceLast = function (what, replacement) {
	return this.reverse().replace(new RegExp(what.reverse()), replacement.reverse()).reverse();
};
//Replace All
String.prototype.replaceAll = function (textToRemove, replacement) {
	return this.split(textToRemove).join(replacement);
}


