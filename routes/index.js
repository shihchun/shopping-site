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

// goods data detail page after upload
router.get('/goods/:id', function (req, res) {
  var id = req.params.id;
  goodModel.findById(id, function (err, result) {
      res.render('admin/index', {
          productDetial: result
      });
  });
});

module.exports = router;


// const express = require('express');
// const router = express.Router(); // 對應使用的http方法
// const _underscore = require('underscore'); // _.extend用新对象里的字段替换老的字段

// const userModel = require('../models/users.js'); // 载入mongoose编译后的模型
// const goodModel = require('../models/goods.js'); // 载入mongoose编译后的模型
// const uploadModel = require('../models/upload.js'); // 载入multer上傳檔案
// const f = require('../models/functions.js');
// const verify = require('../models/verify.js');
// const fs = require('fs');

// const upload = uploadModel.any('pageImage'); // 實例化上傳檔案的 multer
// const bcrypt = require('bcrypt');

// /**
//  * # 數據交互
//  * ✔ jQuery Ajax（Asynchronous JavaScript and XML） // Gmail推出開始漸漸使用
//  * JS操作CSS與DOM（文件物件模型 req content）-> 視覺效果簡單 ↑，現在被大量使用 
//  * 直接在，前段使用對應的代碼即可
//  * ✘ XMLHttpRequest 這個要在server後端（隱藏的代碼），還有HTML前段寫，有人覺得比較安全
//  * var app = express(); //  實例化 after require express.js httpserver module
//  * var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
//  * var xhr = new XMLHttpRequest();
//  * app.get('/users', function(req, res, next) {
//  *    res.send({"name": "tom", "age": 24});
//  *  });
//  * <script>
//  * var xhr = new XMLHttpRequest();
//  * xhr.open('get', '/users', true);
//  * xhr.responseType = 'json';
//  * xhr.send(null);
//  * xhr.onreadystatechange = function() {
//  *     if(xhr.status===200 && xhr.readyState===4) {
//  *         console.log(xhr.response);
//  *     }
//  * }    
//  * </script>
//  */

// // 生成验证码
// router.get('/verify', verify.makeCapcha);

// router.get('/login', function (req, res, next) {
//     res.render('admin/logins', {
//         title: '管理員登入',
//         message: req.flash('pannel'),
//         cmstype: 'Admin Pannel',
//         herf_regesit: '/admin/regesit',
//     });
// });

// /* POST login page. */
// router.post('/login', function (req, res) {
//     // console.log(req.body);
//     account = req.body.user.account;
//     password = req.body.user.password;
//     if(!verify.verify(req, req.body.yzm)){
//         req.flash('pannel', '驗證碼錯誤');
//         // 如果直接不是用return的話會報錯 Cannot set headers after they are sent to the client
//         return res.redirect('/admin/login'); 
//     }
//     userModel.find({ account: account}, function (err, userObj) {
//         if (err) return err;
//         // findOne 如果沒有資料的話直接錯誤，所以不用這個，除非直接傳送新的http response不然會有問題
//         // find 返回一個 [{objects, objects...}]的 json array，因為註冊機制的關係不會重複
//         if(userObj==""){ console.log("使用者不存在"); req.flash('pannel', '使用者不存在'); res.redirect('/admin/login');}
//         else{
//             console.log("encode from insert>>>>>>"+ encodePassword(password, userObj[0].salt));
//             console.log("database>>>>>>>" + userObj[0].password);
//             if (userObj[0].password === encodePassword(password, userObj[0].salt)) {
//                 res.redirect('/admin');
//             } else {
//                 req.flash('pannel', '密碼錯誤');
//                 res.redirect('/admin/login');
//             }
//         }
//     });
// });

// /* GET regesit page. */
// router.get('/regesit', function (req, res) {
//     res.render('admin/logins', {
//         title: '管理員註冊',
//         message: req.flash('pannel'),
//         cmstype: 'Admin Pannel',
//         herf_login: '/admin/login',
//         reg: "註冊",
//         log: "登入",
//     });
// });


// function encodePassword(pwd, salt) {
//     return f.md5(pwd + salt);
// }

// /* GET regesit form action. */
// router.post('/users/new', function (req, res) {
//     f.User(req.body.user);
//     console.log(usersObj);
//     id = usersObj._id;
//     let query = {
//         _id: usersObj._id
//     }
//     if (id) { // id exists 更新數據
//         userModel.findOne(query, function (err, result) {
//             if (err) {
//                 console.log(">>>>>>db find error>>>>>>" + err);
//             }
            
//             _users = _underscore.extend(result, usersObj); // 替換字段
//             if(result.password != usersObj.password){ // 有改密碼
//                 salt = f.makeSalt(6);
//                 password = _users.password;
//                 _users.salt = salt;
//                 _users.password = encodePassword(_users.password, salt);
//             }
//             _users.save(function (err, result) {
//                 if (err) {
//                     console.log(">>>>>>mongodb save error>>>>>>" + err);
//                 }
//                 console.log(result);
//                 res.redirect('/admin/users/' + result._id);
//             });
//         });
//     } else { // id not defined 創建
//         if(!verify.verify(req, req.body.yzm)){
//             req.flash('pannel', '驗證碼錯誤');
//             return res.redirect('/admin/login'); 
//         }
//         es = 0;
//         if (!/^[a-zA-Z0-9]{6,16}$/.test(usersObj.account) || usersObj.account === 'admin') {
//             req.flash('pannel', 'error:"帳號要6-16位英文字母+數字"');
//             es = 1;
//         }
//         if (!/^[a-zA-Z0-9]{6,16}$/.test(usersObj.password)) {
//             req.flash('pannel', 'error:"密码只能是6-16位英文字母+數字"');
//             es = 1;
//         } else if (usersObj.password !== req.body.user.repassword) {
//             req.flash('pannel', 'error:"兩次密碼不一致"');
//             es = 1;
//         }
//         if (!req.body.user.agree){
//             req.flash('pannel', 'error:"未同意條款"');
//             es = 1;
//         }
//         if(es){return res.redirect('/admin/regesit');} 
//         userModel.find({ account: req.body.user.account}, function (err, userObj) {
//             if (err) return err;
//             if(userObj==""){ console.log("使用者不存在可以註冊");}
//             else{ req.flash('pannel', '使用者已經存在'); return res.redirect('/admin/regesit');}
//         });
//         userModel.find({ email: req.body.user.email}, function (err, userObj) {
//             if (err) return err;
//             if(userObj==""){ console.log("Email不存在可以註冊");}
//             else{ req.flash('pannel', 'Email已經存在'); return res.redirect('/admin/regesit');}
//         });
//         as = 1;
//         if(as) { // 上傳數據
            
//             f.User(req.body.user);
//             salt = f.makeSalt(6);
//             password = usersObj.password;
//             usersObj.salt = salt;
//             usersObj.password = encodePassword(usersObj.password, salt);
//             console.log("text >>>> form exports.function >>>>"+ usersObj + ">>>" + JSON.stringify(usersObj, null, 4));
//             _users = new userModel(usersObj);
//             _users.save(function (err, result) {
//                 if (err) {
//                     console.log('>>>>>> model.save Error');
//                 } else {
//                     console.log('>>>>>> ' + JSON.stringify(result, null, 4));
//                     res.redirect('/admin/users/' + result._id);
//                 }
//             });
//         }
//     }
// });

// router.get('/logout', function (req, res) {
//     req.session.user = null;
//     res.redirect('./login');
// });

// //後面需要登入才能使用

// // Controller of the views and model
// // 使用者的部分
// router.get('/', function (req, res, next) {
//     userModel.fetch(function (err, result) {
//         if (err) {
//             console.log(err);
//         }
//         res.render('admin/index', {
//             title: '管理員',
//             message: '',
//             userlist: result,
//         });
//     });
// });


// // user data detail page after regesit
// router.get('/users/:id', function (req, res) {
//     var id = req.params.id;
//     userModel.findById(id, function (err, result) {
//         res.render('admin/index', {
//             title: '您好，' + result.firstname,
//             detial: result
//         });
//     });
// });

// // user modify
// router.get('/users/update/:id', function (req, res) {
//     var id = req.params.id; //網址上的 :id
//     if (id) {
//         userModel.findById(id, function (err, result) {
//             console.log(result);
//             res.render('admin/logins', {
//                 title: '管理員註冊',
//                 log: "登入",
//                 herf_login: "/admin/login",
//                 message: 'modify your password',
//                 users: result,
//                 reg: "更新",
//             });
//         });
//     }
// });

// router.get('/user/list/', function (req, res, next) {
//     userModel.fetch(function (err, result) {
//         if (err) {
//             console.log(err);
//         }
//         res.render('admin/index', {
//             title: '管理員',
//             message: '',
//             userlist: result,
//         });
//     });
// });

// // list delete user data (play with html JS) see datasets/userlist.html
// // ajax 異步請求 DELETE (need jquery and ajax)
// router.delete('/users/delete/:id', function (req, res) {
//     let query = {
//         _id: req.params.id
//     }
//     userModel.remove(query, function (err) {
//         if (err) {
//             console.log(err);
//         }
//         res.send('Success');
//     });
// });

// // 商品部分
// router.get('/goods', function (req, res, next) {
//     userModel.fetch(function (err, result) {
//         if (err) {
//             console.log(err);
//         }
//         res.render('admin/goodsAdd', {
//             title: '管理員',
//             message: '',
//             submit: '提交',
//             userlist: result,
//         });
//     });
// });

// router.post('/goods', function (req, res, next) {
//     upload(req, res, (err) => { // 實例化已設定接受html id=pageImage的檔案
//         if (err) {
//             res.render('admin/index', {
//                 message: err
//             });
//         } // passing else : now file is uploaded
//         console.log(req); // req detial
//         var id = req.body.goods._id;
//         let query = { // point the item by _id
//             _id: id
//         }
//         if (id) { // id exists (old model)
//             f.Product(req.files, req.body);
//             goodModel.findOne(query, function (err, result) {
//                 if (err) {
//                     console.log(">>>>>>1>>>>>>" + err);
//                 }
//                 _goods = _underscore.extend(result, goodsObj); // 替換字段
//                 // _goods.save(function (err, result) {
//                 //     if (err) {
//                 //         console.log(">>>>>> model.save Error: Failed to update record" + err);
//                 //     }
//                 //     res.redirect('/admin/goods/' + result._id);
//                 // });
//             });
//         } else { // id not defined (new model)
//             f.Product(req.files, req.body);
//             _goods = new goodModel(goodsObj); // 定義json不用使用var，_goods是一個json文件
//             var data = fs.readFileSync('models/1.jpg');
//             _goods.base64.data = data;
//             _goods.base64.contentType = 'image/png';
//             console.log(">>>> passing the _goods obj" + _goods);
//             _goods.save(function (err, result) {
//                 if (err) {
//                     console.log('>>>>>> model.save Error' + err);
//                 } else {
//                     console.log('>>>>>> ' + JSON.stringify(result, null, 4));                        
//                     res.redirect('/admin/goods/' + result._id);
//                 }
//             });
//         }
        
//     });
// });

// router.get('/goods/list/', function (req, res, next) {
//     goodModel.fetch(function (err, result) {
//         if (err) {
//             console.log(err);
//         }
//         res.render('admin/index', {
//             title: '商品列表',
//             message: '',
//             productlist: result,
//         });
//     });
// });

// // list delete user data (play with html JS) see datasets/userlist.html
// // 異步請求 (need jquery and ajax) 異步請求的方式比較安全&數據完整
// router.delete('/goods/delete/:id', function (req, res) {
//     let query = {
//         _id: req.params.id
//     } // point the item by _id
//     goodModel.remove(query, function (err) {
//         if (err) {
//             console.log(err);
//         }
//         res.send('Success');
//     });
// });

// // goods modify
// router.get('/goods/update/:id', function (req, res) {
//     var id = req.params.id;
//     if (id) {
//         goodModel.findById(id, function (err, result) {
//             console.log(result);
//             res.render('admin/goodsAdd', {
//                 title: '商品更新',
//                 message: 'modify goods info',
//                 submit: '更新',
//                 product: result,
//             });
//         });
//     }
// });

// // goods data detail page after upload
// router.get('/goods/:id', function (req, res) {
//     var id = req.params.id;
//     goodModel.findById(id, function (err, result) {
//         res.render('admin/index', {
//             // result 是之前實例化的 Model
//             productDetial: result
//         });
//     });
// });

// module.exports = router;