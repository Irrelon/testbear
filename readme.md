# Testbear
                        _     _
                       ( \---/ )
                        ) . . (
__________________,--._(___Y___)_,--.______________________
                  `--'           `--'     
A very lightweight and simple test framework for Node.js...
and your test results are presented by a teddy bear.

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
so will not finish processing until you call callback() which is passed to your
test method as the first argument. IF YOU DON'T CALL THE CALLBACK METHOD, YOUR
TEST WILL NEVER FINISH!

## Examples
Define a test and run some checks. This example will always pass:

```js
tb.test('Test if true strict equals true', function (callback) {
	strictEqual(true, true, 'True is true');
	callback();
});

tb.start();
```

This example will always fail:

```js
tb.test('Test if true strict equals false', function (callback) {
	strictEqual(true, false, 'True is false');
	callback();
});

tb.start();
```

You can also throw errors in your tests to fail them:

```js
tb.test('Test if true strict equals true', function (callback) {
	strictEqual(true, true, 'True is true');
	
	throw('I will fail this test');
	
	callback();
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
tb.test('Check that window is an object', function (callback) {
	ok(typeof window === 'object', "Check window is an object");
	callback();
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
Reports the time taken between two time calls:

```js
tb.time(<name of time step>);
... some code to time
tb.time(<name of time step>);
```

E.g.

```js
tb.time('My long process');
for (var i = 0; i < 10000000; i++) {}
tb.time('My long process');
```

> **Notice** that you must use the same string name between two time calls
for them to know which time step has started and finished.

### start
Starts running the tests you have defined:

```js
tb.start();
```