var express = require('express');
var router = express.Router();
const goodModel = require('../models/goods.js'); // 载入mongoose编译后的模型
const f = require('../models/functions.js');
// var base64Img = require('base64-img');

/* GET home page. */
router.get('/', function (req, res, next) {
  let query = {draft: '上架'};
  
  // base64Img.base64('../models/1.jpg', function(err, data) {console.log(data);})
  // var data = base64Img.base64Sync('models/1.jpg');
  // console.log(data);
  goodModel.find( query, function (err, result) {
      res.render('index', {
          title: '首頁',
          message: '',
          productCard: result,
      });
  });
});

/* GET home page. */
router.get('/admin/ll', function (req, res, next) {
  let query = {draft: '上架'};
  
  // base64Img.base64('../models/1.jpg', function(err, data) {console.log(data);})
  // var data = base64Img.base64Sync('models/1.jpg');
  // console.log(data);
  goodModel.find( query, function (err, result) {
      res.render('index', {
          title: '首頁',
          message: '',
          productCard: result,
      });
  });
});

// goods data detail page after upload
router.get('/goods/:id', function (req, res) {
  var id = req.params.id;
  goodModel.findById(id, function (err, result) {
      res.render('admin/index', {
          title: "商品明細",
          productDetial: result
      });
  });
});

module.exports = router;