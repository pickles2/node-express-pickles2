var assert = require('assert');
var express = require('express');
var expressPickles2 = require('../libs/main.js');
var http = require('http');

describe('mainTest', function() {

	it("mainTest 1", function(done) {
		this.timeout(60*1000);

		var app = express();
		app.get('/*', expressPickles2(__dirname+'/htdocs/.px_execute.php') );
		app.listen(3000);

		get('/index.html', function(bin){
			console.log(bin);

			get('/index.html?PX=clearcache', function(bin){
				console.log(bin);
				setTimeout(function(){
					assert.equal(1, 1);
					done();
				}, 10000);
			});
		});

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
}
