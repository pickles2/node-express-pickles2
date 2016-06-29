/**
 * express-pickles2.js
 */
module.exports = function(execute_php, options, app){
	var px2agent = require('px2agent');
	var mime = require('mime');
	var path = require('path');
	var fs = require('fs');
	var querystring = require('querystring')
	// console.log(px2proj);
	// console.log(execute_php);
	// console.log(path.dirname(execute_php));

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

		options.liveConfig(function(new_execute_php, new_options){
			if( typeof(new_execute_php)==typeof('') && new_execute_php.length ){
				execute_php = new_execute_php;
			}
			if( typeof(new_options)==typeof({}) ){
				// options.liveConfig = new_options.liveConfig || options.liveConfig; // ← liveConfig はその性格上上書きを禁止
				options.processor = new_options.processor || options.processor;
			}

			var px2proj = px2agent.createProject(execute_php);


			px2proj.get_config(function(pxConf){
				// console.log(pxConf);

				var request_path = req._parsedUrl.pathname;
				if( request_path.indexOf( pxConf.path_controot ) === 0 ){
					request_path = request_path.substr(pxConf.path_controot.length);
					request_path = request_path.replace(new RegExp('^\\/*'), '/');
				}
				if( request_path.lastIndexOf( '/' ) === request_path.length-1 ){
					request_path += 'index.html';
				}
				// console.log(request_path);

				var mimeType = mime.lookup( request_path );
				// console.log(mimeType);
				var ext = mime.extension(mimeType);
				// console.log(ext);
				if( !ext ){
					ext = 'html';
				}
				ext = ext.toLowerCase();
				// console.log( ext );
				switch( ext ){
					case 'html':
					case 'htm':
					case 'css':
					case 'js':
						break;
					default:
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
						return;
						break;
				}

				var params = querystring.parse( (req._parsedUrl.search||'').replace(new RegExp('^\\?'), '') );
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
						var bin = data;
						var status = 200;
						try {
							data = JSON.parse(data);
							// console.log(data);
							status = data.status;
							bin = new Buffer(data.body_base64, 'base64').toString();
						}catch(e){
						}

						// console.log(mimeType);
						options.processor(bin, ext, function(bin){
							res
								.set('Content-Type', mimeType)
								.status(status)
								.type(ext)
								.send(bin)
								.end()
							;
						});
						return;
					}
				});
			});

		});
	};

}
