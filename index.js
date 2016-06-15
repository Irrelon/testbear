"use strict";

// Tell colors module that we want colour console output
process.env.ALLOW_COLORS = true;

var async = require('async'),
	colors = require('colors/safe'),
	Overload = require('irrelon-overload'),
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
	"__totalTime": 0
};
TB.timeStepRecord = {};
TB.timeStep = {};

TB.test = new Overload({
	/**
	 * Define a test by name and function.
	 * @param {String} name The name of the test, must be unique.
	 * @param {Function} codeFunc The function containing the test
	 * code that executes various assertions.
	 * @returns {*}
	 */
	'string, function': function (name, codeFunc) {
		return this.$main.call(this, name, {}, codeFunc);
	},

	/**
	 * Define a test by name, options and function.
	 * @param {String} name The name of the test, must be unique.
	 * @param {Object} options The test options such as timeout and
	 * number of assertions to expect.
	 * @param {Function} codeFunc The function containing the test
	 * code that executes various assertions.
	 * @returns {*}
	 */
	'string, object, function': function (name, options, codeFunc) {
		return this.$main.call(this, name, options, codeFunc);
	},

	'$main': function test (name, options, codeFunc) {
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

					TB.summary.passed++;
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

		// Check if we have a timeout for the test
		if (options && options.timeout) {
			// We have a test timeout, wrap the test function in another
			// function that checks for timeouts and returns an error to
			// the callback if the timeout is exceeded
		}

		// Check if we have an expected number of assertions
		if (options && typeof options.expect === 'number') {
			// We have a number of expected assertions. After the function
			// for the test has executed, the callback will call this wrapper
			// function and we will then determine how many assertions were
			// made and if it matches the expected number of assertions.

		}
	}
});

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

		TB.timeRecord.__totalTime = new Date().getTime() - TB.timeRecord.__startTime;

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
				console.log('                       ( \\---/ )   ');
				console.log('                        ( . . )');
				console.log('                 ___,--.(__Y__),--.___');
				console.log('                |   `--\'       `--\'   |');
				console.log('                | Test Bear is SAD!!! |');
				console.log('                |    _,-.     ,-._    |');
				console.log('                |___(ooO )___( Ooo)___|');
				console.log('                     `--\'     `--\' ');
			} else {
				console.log('                        _     _');
				console.log('                       ( \\---/ )   ');
				console.log('                        ( . . )');
				console.log('                 ___,--.(__Y__),--.___');
				console.log('                |   `--\'       `--\'   |');
				console.log('                | Test Bear is HAPPY! |');
				console.log('                |    _,-.     ,-._    |');
				console.log('                |___(ooO )___( Ooo)___|');
				console.log('                     `--\'     `--\' ');
			}
		}

		console.log(colorFunc1('------------------------------------------------------------'));
		console.log(colorFunc1('| Run     | Passed     | Failed     | Total Time           |'));
		console.log(colorFunc1('------------------------------------------------------------'));
		console.log(colorFunc1('| ') + colorFunc2(padRight(TB.summary.run, " ", 7) + ' | ' + padRight(TB.summary.passed, " ", 10) + ' | ' + padRight(TB.summary.failed, " ", 10) + ' | ' + padRight(TB.timeRecord.__totalTime + ' ms', " ", 20)) + colorFunc1(' |'));
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