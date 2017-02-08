var assert = require('assert');
var express = require('express');
var expressPickles2 = require('../libs/main.js');
var http = require('http');
var cheerio = require('cheerio');

var envProcessorString = '<!-- processor -->';
var pickPhpErrors = require('../libs/pickPhpErrors.js');
var hideBase64 = require('../libs/hideBase64.js');
var parseHtaccess = require('../libs/parseHtaccess.js');

describe('pickPhpErrors', function() {

	it("Notice Error", function(done) {
		this.timeout(60*1000);

		var fs = require('fs');
		var data = fs.readFileSync(__dirname+'/pickPhpErrors/error_notice.json').toString();

		pickPhpErrors(data, function(phpErrors, data){
			// assert.ok(!data.match(/test\-string/));
			assert.equal(typeof(data), typeof(''));
			assert.equal(typeof(phpErrors), typeof([]));

			done();
			return;
		});

	});

	it("No Error", function(done) {
		this.timeout(60*1000);

		var fs = require('fs');
		var data = fs.readFileSync(__dirname+'/pickPhpErrors/noerror.json').toString();

		pickPhpErrors(data, function(phpErrors, data){
			// assert.ok(!data.match(/test\-string/));
			assert.equal(typeof(data), typeof(''));
			assert.equal(typeof(phpErrors), typeof([]));

			done();
			return;
		});

	});

});

describe('hideBase64', function() {

	it("Notice Error", function(done) {
		this.timeout(60*1000);

		var fs = require('fs');
		var data = fs.readFileSync(__dirname+'/pickPhpErrors/error_notice.json').toString();

		hideBase64(data, function(data){
			assert.ok(!data.match(/test\-string/));
			assert.equal(typeof(data), typeof(''));

			done();
			return;
		});

	});

});

describe('parseHtaccess', function() {

	it("parseHtaccess", function(done) {
		this.timeout(60*1000);

		var fs = require('fs');
		var data = fs.readFileSync(__dirname+'/pickPhpErrors/error_notice.json').toString();

		parseHtaccess(__dirname+'/htdocs/.px_execute.php', function(htaccessInfo){
			assert.ok( 'js'.match(htaccessInfo.extensionPattern) );
			assert.ok( 'html'.match(htaccessInfo.extensionPattern) );
			assert.ok( 'htm'.match(htaccessInfo.extensionPattern) );
			assert.ok( 'shtml'.match(htaccessInfo.extensionPattern) );
			assert.ok( 'shtm'.match(htaccessInfo.extensionPattern) );
			assert.ok( 'htmllll'.match(htaccessInfo.extensionPattern) === null );
			assert.ok( 'undefined-ext'.match(htaccessInfo.extensionPattern) === null );

			done();
			return;
		});

	});

});

describe('mainTest', function() {

	it("server UP", function(done) {
		this.timeout(10*1000);

		var app = express();
		app.use('/subproj/proj2/*', expressPickles2(__dirname+'/htdocs/subproj/proj2/.px_execute.php') );
		app.use('/*', expressPickles2(
			__dirname+'/htdocs/.px_execute.php',
			{
				'processor': function(bin, ext, callback, response){
					// console.log(bin);
					// console.log(ext);
					// console.log(response);
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
		// console.log(1234567890.1);

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

	it("追加した拡張子 *.shtml", function(done) {
		this.timeout(60*1000);

		get('/sample_pages/ext_shtml.shtml', function(bin){
			// console.log(bin);

			var $ = cheerio.load(bin, {decodeEntities: false});
			var $testElm = $('.contents').eq(0);
			assert.equal($testElm.attr('data-contents-area'), 'main');

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
			require('child_process').exec('php '+__dirname+'/htdocs/.px_execute.php /?PX=clearcache', {}, function(){
				require('child_process').exec('php '+__dirname+'/htdocs/subproj/proj2/.px_execute.php /?PX=clearcache', {}, function(){
					assert.equal(1, 1);
					done();
				});
			});
		}, 100);

	});

});

/**
 * httpアクセスしてコンテンツを取得
 */
function get(url, callback){
	// console.log(url);
	// console.log('http://127.0.0.1:8080'+url);

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
