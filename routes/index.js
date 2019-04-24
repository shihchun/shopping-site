var express = require('express');
var router = express.Router();
const goodModel = require('../models/goods.js'); // 载入mongoose编译后的模型
const f = require('../models/functions.js');
// var base64Img = require('base64-img');

router.get('/chat', function (req, res, next) {
  var host = [];
  host.socket = 'http://' + req.hostname + ':' + req.app.get('port');
  host.websocket = 'ws://' + req.hostname + ':' + req.app.get('port');
  console.log(host);
  res.render('chat2', {
    host: host
  });
});



/* GET home page. */
router.get('/', function (req, res, next) {
  let query = {
    draft: '上架'
  };
  // base64Img.base64('../models/1.jpg', function(err, data) {console.log(data);})
  // var data = base64Img.base64Sync('models/1.jpg');
  // console.log(data);
  goodModel.find(query, function (err, result) {
    arr = f.fakeIdArray(result);
    return res.render('index', {
      title: '首頁',
      message: req.flash('pannel'),
      productCard: arr,
    });
  });
});

/* GET cat search. */
router.get('/category', function(req, res, next) {
  console.log(req.query.q);
  let query = {
    draft: '上架',
    category: req.query.q
  };
  goodModel.find(query, function (err, result) {
    arr = f.fakeIdArray(result);
    return res.render('index', {
      title: '首頁',
      message: '',
      productCard: arr,
    });
  });
  
});

// goods data detail page after upload
router.get('/goods/:id', function (req, res) {
  var id = f.decrypt(req.params.id);
  goodModel.findById(id, function (err, result) {
    result.id = null;
    return res.render('admin/index', {
      title: "商品明細",
      productDetial: result
    });
  });
});

router.get('/test', function (req, res, next) {
  // curl http://localhost:4000/test  --request GET
  user = {
    "username": "abc",
    "password": "abc"
  };
  res.json(user);
  res.end();
});

router.post('/test', function (req, res, next) {
  // curl --header "Content-Type: application/json" \
  //   --request POST \
  //   --data '{"username":"abc","password":"abc"}' \
  //   http://localhost:4000/test 
  // curl http://localhost:4000/test --header "Content-Type: application/json" --request POST --data '{"username":"abc","password":"abc"}'
  console.log(req.headers);
  console.log(req.body);
  res.end();
});

module.exports = router;