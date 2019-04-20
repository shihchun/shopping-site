const express = require('express');
const router = express.Router(); // 對應使用的http方法
const _underscore = require('underscore'); // _.extend用新对象里的字段替换老的字段

const userModel = require('../models/users.js'); // 载入mongoose编译后的模型
const goodModel = require('../models/goods.js'); // 载入mongoose编译后的模型
const uploadModel = require('../models/upload.js'); // 载入multer上傳檔案
const f = require('../models/functions.js');
const verify = require('../models/verify.js');
const fs = require('fs');

const upload = uploadModel.any('pageImage'); // 實例化上傳檔案的 multer

/**
 * make salt hash 用密碼加鹽得到雜湊值
 * @param {String} pwd
 * @param {String} salt 
 * @returns hash value
 */
function encodePassword(pwd, salt) {
    return f.md5(pwd + salt);
}

// 產生驗證碼 在html加上 '/verify/?'，來使用
router.get('/verify', verify.makeCapcha); 

/* GET regesit page. */
router.get('/regesit', function (req, res) {
    console.log("body "+req.body);
    res.render('admin/logins', {
        title: '管理員註冊',
        message: req.flash('pannel'),
        cmstype: 'Admin Pannel',
        herf_login: '/admin/login',
        reg: "註冊",
        log: "登入",
    });
});

/* GET regesit form action. */
router.post('/users/new', function (req, res) {
    usersObj = f.User(req.body.user); // getUser
    id = usersObj._id;
    console.log(id);
    if (id) { // id exists 更新數據
        id = f.decrypt(req.body.user._id);
        es = 0;
        if(!verify.verify(req, req.body.yzm)){
            req.flash('pannel', '驗證碼錯誤');
            es = 1;
        }
        if (!/^[a-zA-Z0-9]{6,16}$/.test(usersObj.account) || usersObj.account === 'admin') {
            req.flash('pannel', 'error:"帳號要6-16位英文字母+數字"');
        }
        if (!/^[a-zA-Z0-9]{6,16}$/.test(usersObj.password)&& req.body.user.password != usersObj.password) {
            req.flash('pannel', 'error:"密码只能是6-16位英文字母+數字"');
            es = 1;
        } else if (usersObj.password !== req.body.user.repassword) {
            req.flash('pannel', 'error:"兩次密碼不一致"');
            es = 1;
        }
        if (!req.body.agree){
            req.flash('pannel', 'error:"未同意條款"');
            es = 1;
        }
        if(es){
            fakeID = f.encrypt(req.body.user._id);
            return res.redirect('/admin/users/update/' + fakeID);
        }
        query = id;
        userModel.findById(query, function (err, result) {
            if (err) {
                console.log(">>>>>>db find error>>>>>>" + err);
                return res.json(err);
            }
            usersObj = f.User(req.body.user); // getUser
            console.log(">>>>>ID>>>>"+id);
            usersObj._id = id;
           
            if(result.password != usersObj.password){ // 有改密碼
                _users = _underscore.extend(result, usersObj); // 替換字段
                console.log(">>>>CHANGE PASSWD>>>>>");
                salt = f.makeSalt(6);
                password = _users.password;
                _users.salt = salt;
                _users.password = f.encodePassword(_users.password, salt);
                console.log(">>>users>>>\n"+ _users);
            }
            _users.save(function (err, result) {
                if (err) {
                    console.log(">>>>>>mongodb save error>>>>>>" + err);
                    return res.json(err);
                }
                console.log(result);
                fakeID = f.encrypt(id);
                return res.redirect('/admin/users/' + fakeID);
            });
        });
    } else { // id not defined 創建
        es = 0;
        if(!verify.verify(req, req.body.yzm)){
            req.flash('pannel', '驗證碼錯誤');
            es = 1;
        }
        if (!/^[a-zA-Z0-9]{6,16}$/.test(usersObj.account) || usersObj.account === 'admin') {
            req.flash('pannel', 'error:"帳號要6-16位英文字母+數字"');
        }
        if (!/^[a-zA-Z0-9]{6,16}$/.test(usersObj.password)) {
            req.flash('pannel', 'error:"密码只能是6-16位英文字母+數字"');
            es = 1;
        } else if (usersObj.password !== req.body.user.repassword) {
            req.flash('pannel', 'error:"兩次密碼不一致"');
            es = 1;
        }
        if (!req.body.agree){
            req.flash('pannel', 'error:"未同意條款"');
            es = 1;
        }
        if(es){
            return res.redirect('/admin/regesit');
        }
        userModel.find({ account: req.body.user.account}, function (err, usersObj) {
            if (err) return err;
            if(usersObj.length != 0){ 
                req.flash('pannel', '使用者已經存在'); 
                return res.redirect('/admin/regesit');
            }
        });
        userModel.find({ email: req.body.user.email}, function (err, usersObj) {
            if (err) return err;
            if(usersObj.length != 0){
                req.flash('pannel', 'Email已經存在'); 
                return res.redirect('/admin/regesit');
            }
        });
        salt = f.makeSalt(6);
        password = usersObj.password;
        usersObj.salt = salt;
        usersObj.password = f.encodePassword(usersObj.password, salt);
        console.log(">>>> usersObj >>>>>>>" + JSON.stringify(usersObj, null, 4));
        _users = new userModel(usersObj);
        _users.save(function (err, result) {
            if (err) {
                console.log('>>>>>> model.save Error');
                return res.json(err);
            } else {
                console.log('>>>>>> ' + JSON.stringify(result, null, 4));
                fakeID = f.encrypt(result.id);
                res.redirect('/admin/users/' + fakeID);
            }
        });
    }
});

router.get('/login', function (req, res, next) {
    adminPass = f.md5("a" + "a"); // Admin，加鹽密碼
    adminPass = f.encodePassword("a", "a")
    console.log(">>>>admin.account:a pass: a encrypt:"+adminPass);
    res.render('admin/logins', {
        title: '管理員登入',
        message: req.flash('pannel'),
        cmstype: 'Admin Pannel',
        herf_regesit: '/admin/regesit',
    });
});

/* POST login page. */
router.post('/login', function (req, res) {
    // console.log(req.body);
    account = req.body.user.account;
    password = req.body.user.password;
    if(!verify.verify(req, req.body.yzm)){
        req.flash('pannel', '驗證碼錯誤');
        // 如果直接不是用return的話會報錯 Cannot set headers after they are sent to the client
        return res.redirect('/admin/login');
    }
    userModel.find({ account: account}, function (err, userObj) {
        if (err) return err;
        // findOne 如果沒有資料的話直接錯誤，所以不用這個，除非直接傳送新的http response不然會有問題
        // find 返回一個 [{objects, objects...}]的 json array，因為註冊機制的關係不會重複
        if(userObj.length == 0){ 
            req.flash('pannel', '使用者不存在');
            return res.redirect('/admin/login');
        }
        else{
            if (userObj[0].password === f.encodePassword(password, userObj[0].salt)) {
                // 建立會話 session 以雜湊密碼後的密碼+之前亂數salt，再行雜湊
                // req.session.user = f.encodePassword(userObj[0].password, userObj[0].salt);
                // req.session.get = f.encrypt(userObj[0].account);
                passphrase = f.encodePassword(userObj[0].password, userObj[0].salt);
                account = f.encrypt(userObj[0].account);
                req.session.user = {account: account, passphrase: passphrase};
                console.log(req.session);
                return res.redirect('/admin');
            } else {
                req.flash('pannel', '密碼錯誤');
                return res.redirect('/admin/login');
            }
        }
    });
});

router.get('/logout', function (req, res) {
    // Error: req.flash() requires sessions
    // req.session.destroy(); // 刪除所有會話Express.session這個方法包括cookie
    if (req.session.user){
        account = f.decrypt(req.session.user.account);
        req.session.user = null; //只有刪除一個會話
        req.flash('pannel', "mesage: "+account+ " 您已經登出"); //這會使用到cookie
        return res.redirect('/admin/login');
    }
    req.session.user = null; //只有刪除一個會話
    req.flash('pannel', "mesage: '沒有登入'"); //這會使用到cookie
    return res.redirect('/admin/login');
    // return res.json({mesage:'已經登出'});
});

//此檔案後面需要登入才能使用 
// session 緩存機制一般在 記憶體内存、cookie、redis、memcached、database
// 這裡使用  記憶體内存 如果登出session不存在的話，會無法執行任何請求
// 如果是異步請求，不會得到 success cb
// router.use(function (req, res, next) {
//     if(req.session.user){
//         next();
//     }else{
//         return res.redirect('/admin/login');
//     }
// });
//後面行數需要登入才能使用

// Controller of the views and model
// 使用者的部分
router.get('/', function (req, res, next) {
    userModel.fetch(function (err, result) {
        if (err) {
            console.log(err);
            return res.json(err);
        }
        arr = f.fakeIdArray(result);
        console.log("arr>>>\n" + arr);
        res.render('admin/index', {
            title: '管理員',
            message: '',
            userlist: arr,
        });
    });
});

// user data detail page after regesit
router.get('/users/:id', function (req, res) {
    //網址上的 :id = req.params.id
    var id = f.decrypt(req.params.id);
    userModel.findById(id, function (err, result) {
        result.fakeID = f.encrypt(result.id);
        result._id = null;
        console.log("\n>>>findById>>>\n"+result);
        res.render('admin/index', {
            title: '您好，' + result.firstname,
            detial: result
        });
    });
});

// user modify
router.get('/users/update/:id', function (req, res) {
    var id = f.decrypt(req.params.id); 
    if (id) {
        userModel.findById(id, function (err, result) {
            result.fakeID = f.encrypt(result.id);
            result._id = null;
            res.render('admin/logins', {
                title: '管理員註冊',
                log: "登入",
                herf_login: "/admin/login",
                alert: 'modify your password',
                message: req.flash('pannel'),
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
            return res.json(err);
        }
        arr = f.fakeIdArray(result);
        console.log("arr>>>\n" + arr);
        res.render('admin/index', {
            title: '管理員',
            message: '',
            userlist: arr,
        });
    });
});

// list delete user data (play with html JS) see datasets/userlist.html
// ajax 異步請求 DELETE (need jquery and ajax)
router.delete('/users/delete/:id', function (req, res) {
    var id = f.decrypt(req.params.id);
    let query = {
        _id: id
    };
    userModel.remove(query, function (err) {
        if (err) {
            console.log(err);
            return res.json(err);
        }
        res.send('Success');
    });
});

// 商品部分
router.get('/goods', function (req, res, next) {
    userModel.fetch(function (err, result) {
        if (err) {
            console.log(err);
            return res.json(err);
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
            return res.render('admin/index', {message: err});
        } // passing else : now file is uploaded
        // console.log(req); // req detial
        var id = req.body.goods._id;
        let query = { // point the item by _id
            _id: id
        }
        if (id) { // id exists (old model)
            f.Product(req.files, req.body);
            goodModel.findOne(query, function (err, result) {
                if (err) {
                    console.log(">>>>>>1>>>>>>" + err);
                    return res.json(err);
                }
                _goods = _underscore.extend(result, goodsObj); // 替換字段
                // _goods.save(function (err, result) {
                //     if (err) {
                //         console.log(">>>>>> model.save Error: Failed to update record" + err);
                //     }
                //     return res.redirect('/admin/goods/' + result._id);
                // });
            });
        } else { // id not defined (new model)
            f.Product(req.files, req.body);
            _goods = new goodModel(goodsObj); // _goods是一個array
            var data = fs.readFileSync('models/1.jpg');
            _goods.base64.data = data;
            _goods.base64.contentType = 'image/png';
            console.log(">>>> passing the _goods obj" + _goods);
            _goods.save(function (err, result) {
                if (err) {
                    console.log('>>>>>> model.save Error' + err);
                    return res.json(err);
                } else {
                    console.log('>>>>>> ' + JSON.stringify(result, null, 4));
                    fakeID = f.encrypt(result.id);
                    return res.redirect('/admin/goods/' + fakeID);
                }
            });
        }
    });
});

router.get('/goods/list/', function (req, res, next) {
    goodModel.fetch(function (err, result) {
        if (err) {
            console.log(err);
            return res.json(err);
        }
        arr = f.fakeIdArray(result);
        console.log("arr>>>\n" + arr);
        res.render('admin/index', {
            title: '商品列表',
            message: '',
            productlist: arr,
        });
    });
});

// list delete user data (play with html JS) see datasets/userlist.html
// 異步請求 (need jquery and ajax) 異步請求的方式比較安全&數據完整
router.delete('/goods/delete/:id', function (req, res) {
    id = f.decrypt(req.params.id);
    let query = {
        _id: id
    }; // point the item by _id
    goodModel.remove(query, function (err) {
        if (err) {
            console.log(err);
            return res.json(err);
        }
        res.send('Success'); // 得到這個訊息HTTP 200，會做js動作
    });
});

// goods modify
router.get('/goods/update/:id', function (req, res) {
    var id = f.decrypt(req.params.id);
    if (id) {
        goodModel.findById(id, function (err, result) {
            result.fakeID = f.encrypt(result.id);
            result._id = null;
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
    var id = f.decrypt(req.params.id);
    goodModel.findById(id, function (err, result) {
        esult.fakeID = f.encrypt(result.id);
        result._id = null;
        res.render('admin/index', {
            // result 是之前實例化的 Model
            productDetial: result
        });
    });
});

module.exports = router;