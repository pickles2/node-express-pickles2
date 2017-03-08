/**
 * Px2CondMgr.js
 */
module.exports = function(){
	var px2agent = require('px2agent');
	var Promise = require('es6-promise').Promise;

	this.get = function(execute_php, options, callback){
		callback = callback || function(){};

		px2proj = px2agent.createProject(execute_php, {
			'bin': options.bin ,
			'ini': options.ini ,
			'extension_dir': options.extension_dir
		});

		px2proj.get_config(function(_pxConf){
			// console.log(pxConf);
			pxConf = _pxConf;
			callback( px2proj, pxConf );
		});
	}
}
