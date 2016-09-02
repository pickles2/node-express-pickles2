/**
 * pickPhpErrors.js
 */
module.exports = function( phpOutput, callback ){
	delete(require.cache[require('path').resolve(__filename)]);
	callback = callback || function(){};
	// var php = require('phpjs');
	var phpErrors = [];

	// console.log('=-=-=-=-=-=-=-=-=-=-=');
	// console.log(phpOutput);

	var regexp = /((?:Notice|Warning|Parse\ error|Fatal\ error)\:[\s\S]+?\ in\ [\s\S]+?\ on\ line\ [0-9]+)/g;
	var phpErrors = phpOutput.match( regexp );
	if( phpErrors === null ){
		phpErrors = [];
	}
	// phpErrors = RegExp.$1;
	phpOutput = phpOutput.replace( regexp, '' );

	// console.log('-----------');
	// console.log(phpErrors);
	// console.log('-----------');
	// console.log(typeof(phpErrors));
	// console.log(phpErrors.length);
	// console.log('-----------');
	// console.log(phpOutput);

	callback( phpErrors, phpOutput );
	return;
}
