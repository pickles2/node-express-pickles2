var express = require('express');
var expressPickles2 = require('../../libs/main.js');
var http = require('http');
var cheerio = require('cheerio');
var port = 8080;

var app = express();
app.set('etag', false);
app.use('/subproj/proj2/*', expressPickles2(__dirname+'/../htdocs/subproj/proj2/.px_execute.php') );
app.use('/*', expressPickles2(
	__dirname+'/../htdocs/.px_execute.php',
	{},
	app
) );
app.listen(port);

console.log('server standby; on '+port);
