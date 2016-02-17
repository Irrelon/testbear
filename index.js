"use strict";

// Tell colors module that we want colour console output
process.env.ALLOW_COLORS = true;

var async = require('async'),
	colors = require('colors/safe'),
	padRight,
	TB;

padRight = function padRight (str, padStr, totalLength) {
	var i;

	str = String(str);

	if (str.length >= totalLength) {
		return str;
	}

	for (i = str.length; i < totalLength; i++) {
		str = str + padStr;
	}

	return str;
};

TB = {};

TB.config = {
	noCatch: false,
	cuteMode: true
};
TB.tests = {};
TB.testResult = {};
TB.summary = {
	run: 0,
	passed: 0,
	failed: 0
};
TB.timeRecord = {
	"__startTime": 0,
	"___totalTime": 0
};
TB.timeStepRecord = {};
TB.timeStep = {};

TB.test = function test (name, codeFunc) {
	TB.tests[name] = function (callback) {
		var start,
			testEnclosure;

		console.log(colors.green('Test "') + colors.green.bold(name) + colors.green('"'), colors.green('started'));

		start = new Date().getTime();

		testEnclosure = function () {
			return codeFunc(function (err, data) {
				TB.timeRecord[name] = new Date().getTime() - start;

				if (!err) {
					console.log(colors.green('Test "') + colors.green.bold(name) + colors.green('"'), colors.green.bold('PASSED'), 'and took', colors.magenta.bold(TB.timeRecord[name] + ' ms'));
				} else {
					console.log(colors.red('Test "') + colors.red.bold(name) + colors.red('"'), colors.red.bold('FAILED!'), 'and took', colors.magenta.bold(TB.timeRecord[name] + ' ms'));
				}
				callback(err, data);
			});
		};

		TB.summary.run++;

		if (TB.config.noCatch) {
			testEnclosure();
		} else {
			try {
				testEnclosure();
				TB.testResult[name] = true;
				TB.summary.passed++;
			} catch (e) {
				TB.timeRecord[name] = new Date().getTime() - start;
				console.log(colors.red('Test "') + colors.red.bold(name) + colors.red('"'), colors.red.bold('FAILED!'), 'and took', colors.magenta.bold(TB.timeRecord[name] + ' ms'));
				console.log(colors.red.bold('Error:', e));

				TB.testResult[name] = false;
				TB.summary.failed++;

				setImmediate(function () {
					callback(false);
				});
			}
		}
	};
};

TB.time = function time (name) {
	var totalTime = 0;

	if (TB.timeStep[name] === undefined) {
		TB.timeStep[name] = new Date().getTime();
	} else {
		totalTime = new Date().getTime() - TB.timeStep[name];
		TB.timeStepRecord[name] = totalTime;
		delete TB.timeStep[name];

		console.log(colors.blue('Timed Action "') + colors.magenta.bold(name) + colors.blue('" took ') + colors.magenta.bold(totalTime + ' ms'));
	}
};

TB.strictEqual = function strictEqual (val1, val2, name) {
	if (val1 !== val2) {
		throw('Check (Strict Equals) "' + name + '" expected ' + JSON.stringify(val1) + ' but got ' + JSON.stringify(val2));
	} else {
		console.log(colors.blue('Check (Strict Equals) "') + colors.blue.bold(name) + colors.blue('" passed'));
	}
};

TB.equal = function equal (val1, val2, name) {
	if (val1 != val2) {
		throw('Check (Equals) "' + name + '" expected ' + JSON.stringify(val1) + ' but got ' + JSON.stringify(val2));
	} else {
		console.log(colors.blue('Check (Equals) "') + colors.blue.bold(name) + colors.blue('" passed'));
	}
};

TB.ok = function ok (val, name) {
	if (!val) {
		throw('Check (OK) "' + name + '" expected true but got ' + !!val);
	} else {
		console.log(colors.blue('Check (OK) "') + colors.blue.bold(name) + colors.blue('" passed'));
	}
};

TB.start = function start (testsObj) {
	if (testsObj === undefined) {
		testsObj = TB.tests;
	}

	TB.timeRecord.__startTime = new Date().getTime();

	/*if (TB.config.cuteMode) {
		console.log("                        _     _");
		console.log("                       ( \\---/ )");
		console.log("                        ) . . (");
		console.log("__________________,--._(___Y___)_,--.______________________");
		console.log("                  `--'           `--'     ");
	}*/

	console.log('Total test count: ' + Object.keys(testsObj).length);
	console.log('');
	async.series(testsObj, function (err, results) {
		var colorFunc1,
			colorFunc2;

		TB.timeRecord.___totalTime = new Date().getTime() - TB.timeRecord.__startTime;

		if (TB.summary.failed) {
			colorFunc1 = colors.red.bold;
			colorFunc2 = colors.red;
		} else {
			colorFunc1 = function (str) {return str;};
			colorFunc2 = function (str) {return str;};
		}

		if (TB.config.cuteMode) {
			if (TB.summary.failed) {
				console.log('                        _     _');
				console.log('                       (o\\---/o)   ');
				console.log('                        ( , , )');
				console.log('                 ___,~~.(_(T)_),~~.__');
				console.log('                |   "--"       "--"  |');
				console.log('                | Test Bear is SAD!! |');
				console.log('                |    _,-.    ,-._    |');
				console.log('                |___(ooO )__( Ooo)___|');
				console.log('                     "--"    "--" ');
			} else {
				console.log('                        _     _');
				console.log('                       (o\\---/o)   ');
				console.log('                        ( , , )');
				console.log('                 ___,~~.(_(T)_),~~.__');
				console.log('                |   "--"       "--"  |');
				console.log('                | Test Bear is HAPPY |');
				console.log('                |    _,-.    ,-._    |');
				console.log('                |___(ooO )__( Ooo)___|');
				console.log('                     "--"    "--" ');
			}
		}

		console.log(colorFunc1('------------------------------------------------------------'));
		console.log(colorFunc1('| Run     | Passed     | Failed     | Total Time           |'));
		console.log(colorFunc1('------------------------------------------------------------'));
		console.log(colorFunc1('| ') + colorFunc2(padRight(TB.summary.run, " ", 7) + ' | ' + padRight(TB.summary.passed, " ", 10) + ' | ' + padRight(TB.summary.failed, " ", 10) + ' | ' + padRight(TB.timeRecord.___totalTime + ' ms', " ", 20)) + colorFunc1(' |'));
		console.log(colorFunc1('------------------------------------------------------------'));

		if (TB.summary.failed) {
			setTimeout(function () {
				process.exit(1);
			}, 200);
		} else {
			setTimeout(function () {
				process.exit(0);
			}, 200);
		}
	});
};

module.exports = TB;