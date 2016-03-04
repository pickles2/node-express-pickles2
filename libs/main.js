/**
 * express-pickles2.js
 */
module.exports = function(execute_php, options){
	// console.log(execute_php);
	var px2proj = require('px2agent').createProject(execute_php);
	// console.log(px2proj);

	return function(req, res, next){
		// console.log(req);
		console.log(req.originalUrl);

		px2proj.get_config(function(value){
			// console.log(value);

			px2proj.query(req.originalUrl, {
				"output": "json",
				"userAgent": "Mozilla/5.0",
				"success": function(data){
					// console.log(data);
				},
				"complete": function(data, code){
					// console.log(data, code);
					var bin = data;
					try {
						data = JSON.parse(data);
						bin = new Buffer(data.body_base64, 'base64').toString();
					}catch(e){
					}
					res.send(bin);
				}
			});
		});
	};
}
