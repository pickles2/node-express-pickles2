/**
 * express-pickles2.js
 */
module.exports = function(execute_php, options, app){
	var mime = require('mime');
	var path = require('path');
	var fs = require('fs');
	var utils79 = require('utils79');
	var querystring = require('querystring');
	var Promise = require('es6-promise').Promise;
	// console.log(px2proj);
	// console.log(execute_php);
	// console.log(path.dirname(execute_php));

	var Px2CondMgr = require('./Px2CondMgr.js'),
		px2CondMgr = new Px2CondMgr();

	if(app){
		app.use( require('body-parser')() );
		app.use( require('express-session')({
			secret: "pickles2",
			cookie: {httpOnly: false}
		}) );
	}

	options = options || {};
	options.liveConfig = options.liveConfig || function(callback){
		callback(execute_php, options);
		return;
	}
	options.processor = options.processor || function(bin, ext, callback){
		callback(bin);
		return;
	}

	return function(req, res, next){
		// console.log(req);
		// console.log(req.originalUrl);
		// console.log(req._parsedUrl);
		var pickPhpErrors = require('./pickPhpErrors.js');
		var hideBase64 = require('./hideBase64.js');
		var parseHtaccess = require('./parseHtaccess.js');
		var px2proj;
		var mimeType;
		var ext;
		var request_path;
		var params;
		var rtn = {};
		var px2ResponseCode;
		var phpErrors;
		var pxConf;
		var htaccessInfo;

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log( '---- liveConfig()' );

				options.liveConfig(function(new_execute_php, new_options){
					if( typeof(new_execute_php)==typeof('') && new_execute_php.length ){
						execute_php = new_execute_php;
					}
					if( typeof(new_options)==typeof({}) ){
						// options.liveConfig = new_options.liveConfig || options.liveConfig; // ← liveConfig はその性格上上書きを禁止
						options.processor = new_options.processor || options.processor;
					}


					rlv();
				});

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log( '---- parse .htaccess' );

				parseHtaccess(execute_php, function(result){
					htaccessInfo = result;
					rlv();
				});

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log( '---- get_config()' );

				px2CondMgr.get(execute_php, options, function(_px2proj, _pxConf){
					px2proj = _px2proj;
					pxConf = _pxConf;
					rlv();
				});

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log( '---- routing' );

				request_path = req._parsedUrl.pathname;
				if( request_path.indexOf( pxConf.path_controot ) === 0 ){
					request_path = request_path.substr(pxConf.path_controot.length);
					request_path = request_path.replace(new RegExp('^\\/*'), '/');
				}else{
					next();
					rjt();
					return;
				}
				if( request_path.lastIndexOf( '/' ) === request_path.length-1 ){
					request_path += 'index.html';
				}
				// console.log(request_path);

				mimeType = mime.lookup( request_path );
				// console.log(mimeType);
				ext = request_path.replace(/[\s\S]*\.([\S]*?)$/, '$1');
				// console.log(ext);
				if( !ext ){
					ext = 'html';
				}
				ext = ext.toLowerCase();
				// console.log( ext );
				if( !ext.match( htaccessInfo.extensionPattern ) ){
					var realpathResource = path.resolve(path.dirname(execute_php), './'+request_path);
					var bin = '';
					try {
						bin = fs.readFileSync(realpathResource);
						res
							.set('Content-Type', mimeType)
							.send( bin )
							.end()
						;
					} catch (e) {
						res
							.set('Content-Type', 'text/html')
							.status( 404 )
							.send( 'Not Found' )
							.end()
						;
					}
					// console.log( realpathResource );
					rjt();
					return;
				}

				rlv();

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log( '---- exec pickles 2' );

				params = querystring.parse( (req._parsedUrl.search||'').replace(new RegExp('^\\?'), '') );
				// console.log(query);
				if( params['THEME'] ){
					req.session['THEME'] = params['THEME'];
				}
				if( req.session && req.session['THEME'] ){
					params['THEME'] = req.session['THEME'];
				}
				req._parsedUrl.search = '?'+querystring.stringify(params);
				// console.log(req._parsedUrl.search);

				var query = request_path + (req._parsedUrl.search||'');

				px2proj.query(query, {
					"output": "json",
					"userAgent": "Mozilla/5.0",
					"success": function(data){
						// console.log(data);
					},
					"complete": function(data, code){
						// console.log(data, code);
						px2ResponseCode = data;
						rlv();
						return;
					}
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log( '---- pickPhpErrors()' );

				rtn.bin = px2ResponseCode;
				rtn.status = 200;
				rtn.errors = [];

				pickPhpErrors(px2ResponseCode, function(_phpErrors, result){
					phpErrors = _phpErrors;
					rtn.bin = result;
					rlv();
				});

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log( '---- parse json string' );

				try {
					var json = JSON.parse(rtn.bin);
					rtn = json;
					rtn.bin = json.body_base64;
				}catch(e){
					rtn.status = 500;
					rtn.errors.push('FAILED to parse JSON string.');
				}
				try {
					rtn.bin = new Buffer(rtn.bin, 'base64').toString();
				}catch(e){
					rtn.errors.push('FAILED to parse "body_base64".');
				}
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log( '---- join error string' );

				rtn.bin = (phpErrors.join("\n") + rtn.bin);
				rlv();

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log( '---- Content-type header' );

				try {
					// pickles2/px-fw-2.x@2.0.29 以降、
					// `rtn.header` にHTTPレスポンスヘッダーを格納するように拡張された。
					// この情報がある場合は、そのままクライアントへ転送する。
					// (通常この中に、 Content-type ヘッダーが含まれている)
					for(var i in rtn.header){
						var headerStr = rtn.header[i];
						try {
							var parsedHeaderStr = headerStr.split(/\:/);
							// console.log(parsedHeaderStr);
							res.set(utils79.trim(parsedHeaderStr[0]), utils79.trim(parsedHeaderStr[1]));

							if( parsedHeaderStr[0].toLowerCase() === 'content-type' ){
								var _mimeType = parsedHeaderStr[1];
								ext = mime.extension(_mimeType);
							}
						} catch (e) {
							console.error('Failed to parse header string - ' + headerStr);
						}
					}
				} catch (e) {
					res.set('Content-Type', mimeType);
					ext = mime.extension(mimeType);
				}

				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log( '---- exec processor option' );
				options.processor(rtn.bin, ext, function(bin){
					rtn.bin = bin;
					rlv();
				}, rtn);

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log( '---- hideBase64()' );

				// エラーが起きた場合に base64 状態のコンテンツがエラーメッセージとして出力されると、
				// そこから情報を読み取ることができる。
				// 開発者がこのことを意図せずサポートフォーラム等にコードを投稿し、情報流出につながる恐れがあるので、
				// base64のままデコードに失敗した情報が含まれる場合は、念のため削除してから出力するようにする。
				hideBase64(rtn.bin, function(result){
					rtn.bin = result;
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// console.log( '---- response' );

				res
					.status(rtn.status)
					.send(rtn.bin)
					.end()
				;
				rlv();
			}); })
		;

	};

}
