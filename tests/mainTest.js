var assert = require('assert');
var express = require('express');
var expressPickles2 = require('../libs/main.js');
var http = require('http');
var cheerio = require('cheerio');

var envProcessorString = '<!-- processor -->';

describe('mainTest', function() {

	it("server UP", function(done) {
		this.timeout(10*1000);

		var app = express();
		app.use('/subproj/proj2/*', expressPickles2(__dirname+'/htdocs/subproj/proj2/.px_execute.php') );
		app.use('/*', expressPickles2(
			__dirname+'/htdocs/.px_execute.php',
			{
				'processor': function(bin, ext, callback){
					// console.log(bin);
					// console.log(ext);
					switch(ext){
						case 'html':
						case 'htm':
							bin += envProcessorString;
							break;
					}
					callback(bin);
					return;
				}
			},
			app
		) );
		app.listen(8080);

		assert.equal(1, 1);
		done();

	});

	it("/index.html", function(done) {
		this.timeout(60*1000);

		get('/index.html', function(bin){
			// console.log(bin);

			var $ = cheerio.load(bin, {decodeEntities: false});
			var $testElm = $('p[data-test-meta-data]').eq(0);
			assert.equal($testElm.attr('data-test-meta-data'), '/index.html');

			done();
		});

	});

	it("/sample_pages/index.html", function(done) {
		this.timeout(60*1000);

		get('/sample_pages/index.html', function(bin){
			// console.log(bin);

			var $ = cheerio.load(bin, {decodeEntities: false});
			var $testElm = $('p[data-test-meta-data]').eq(0);
			assert.equal($testElm.attr('data-test-meta-data'), '/sample_pages/index.html');

			done();
		});

	});

	it("/common/styles/contents.css", function(done) {
		this.timeout(60*1000);

		get('/common/styles/contents.css', function(bin){
			// console.log(bin);

			assert.notEqual( bin.lastIndexOf(envProcessorString), bin.length - envProcessorString.length );

			done();
		});

	});

	it("processor", function(done) {
		this.timeout(60*1000);

		get('/sample_pages/index.html', function(bin){
			// console.log(bin);

			assert.equal( bin.lastIndexOf(envProcessorString), bin.length - envProcessorString.length );

			done();
		});

	});

	it("index.html を省略する", function(done) {
		this.timeout(60*1000);

		get('/sample_pages/', function(bin1){
			get('/sample_pages/index.html', function(bin2){
				// console.log(bin1, bin2);
				assert.equal(bin1, bin2);
				done();
			});
		});

	});

});

describe('subproj/proj2', function() {

	it("/subproj/proj2/index.html", function(done) {
		this.timeout(60*1000);

		get('/subproj/proj2/index.html', function(bin){
			// console.log(bin);

			var $ = cheerio.load(bin, {decodeEntities: false});
			var $testElm = $('p[data-test-meta-data]').eq(0);
			assert.equal($testElm.attr('data-test-meta-data'), '/subproj/proj2/index.html');

			done();
		});

	});

});

describe('?THEME=test', function() {

	it("/?THEME=test", function(done) {
		this.timeout(60*1000);

		get('/?THEME=test', function(bin, headers){
			// console.log(bin);
			// console.log(headers);

			var $ = cheerio.load(bin, {decodeEntities: false});
			var $testElm = $('body').eq(0);
			assert.equal($testElm.attr('class'), 'theme_test');

			done();
		});

	});

});

describe('(後片付け)', function() {

	it("clearcache", function(done) {
		this.timeout(60*1000);

		setTimeout(function(){
			get('/index.html?PX=clearcache', function(bin){
				// console.log(bin);
				get('/subproj/proj2/index.html?PX=clearcache', function(bin){
					// console.log(bin);
					assert.equal(1, 1);
					done();
				});
			});
		}, 2*1000);

	});

});

function get(url, callback){

	// ダウンロードする
	var bin = '';
	var req = http.get('http://127.0.0.1:8080'+url, function (res) {
		// console.log(res.headers);

		// テキストファイルの場合は、エンコード指定は重要！
		res.setEncoding('utf8');

		// データを受け取るたびに、文字列を追加
		res.on('data', function (data) {
			bin += data;
		});

		// ファイルのダウンロードが終わるとendイベントが呼ばれる
		res.on('end', function () {
			callback(bin, res.headers);
		});
	});

	// 通信エラーなどはここで処理する
	req.on('error', function (err) {
		console.log('Error: ', err); return;
	});
	return;
}
