var assert = require('assert');
var express = require('express');
var expressPickles2 = require('../libs/main.js');
var http = require('http');

describe('mainTest', function() {

	it("server UP", function(done) {
		this.timeout(10*1000);

		var app = express();
		app.get('/subproj/proj2/*', expressPickles2(__dirname+'/htdocs/subproj/proj2/.px_execute.php') );
		app.get('/*', expressPickles2(__dirname+'/htdocs/.px_execute.php') );
		app.listen(3000);

		assert.equal(1, 1);
		done();

	});

	it("/index.html", function(done) {
		this.timeout(60*1000);

		get('/index.html', function(bin){
			// console.log(bin);
			assert.equal(1, 1);
			done();
		});

	});

	it("/sample_pages/index.html", function(done) {
		this.timeout(60*1000);

		get('/sample_pages/index.html', function(bin){
			// console.log(bin);
			assert.equal(1, 1);
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
			assert.equal(1, 1);
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
	var req = http.get('http://127.0.0.1:3000'+url, function (res) {

		// テキストファイルの場合は、エンコード指定は重要！
		res.setEncoding('utf8');

		// データを受け取るたびに、文字列を追加
		res.on('data', function (data) {
			bin += data;
		});

		// ファイルのダウンロードが終わるとendイベントが呼ばれる
		res.on('end', function () {
			callback(bin);
		});
	});

	// 通信エラーなどはここで処理する
	req.on('error', function (err) {
		console.log('Error: ', err); return;
	});
	return;
}
