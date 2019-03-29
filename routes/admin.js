const express = require('express');
const router = express.Router(); // 對應使用的http方法
const _underscore = require('underscore'); // _.extend用新对象里的字段替换老的字段

const userModel = require('../models/users.js'); // 载入mongoose编译后的模型
const goodModel = require('../models/goods.js'); // 载入mongoose编译后的模型
const uploadModel = require('../models/upload.js'); // 载入multer上傳檔案
const f = require('../models/functions.js');
const fs = require('fs');

const upload = uploadModel.any('pageImage'); // 實例化上傳檔案的 model

// Controller of the views and model
// 使用者的部分

router.get('/', function (req, res, next) {
    userModel.fetch(function (err, result) {
        if (err) {
            console.log(err);
        }
        res.render('admin/index', {
            title: '管理員',
            message: '',
            userlist: result,
        });
    });
});

router.get('/login', function (req, res, next) {
    res.render('admin/logins', {
        title: '管理員登入',
        message: req.flash('pannel'),
        cmstype: 'Admin Pannel',
        herf_regesit: '/admin/regesit',
    });
});

/* POST login page. */
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
    f.User(req.body.user);
    console.log(usersObj);
    id = usersObj._id;
    let query = {
        _id: usersObj._id
    }
    if (id) { // id exists 更新數據
        userModel.findOne(query, function (err, result) {
            if (err) {
                console.log(">>>>>>1>>>>>>" + err);
            }
            _users = _underscore.extend(result, usersObj); // 替換字段
            _users.save(function (err, result) {
                if (err) {
                    console.log(">>>>>>2>>>>>>" + err);
                }
                res.redirect('/admin/users/' + result._id);
            });
        });
    } else { // id not defined 創建
        if (req.body.password != req.body.repassword) {
            req.flash('pannel', '兩次密碼不一致');
            res.redirect('/admin/regesit');
            res.end();
        } else {
            f.User(req.body.user);
            console.log("text >>>> form exports.function >>>>"+ usersObj + ">>>" + JSON.stringify(usersObj, null, 4));
            _users = new userModel(usersObj);
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
            title: '您好，' + result.firstname,
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

router.get('/user/list/', function (req, res, next) {
    userModel.fetch(function (err, result) {
        if (err) {
            console.log(err);
        }
        res.render('admin/index', {
            title: '管理員',
            message: '',
            userlist: result,
        });
    });
});

// list delete user data (play with html JS) see datasets/userlist.html
// 異步請求 (need jquery and ajax) 異步請求的方式比較安全&數據完整
router.delete('/users/delete/:id', function (req, res) {
    let query = {
        _id: req.params.id
    }
    userModel.remove(query, function (err) {
        if (err) {
            console.log(err);
        }
        res.send('Success');
    });
});

// 商品部分

router.get('/goods', function (req, res, next) {
    userModel.fetch(function (err, result) {
        if (err) {
            console.log(err);
        }
        res.render('admin/goodsAdd', {
            title: '管理員',
            message: '',
            submit: '提交',
            userlist: result,
        });
    });
});

router.post('/goods', function (req, res, next) {
    upload(req, res, (err) => { // 實例化已設定接受html id=pageImage的檔案
        if (err) {
            res.render('admin/index', {
                message: err
            });
        } // passing else : now file is uploaded
        console.log(req); // req detial
        var id = req.body.goods._id;
        let query = { // point the item by _id
            _id: id
        }
        if (id) { // id exists (old model)
            f.Product(req.files, req.body);
            goodModel.findOne(query, function (err, result) {
                if (err) {
                    console.log(">>>>>>1>>>>>>" + err);
                }
                _goods = _underscore.extend(result, goodsObj); // 替換字段
                // _goods.save(function (err, result) {
                //     if (err) {
                //         console.log(">>>>>> model.save Error: Failed to update record" + err);
                //     }
                //     res.redirect('/admin/goods/' + result._id);
                // });
            });
        } else { // id not defined (new model)
            f.Product(req.files, req.body);
            _goods = new goodModel(goodsObj); // 定義json不用使用var，_goods是一個json文件
            var data = fs.readFileSync('models/1.jpg');
            _goods.base64.data = data;
            _goods.base64.contentType = 'image/png';
            console.log(">>>> passing the _goods obj" + _goods);
            _goods.save(function (err, result) {
                if (err) {
                    console.log('>>>>>> model.save Error' + err);
                } else {
                    console.log('>>>>>> ' + JSON.stringify(result, null, 4));                        
                    res.redirect('/admin/goods/' + result._id);
                }
            });
        }
        
    });
});

router.get('/goods/list/', function (req, res, next) {
    goodModel.fetch(function (err, result) {
        if (err) {
            console.log(err);
        }
        res.render('admin/index', {
            title: '商品列表',
            message: '',
            productlist: result,
        });
    });
});

// list delete user data (play with html JS) see datasets/userlist.html
// 異步請求 (need jquery and ajax) 異步請求的方式比較安全&數據完整
router.delete('/goods/delete/:id', function (req, res) {
    let query = {
        _id: req.params.id
    } // point the item by _id
    goodModel.remove(query, function (err) {
        if (err) {
            console.log(err);
        }
        res.send('Success');
    });
});

// goods modify
router.get('/goods/update/:id', function (req, res) {
    var id = req.params.id;
    if (id) {
        goodModel.findById(id, function (err, result) {
            console.log(result);
            res.render('admin/goodsAdd', {
                title: '商品更新',
                message: 'modify goods info',
                submit: '更新',
                product: result,
            });
        });
    }
});

// goods data detail page after upload
router.get('/goods/:id', function (req, res) {
    var id = req.params.id;
    goodModel.findById(id, function (err, result) {
        res.render('admin/index', {
            // result 是之前實例化的 Model
            productDetial: result
        });
    });
});

module.exports = router;