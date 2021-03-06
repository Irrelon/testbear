# Testbear
Testbear is developed with ❤ love by [Irrelon Software Limited](http://www.irrelon.com/),
a UK registered company.

```
                        _     _
                       ( \---/ )
                        ) . . (
__________________,--._(___Y___)_,--.______________________
                  `--'           `--'
```

A very lightweight and simple test framework for Node.js...
and your test results are presented by a teddy bear... which
let's face it, is the best way to present your test results.

## Install
You can install testbear via NPM:

```bash
npm install testbear
```

## Usage
You can include testbear in your project via:

```js
var tb = require('testbear');
```

Testbear uses a really simple interface for defining your tests. There are only
a few commands:

* test()
* time()
* ok()
* equal()
* strictEqual()
* expect()
* start()

You define tests by calling test:

```js
tb.test(<test name>, <function(callback)>);
```

Once you have defined all your tests you can run them by calling start():

```js
tb.start();
```

> Testbear tests are always run assuming that they require some async processing
so will not finish processing until you call finish() which is passed to your
test method as the first argument. IF YOU DON'T CALL THE CALLBACK METHOD, YOUR
TEST WILL NEVER FINISH!

## Examples
Define a test and run some checks. This example will always pass:

```js
tb.test('Test if true strict equals true', function (finish) {
	tb.strictEqual(true, true, 'True is true');
	finish();
});

tb.start();
```

This example will always fail:

```js
tb.test('Test if true strict equals false', function (finish) {
	tb.strictEqual(true, false, 'True is false');
	finish();
});

tb.start();
```

You can also throw errors in your tests to fail them:

```js
tb.test('Test if true strict equals true', function (finish) {
	tb.strictEqual(true, true, 'True is true');
	
	throw('I will fail this test');
	
	finish();
});

tb.start();
```

## API

### test
Defines a new test. Test names must be unique. Declaring a test with the same
name as a previously declared test will result in overwriting the previous one
and only running the last one declared.

```js
tb.test(<test name>, <test function>);
```

Your test function will be passed a callback as the first argument, call it once
your test is complete and you want testbear to move on to the next test.

If testbear is hanging it's probably because you've forgotten to call the callback
somewhere in your test!

E.g.

```js
tb.test('Check that window is an object', function (finish) {
	tb.ok(typeof window === 'object', "Check window is an object");
	finish();
});
```

### strictEqual
Checks that the first argument matches the second argument with an === operator.

```js
tb.strictEqual(<argument 1>, <argument 2>, <name of this check>);
```

### equal
Checks that the first argument matches the second argument with an == operator.

```js
tb.equal(<argument 1>, <argument 2>, <name of this check>);
```

### ok
Checks that the first argument is not false (!argument1).

```js
tb.ok(<argument 1>, <name of this check>);
```

### time
Reports the time taken between two time calls.

> The first call to time() does not increment the assertion count. 

```js
tb.time(<name of time step>);
... some code to time
tb.time(<name of time step>[, <maxMilliseconds>]);
```

E.g.

```js
tb.time('My long process');
for (var i = 0; i < 10000000; i++) {}
tb.time('My long process', 500);
```

> **Notice** that you must use the same string name between two time calls
for them to know which time step has started and finished.

> If you pass a number into the second time() call as the second parameter
it will be used to compare against the time taken to execute the operation.
If the time take is greater than the number passed the assertion will fail.
This allows you to set maximum times for operations in your tests and have
them fail if they take too long.

### expect
Checks that the number of assertions that have run since before the call
to expect() equals the number you pass. The name for an expect call
(second parameter) is optional.

> Unlike other calls, the expect() call is not counted as an assertion. This
 means that you can call expect() one after the other and get the same result
 until you execute another assertion method such as ok(), equal() etc.

```js
tb.expect(<number>[, <name of this check>]);
```

### start
Starts running the tests you have defined:

```js
tb.start();
```

## Contributing to This Project
This project is mediated by [Irrelon Software Limited](http://www.irrelon.com).
All contributions are welcome. Please submit a pull request to contribute your
updates.