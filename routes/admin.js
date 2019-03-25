var express = require('express');
var router = express.Router(); // 對應使用的http方法
var _underscore = require('underscore'); // _.extend用新对象里的字段替换老的字段

var userModel = require('../models/users.js'); // 载入mongoose编译后的模型
var goodModel = require('../models/goods.js'); // 载入mongoose编译后的模型
var uploadModel = require('../models/upload.js'); // 载入multer上傳檔案
var upload = uploadModel.any('pageImage'); // 實例化上傳檔案的 model


// 使用這部分

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
// userModel.findOne(query_json,{keying object or func});
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

// 商品部分

router.get('/goods', function (req, res, next) {
    userModel.fetch(function (err, result) {
        if (err) {
            console.log(err);
        }
        res.render('admin/goodsAdd', { // 渲染index 首页
            /* template locals context */
            title: '管理員',
            message: '',
            submit: '提交',
            userlist: result,
        });
    });
});

// @ req.files, req.body
function getProduct(files, pageBodys){ // when post new product
    var img = []; // 不用 = new Array(); 效率問題
    for (let i = 0; i < files.length; ++i) { // 檔案上傳個數
        console.log("上傳的第" + (i+1) + "個路徑到: " + files[i].path.slice(6));
        img[i] = files[i].path.slice(6);
    }
    goodsObj = {
        name: pageBodys.goods.name,
        quentity: pageBodys.goods.quentity,
        des: pageBodys.goods.des,
        price: pageBodys.goods.price,
        draft: pageBodys.goods.draft,
        img_count: files.length,
        img: img
        };
    console.log("files count: " + files.length);
    console.log(">>>>>>>>>prepare to upload" + JSON.stringify(goodsObj, null, 4));
    return goodsObj;
}

router.post('/goods', function (req, res, next) {
    upload(req, res, (err) => { // 實例化已設定接受html id=pageImage的檔案
        if (err) {
            res.render('admin/index', {
                message: err
            });
        } else {
            var id = req.body.goods._id;
            let query = { // point the item by _id
                _id: id
            }
            if (id) { // id exists (old model)
                getProduct(req.files,req.body); // return goodsObj
                goodModel.findOne(query, function (err, result) {
                    if (err) {
                        console.log(">>>>>>1>>>>>>" + err);
                    }
                    _goods = _underscore.extend(result, goodsObj); // 替換字段 underscore.extend 也可以用concat()和spice()，用shallow copy的方式
                    // Mongoose sends a `updateOne(json object _goods)`
                    _goods.save(function (err, result) {
                        if (err) {
                            console.log(">>>>>> model.save Error: Failed to update record" + err);
                        }
                        res.redirect('/admin/goods/' + result._id);
                    });
                });
            } else { // id not defined (new model)
                getProduct(req.files,req.body); // return goodsObj
                //function(object,{content}) parsing object 
                _goods = new goodModel(goodsObj); // 定義json不用使用var，_goods是一個json文件
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

router.get('/goods/list/', function (req, res, next) {
    goodModel.fetch(function (err, result) {
        if (err) {
            console.log(err);
        }
        res.render('admin/index', { // 渲染index 首页
            /* template locals context */
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