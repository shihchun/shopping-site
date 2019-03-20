var express = require('express');
var router = express.Router();
var _underscore = require('underscore'); // _.extend用新对象里的字段替换老的字段

var userModel = require('../models/users.js'); // 载入mongoose编译后的模型
var goodModel = require('../models/goods.js'); // 载入mongoose编译后的模型

router.get('/', function (req, res, next) {
    userModel.fetch(function (err, result) {
        if (err) {
            console.log(err);
        }
        res.render('admin/index', { // 渲染index 首页
            /* template locals context */
            title: '管理員',
            message: '',
            userlist: result,
        });
    });
});

router.get('/login', function (req, res, next) {
    res.render('admin/logins', {
        /* template locals context */
        title: '管理員登入',
        message: req.flash('pannel'),
        cmstype: 'Admin Pannel',
        herf_regesit: '/admin/regesit',
    });
});

/* POST login page. */
// userModel.findOne();
//{ email: req.body.user.email }, function(err, userObj) {console.log(userObj);}
router.post('/login', function (req, res) {
    console.log(req.body.user);
    email = req.body.user.email;
    password = req.body.user.password;
    userModel.findOne({
        email: email,
        password: password
    }, function (err, userObj) {
        if (err) {}
        if (userObj != null) {
            if (err) {
                res.redirect('/admin/login');
                console.log("loop2 break");
            }
            res.redirect('/admin');
        } else {
            req.flash('pannel', '使用者不存在或是密碼錯誤');
            res.redirect('/admin/logins');
        }
    });
});


/* GET regesit page. */
router.get('/regesit', function (req, res) {
    res.render('admin/logins', {
        /* template locals context */
        title: '管理員註冊',
        message: req.flash('pannel'),
        cmstype: 'Admin Pannel',
        herf_login: '/admin/login',
        reg: "註冊",
        log: "登入",
        user: { // 表單清除
            DOB: "1997-01-01"
        },
    });
});

router.post('/users/new', function (req, res) {
    console.log(req.body.user);
    var usersObj = req.body.user;
    id = usersObj._id;
    let query = { // point the item by _id
        _id: usersObj._id
    }
    if (id) { // id exists
        userModel.findOne(query, function (err, result) {
            if (err) {
                console.log(">>>>>>1>>>>>>" + err);
            }
            usersObj.fullname = usersObj.lastname + usersObj.firstname;
            _users = _underscore.extend(result, usersObj); // 替換字段
            _users.save(function (err, result) {
                if (err) {
                    console.log(">>>>>>2>>>>>>" + err);
                }
                res.redirect('/admin/users/' + result._id);
            });
        });
    } else { // id not defined
        if (usersObj.password != usersObj.repassword) {
            req.flash('pannel', '兩次密碼不一致');
            res.redirect('/admin/regesit');
            res.end();
        } else {
            _users = new userModel({
                "account": usersObj.account,
                "fullname": usersObj.lastname + usersObj.firstname,
                "firstname": usersObj.firstname,
                "lastname": usersObj.lastname,
                "email": usersObj.email,
                "DOB": usersObj.DOB, //dateofbirth.toISOString(),
                "password": usersObj.password,
            });
            _users.save(function (err, result) {
                if (err) {
                    console.log('>>>>>> model.save Error');
                } else {
                    console.log('>>>>>> ' + JSON.stringify(result, null, 4));
                    res.redirect('/admin/users/' + result._id);
                }
            });
        }
    }
});

// user data detail page after regesit
router.get('/users/:id', function (req, res) {
    var id = req.params.id;
    userModel.findById(id, function (err, result) {
        res.render('admin/index', {
            // result 是之前實例化的 Model
            title: '您好，' + result.firstname,
            show_option: 1,
            detial: result
        });
    });
});

// user modify
router.get('/users/update/:id', function (req, res) {
    var id = req.params.id;
    if (id) {
        userModel.findById(id, function (err, result) {
            console.log(result);
            res.render('admin/logins', {
                title: '管理員註冊',
                log: "登入",
                herf_login: "/admin/login",
                message: 'modify your password',
                users: result,
                reg: "更新",
            });
        });
    }
});

// list delete user data (play with html JS) see datasets/userlist.html
// 異步請求 (need jquery and ajax) 異步請求的方式比較安全&數據完整
router.delete('/users/delete/:id', function (req, res) {
    let query = {
        _id: req.params.id
    } // point the item by _id
    userModel.remove(query, function (err) {
        if (err) {
            console.log(err);
        }
        res.send('Success');
    });
});

router.get('/user/list/', function (req, res, next) {
    userModel.fetch(function (err, result) {
        if (err) {
            console.log(err);
        }
        res.render('admin/index', { // 渲染index 首页
            /* template locals context */
            title: '管理員',
            message: '',
            userlist: result,
        });
    });
});

// upload file by using multer
//---------------------------------
const path = require('path');
const multer = require('multer'); // add multipart/form-data at form

// upload part
const storage = multer.diskStorage({ // diskStorage() 式中用{ settings } 加入物件設定
    destination: './pulic/uploads/', // 暫時
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// init upload as and point the storage -> diskStorage()
const uploadSingle = multer({
    storage: storage
}).single('pageImage'); //.single('pageImage'); // add your case input name, can add single file

const upload = multer({ // 確認是有權限的人使用
    storage: storage
}).any('pageImage');

//---------------------------------

router.get('/goods', function (req, res, next) {
    userModel.fetch(function (err, result) {
        if (err) {
            console.log(err);
        }
        res.render('admin/goodsAdd', { // 渲染index 首页
            /* template locals context */
            title: '管理員',
            message: '',
            userlist: result,
        });
    });
});

router.post('/goods', function (req, res, next) {
    upload(req, res, (err) => { // use multer upload method inited
        if (err) {
            res.render('admin/index', {
                message: err
            });
        } else {
            // get image path
            console.log("files count: " + req.files.length);
            var count = req.files.length; // 檔案上傳個數
            var file = req.files; // 檔案上傳 json array file[]
            var img = new Array(); // store the file string
            for (let i = 0; i < count; i++) {
                let j = i + 1;
                console.log("上傳的第" + j + "個路徑: " + file[i].path.slice(6));
                img[i] = file[i].path.slice(6);
            }
            var goodsObj = new Array({ //截取所有元素建立model Mongoose會建立array
                name: req.body.goods.name,
                prices: req.body.goods.price,
                quent: req.body.goods.quent,
                price: req.body.goods.price,
                draft: req.body.goods.draft,
                img_count: req.files.length,
                img: img
            });
            console.log(">>>>>>>>>prepare to upload" + JSON.stringify(goodsObj, null, 4));
            // res.redirect('/admin/goods');
            var id = req.body.goods._id;
            let query = { // point the item by _id
                _id: id
            }
            if (id) { // id exists (old model)
                goodModel.findOne(query, function (err, result) {
                    if (err) {
                        console.log(">>>>>>1>>>>>>" + err);
                    }
                    _goods = _underscore.extend(result, goodsObj); // 替換字段 extend the old letters
                    _goods.save(function (err, result) {
                        if (err) {
                            console.log(">>>>>>2>>>>>>" + err);
                        }
                        res.redirect('/admin/goods/' + result._id);
                    });
                });
            } else { // id not defined (new model)
                var _goods = new goodModel({ //截取所有元素建立model Mongoose會建立array
                    name: req.body.goods.name,
                    prices: req.body.goods.price,
                    quent: req.body.goods.quent,
                    price: req.body.goods.price,
                    draft: req.body.goods.draft,
                    img_count: req.files.length,
                    img: img
                });
                _goods.save(function (err, result) { //儲存到資料庫
                    if (err) {
                        console.log('>>>>>> model.save Error' + err);
                    } else {
                        console.log('>>>>>> ' + JSON.stringify(result, null, 4));
                        res.redirect('/admin/goods/' + result._id);
                    }
                });
            }
        }
    });
});

// user data detail page after regesit
router.get('/goods/:id', function (req, res) {
    var id = req.params.id;
    goodModel.findById(id, function (err, result) {
        res.render('admin/index', {
            // result 是之前實例化的 Model
            title: '您好，' + result.name,
        });
    });
});
module.exports = router;