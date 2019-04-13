
# 數據交互

- ✔ jQuery Ajax（Asynchronous JavaScript and XML） // Gmail推出開始漸漸使用，JS操作CSS與DOM（文件物件模型 req content）-> 視覺效果簡單 ↑，現在被大量使用，直接在，前端口使用對應的代碼即可

- ✘ XMLHttpRequest 這個要在server後端（隱藏的代碼），還有HTML前段寫，有人覺得比較安全

# XMLHttpRequest 範例

```js ./app.js
// dependence
const express = require('express')
const app = express();
var bodyParser = require('body-parser');
const path = require('path');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const xhr = new XMLHttpRequest();
// settings
const port = process.env.PORT || 3000; // localhost:3000
app.use(express.static(path.join(__dirname, ''))); // 靜態文件在根目錄 ''，都可以訪問
app.set('view engine', 'html');
app.listen(port); // server listen port

// data set
app.get('/users', function(req, res, next) {
res.send({"name": "tom", "age": 24});
});

app.get('/test', function (req, res) {
    res.render('test',{}); // render ./test.html
});
  

```

```html ./test.html
<script>
var xhr = new XMLHttpRequest();
xhr.open('get', '/users', true);
xhr.responseType = 'json';
xhr.send(null);
xhr.onreadystatechange = function() {
    if(xhr.status===200 && xhr.readyState===4) {
        console.log(xhr.response);
    }
}    
</script>
```

## 結果

XMLHttpRequest必須要有Server跟前段交互才可以使用，所以要定義get在httpserver，然後用著個方式訪問端口，確定`/test.html`可以透過XMLHttpRequest的方法得到，之前服務端定義的`'get', '/users'`的資料。

```
localhost:3000
顯示
{"name": "tom", "age": 24}
```