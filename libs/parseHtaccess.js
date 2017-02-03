/**
 * parseHtaccess.js
 */
module.exports = function( execute_php, callback ){
	delete(require.cache[require('path').resolve(__filename)]);
	callback = callback || function(){};
	var utils79 = require('utils79');
	var rtn = {};


	var htaccess = '';
	try {
		htaccess = require('fs').readFileSync( utils79.dirname(execute_php)+'/.htaccess' ).toString();
	} catch (e) {
	}
	// console.log(htaccess);

	// Pickles 2 が処理するべき拡張子のパターンを取得
	try {
		var res = htaccess.match(/RewriteCond[\s]+\%\{REQUEST\_URI\}[\s]+\/\(\.\*\?\\\.\(\?\:([\s\S]*?)\)\)\?\$/);
		// console.log(RegExp.$1);
		rtn.extensionPattern = new RegExp('^(?:'+RegExp.$1+')$', 'g');
		// console.log(rtn.extensionPattern);
	} catch (e) {
	}

	callback( rtn );
	return;
}
