# node-express-pickles2

[Pickles 2](http://pickles2.pxt.jp/) Server Emulator for Express.

## Install

```bash
$ npm install --save express-pickles2
```


## Usage

```js
var express = require('express');
var expressPickles2 = require('express-pickles2');

var app = express();
app.use('/*', expressPickles2('/path/to/.px_execute.php', {}) );
app.listen(3000);
```


### Options

```js
app.use(
    '/*',
    expressPickles2(
        '/path/to/.px_execute.php' ,
        {
            'liveConfig': function(callback){
                callback(execute_php, options);
                return;
            },
            'processor': function(bin, ext, callback){
                if( ext == 'html' ){
                    bin = yourCustomProcessor(bin);
                }
                callback(bin);
                return;
            }
        }
    )
);
```

<dl>
    <dt>liveConfig</dt>
        <dd>起動済みのサーバーに動的に設定を与える必要がある場合に使用します。<br />このオプションは、Pickles 2 を利用した外部アプリケーションなどが、その都合によって加工を必要とする場合などを想定して用意されました。</dd>
    <dt>processor</dt>
        <dd>出力前の加工処理を設定します。 Pickles 2 とは本来無関係の機能で、ウェブサイトに由来する加工処理をここに実装することは望ましくありません。代わりに、Pickles 2 に搭載されている processor 機能を使用してください。<br />このオプションは、Pickles 2 を利用した外部アプリケーションなどが、その都合によって加工を必要とする場合などを想定して用意されました。</dd>
</dl>
