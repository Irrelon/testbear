var TB = require('./index');

TB.test('TB', 'Test that testbear is working', function (callback) {
	TB.time('My time step');
	for (var i = 0; i < 1000000; i++) {

	}
	TB.time('My time step');
	TB.ok(true, 'Check that true is truthy');

	callback();
});

TB.test('Test that testbear is working without a group', function (callback) {
	TB.time('My time step');
	for (var i = 0; i < 1000000; i++) {

	}
	TB.time('My time step');
	TB.ok(true, 'Check that true is truthy');

	callback();
});

TB.test('TB', 'Test that testbear is working in groups with expects 2', function (callback) {
	TB.time('My time step');
	for (var i = 0; i < 1000000; i++) {

	}
	TB.time('My time step');
	TB.ok(true, 'Check that true is truthy');

	TB.expect(2);
	callback();
});

TB.test('TB', 'Test that testbear is working in groups with expects 3', function (callback) {
	TB.time('My time step');
	for (var i = 0; i < 1000000; i++) {

	}
	TB.time('My time step', 2);
	TB.ok(true, 'Check that true is truthy');
	TB.strictEqual(true, true, 'Check that strict true is truthy');
	TB.equal('1', 1, 'Check un-strict equals');
	TB.strictEqual(1, 1, 'Check strict equals');

	TB.expect(5, 'Check assertions run');
	callback();
});

TB.start();