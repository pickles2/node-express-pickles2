/**
 * hideBase64.js
 */
module.exports = function( phpOutput, callback ){
	delete(require.cache[require('path').resolve(__filename)]);
	callback = callback || function(){};

	phpOutput = phpOutput.replace(
		/\,(\s*)\"body_base64\"\:\"(?:[\s\S]+)\"/,
		',$1"body_base64":"<!-- contents body is hidden by express-pickles2 -->"'
	);
	callback( phpOutput );
	return;
}
