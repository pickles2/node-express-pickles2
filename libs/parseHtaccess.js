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
		var htaccess_rows = htaccess.split(/\r\n|\r|\n/);
		for( var idx in htaccess_rows ){
			htaccess_rows[idx] = utils79.trim( htaccess_rows[idx] );
			if( htaccess_rows[idx].match( /^\#/g ) ){
				continue;
			}
			var res = htaccess_rows[idx].match(/^RewriteCond[\s]+\%\{REQUEST\_URI\}[\s]+\/\(\.\*\?\\\.\(\?\:([\s\S]*?)\)\)\?\$/);
			if( !res ){
				continue;
			}
			// console.log(RegExp.$1);
			rtn.extensionPattern = new RegExp('^(?:'+RegExp.$1+')$', 'g');
			// console.log(rtn.extensionPattern);
			break;
		}
	} catch (e) {
	}

	callback( rtn );
	return;
}
