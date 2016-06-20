"use strict";

// Tell colors module that we want colour console output
process.env.ALLOW_COLORS = true;

var async = require('async'),
	colors = require('irrelon-colors/safe'),
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
		return this.$main.call(this, '', name, {}, codeFunc);
	},

	/**
	 * Define a test by group, name and function.
	 * @param {String} group The group this test belongs to.
	 * @param {String} name The name of the test, must be unique.
	 * @param {Function} codeFunc The function containing the test
	 * code that executes various assertions.
	 * @returns {*}
	 */
	'string, string, function': function (group, name, codeFunc) {
		return this.$main.call(this, group, name, {}, codeFunc);
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
		return this.$main.call(this, '', name, options, codeFunc);
	},

	/**
	 * Define a test by group, name, options and function.
	 * @param {String} name The name of the test, must be unique.
	 * @param {String} group The group this test belongs to.
	 * @param {Object} options The test options such as timeout and
	 * number of assertions to expect.
	 * @param {Function} codeFunc The function containing the test
	 * code that executes various assertions.
	 * @returns {*}
	 */
	'string, string, object, function': function (group, name, options, codeFunc) {
		return this.$main.call(this, group, name, options, codeFunc);
	},

	'$main': function test (group, name, options, codeFunc) {
		if (!group) {
			group = 'All'
		}

		if (options && options.indent || options.indent === undefined) {
			TB.indent = "\t";
		}

		TB.tests[group] = TB.tests[group] || {};
		TB.tests[group][name] = function (callback) {
			var start,
				testEnclosure;

			TB.assertions = 0;
			TB.currentGroup = group;

			console.log(colors.cyan.bold(TB.currentGroup + ' -'), colors.green.bold(name));
			console.log('');
			console.log(TB.indent + 'RESULT\t ACTION\t LOG');
			console.log(TB.indent + '----------------------------------------------------');

			start = new Date().getTime();

			testEnclosure = function () {
				return codeFunc(function (err, data) {
					TB.timeRecord[name] = new Date().getTime() - start;

					console.log(TB.indent + '----------------------------------------------------');

					if (!err) {
						console.log(TB.indent + colors.green.bold('PASSED\t'), 'Ran ' + TB.assertions + ' assertions and took', colors.magenta.bold(TB.timeRecord[name] + ' ms'));
						console.log('');
					} else {
						console.log(TB.indent + colors.red.bold('FAILED\t'), 'Ran ' + TB.assertions + ' assertions and took', colors.magenta.bold(TB.timeRecord[name] + ' ms'));
						console.log('');
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
					console.log(TB.indent + colors.red.bold('FAILED\t', e));
					console.log(TB.indent + '----------------------------------------------------');
					console.log(TB.indent + colors.red.bold('FAILED\t'), 'Ran ' + TB.assertions + ' assertions and took', colors.magenta.bold(TB.timeRecord[name] + ' ms'));
					console.log('');

					TB.testResult[name] = false;
					TB.summary.failed++;

					setImmediate(function () {
						callback(false);
					});
				}
			}
		};

		// Check if we have a timeout for the test
		if (options && options.timeout && typeof options.timeout === 'number') {
			TB.timeout = options.timeout;
		}
	}
});

TB.time = function time (name, shouldBeLessThanMs) {
	var totalTime = 0;

	if (shouldBeLessThanMs === undefined) {
		shouldBeLessThanMs = TB.timeout;
	}

	if (TB.timeStep[name] === undefined) {
		TB.timeStep[name] = new Date().getTime();
	} else {
		TB.assertions++;
		totalTime = new Date().getTime() - TB.timeStep[name];
		TB.timeStepRecord[name] = totalTime;
		delete TB.timeStep[name];

		console.log(TB.indent + colors.green.bold('PASSED\t'), colors.green.bold('TIME\t'), colors.green.bold(name) + "\t", colors.magenta.bold(totalTime + ' ms') + colors.green(' <= ') + colors.magenta.bold(shouldBeLessThanMs + ' ms'));
		if (totalTime > shouldBeLessThanMs) {
			throw('Action took longer than maximum ' + shouldBeLessThanMs + ' ms!');
		}
	}
};

TB.expect = function (num, name) {
	if (name === undefined) {
		name = '';
	} else {
		name += ' ';
	}

	if (TB.assertions !== num) {
		throw("EXPECT\t " + name + "Expected " + num + ' assertions but ' + TB.assertions + ' were run!');
	} else {
		console.log(TB.indent + colors.green.bold('PASSED\t'), colors.green.bold('EXPECT\t'), colors.green.bold(name || ('Expected ' + num + ' assertions')));
	}
};

TB.strictEqual = function strictEqual (val1, val2, name) {
	TB.assertions++;
	if (val1 !== val2) {
		throw("STRICT\t " + name + ' expected ' + JSON.stringify(val1) + ' but got ' + JSON.stringify(val2));
	} else {
		console.log(TB.indent + colors.green.bold('PASSED\t'), colors.green.bold('STRICT\t'), colors.green.bold(name));
	}
};

TB.equal = function equal (val1, val2, name) {
	TB.assertions++;
	if (val1 != val2) {
		throw("EQUAL\t " + name + ' expected ' + JSON.stringify(val1) + ' but got ' + JSON.stringify(val2));
	} else {
		console.log(TB.indent + colors.green.bold('PASSED\t'), colors.green.bold('EQUAL\t'), colors.green.bold(name));
	}
};

TB.ok = function ok (val, name) {
	TB.assertions++;
	if (!val) {
		throw('OK\t"' + name + '" expected true but got ' + !!val);
	} else {
		console.log(TB.indent + colors.green.bold('PASSED\t'), colors.green.bold('OK\t'), colors.green.bold(name));
	}
};

TB.start = function start (groupsObj) {
	var group,
		groupEnclosure,
		groupArr = [],
		testCountTotal = 0;

	TB.assertions = 0;
	TB.timeout = 60000; // Default 60 second timeout

	if (groupsObj === undefined) {
		groupsObj = TB.tests;
	}

	// Pre-process groups and tests to count totals
	for (group in groupsObj) {
		if (groupsObj.hasOwnProperty(group)) {
			testCountTotal += Object.keys(groupsObj[group]).length;
		}
	}

	groupEnclosure = function (testsObj) {
		return function (groupFinished) {
			async.series(testsObj, function (err, results) {
				groupFinished(err);
			});
		};
	};

	// Loop groups
	for (group in groupsObj) {
		if (groupsObj.hasOwnProperty(group)) {
			if (groupsObj[group] && Object.keys(groupsObj[group]).length) {
				groupArr.push(groupEnclosure(groupsObj[group]));
			}
		}
	}

	TB.timeRecord.__startTime = new Date().getTime();

	/*if (TB.config.cuteMode) {
	 console.log("                        _     _");
	 console.log("                       ( \\---/ )");
	 console.log("                        ) . . (");
	 console.log("__________________,--._(___Y___)_,--.______________________");
	 console.log("                  `--'           `--'     ");
	 }*/

	async.series(groupArr, function (err, results) {
		var colorFunc1,
			colorFunc2;

		TB.timeRecord.__totalTime = new Date().getTime() - TB.timeRecord.__startTime;

		if (TB.summary.failed) {
			colorFunc1 = colors.red.bold;
			colorFunc2 = colors.red;
		} else {
			colorFunc1 = function (str) {
				return str;
			};
			colorFunc2 = function (str) {
				return str;
			};
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