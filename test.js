var TB = require('./index');

TB.test('My test test', function (callback) {
	TB.time('My time step');
	for (var i = 0; i < 1000000; i++) {

	}
	TB.time('My time step');
	TB.ok(true, 'Check that true is truthy');

	callback();
});

TB.start();