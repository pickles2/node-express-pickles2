/**
 * express-pickles2.js
 */
module.exports = function(execute_php, options){
	var px2proj = require('px2agent').createProject(execute_php);
	var mime = require('mime');
	var path = require('path');
	var fs = require('fs');
	// console.log(px2proj);
	// console.log(execute_php);
	// console.log(path.dirname(execute_php));

	return function(req, res, next){
		// console.log(req);
		// console.log(req.originalUrl);
		// console.log(req._parsedUrl);

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
					var realpathResource = path.resolve(path.dirname(execute_php), './'+req.originalUrl);
					// console.log( realpathResource );
					res
						.set('Content-Type', mimeType)
						.send( fs.readFileSync(realpathResource) )
						.end()
					;
					return;
					break;
			}

			px2proj.query(request_path + req._parsedUrl.search, {
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
					res
						.set('Content-Type', mimeType)
						.status(status)
						.type(ext)
						.send(bin)
						.end()
					;
					return;
				}
			});
		});
	};

}
