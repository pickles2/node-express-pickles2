/**
 * Px2CondMgr.js
 */
module.exports = function(){
	var px2agent = require('px2agent');
	var Promise = require('es6-promise').Promise;
	var utils79 = require('utils79');
	var last = {},
		px2proj,
		pxConf,
		realpathHomedir;

	this.get = function(execute_php, options, callback){
		callback = callback || function(){};

		if( this.isCacheEnabled(execute_php) ){
			// キャッシュが有効な場合、前回のデータを返す。
			// console.log('config returned by cache. =-=-=-=-=');
			callback( px2proj, pxConf );
			return;
		}

		// キャッシュを生成しなおす。

		px2proj = px2agent.createProject(execute_php, {
			'bin': options.bin ,
			'ini': options.ini ,
			'extension_dir': options.extension_dir
		});

		px2proj.get_config(function(_pxConf){
			// console.log(pxConf);
			pxConf = _pxConf;

			px2proj.get_path_homedir(function(_realpathHomedir){
				realpathHomedir = _realpathHomedir;

				last = {
					'execute_php': execute_php,
					'md5confphp': getMd5File(realpathHomedir+'/config.php'),
					'md5confjson': getMd5File(realpathHomedir+'/config.json')
				}
				// console.log('=-=-=-=-= config reloaded.');
				// console.log(last);
				callback( px2proj, pxConf );
			});

		});
		return;
	}

	this.isCacheEnabled = function(execute_php){
		if(typeof(last.execute_php) != typeof('')){
			return false;
		}
		if(last.execute_php != execute_php){
			return false;
		}

		// console.log(pxConf);
		// console.log(realpathHomedir);

		if( last.md5confphp !== getMd5File(realpathHomedir+'/config.php') ){
			return false;
		}
		if( last.md5confjson !== getMd5File(realpathHomedir+'/config.json') ){
			return false;
		}

		return true;
	}

	/**
	 * ファイルのmd5ハッシュを求める
	 */
	function getMd5File(path){
		var bin = false;
		try {
			bin = require('fs').readFileSync(path);
		} catch (e) {
		}
		if( bin === false ){
			return false;
		}
		return utils79.md5(bin.toString());
	}
}
