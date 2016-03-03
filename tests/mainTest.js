var assert = require('assert');
var express = require('express');
var expressPickles2 = require('../libs/main.js');

describe('mainTest', function() {

	it("mainTest 1", function(done) {
		this.timeout(60*1000);

		var app = express();
		app.get('/', expressPickles2() );
		app.listen(3000);

		setTimeout(function(){
			assert.equal(1, 1);
			done();
		}, 10000);
	});

});
