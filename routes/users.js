var express = require('express');
var router = express.Router();
const _underscore = require('underscore'); // _.extend用新对象里的字段替换老的字段
const f = require('../models/functions.js');
const customerModel = require('../models/customer.js'); // 载入mongoose编译后的模型
const verify = require('../models/verify.js');

// 產生驗證碼 在html加上 '/verify/?'，來使用
router.get('/verify', verify.makeCapcha);

/* GET regesit page. */
router.get('/regesit', function (req, res) {
    console.log("body " + req.body);
    res.render('users/logins', {
        title: '註冊',
        message: req.flash('pannel'),
        cmstype: '使用者註冊',
        herf_login: '/users/login',
        reg: "註冊",
        log: "登入",
    });
});

/* GET regesit form action. */
router.post('/account/new', function (req, res) {
    usersObj = f.User(req.body.user); // getUser
    var fakeID = usersObj._id;
    console.log(fakeID);
    if (fakeID) { // id exists 更新數據
        id = f.decrypt(fakeID);
        es = 0;
        if (!verify.verify(req, req.body.yzm)) {
            req.flash('pannel', '驗證碼錯誤');
            es = 1;
        }
        if (!/^[a-zA-Z0-9]{6,16}$/.test(usersObj.account) || usersObj.account === 'admin') {
            req.flash('pannel', 'error:"帳號要6-16位英文字母+數字"');
        }
        if (!/^[a-zA-Z0-9]{6,16}$/.test(usersObj.password) && req.body.user.password != usersObj.password) {
            req.flash('pannel', 'error:"密码只能是6-16位英文字母+數字"');
            es = 1;
        } else if (usersObj.password !== req.body.user.repassword) {
            req.flash('pannel', 'error:"兩次密碼不一致"');
            es = 1;
        }
        if (!req.body.agree) {
            req.flash('pannel', 'error:"未同意條款"');
            es = 1;
        }
        if (es) {
            fakeID = f.encrypt(req.body.user._id);
            return res.redirect('/users/account/update/' + fakeID);
        }
        customerModel.findById(id, function (err, result) {
            if (err) {
                console.log(">>>>>>db find error>>>>>>" + err);
                return res.json(err);
            }
            usersObj = f.User(req.body.user); // getUser
            console.log(">>>>>ID>>>>" + id);
            usersObj._id = id;
            if (result.password != usersObj.password) { // 有改密碼
                salt = f.makeSalt(6);
                password = usersObj.password;
                usersObj.salt = salt;
                usersObj.password = f.encodePassword(usersObj.password, salt);
                console.log(">>>users>>>\n" + _users);
            }
            _users = _underscore.extend(result, usersObj); // 替換字段
            _users.save(function (err, result) {
                if (err) {
                    console.log(">>>>>>mongodb save error>>>>>>" + err);
                    return res.json(err);
                }
                console.log(result);
                fakeID = f.encrypt(id);
                return res.redirect('/users/account/' + fakeID);
            });
        });
    } else { // id not defined 創建
        es = 0;
        if (!verify.verify(req, req.body.yzm)) {
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
        if (!req.body.agree) {
            req.flash('pannel', 'error:"未同意條款"');
            es = 1;
        }
        if (es) {
            return res.redirect('/users/regesit');
        }
        customerModel.find({
            account: req.body.user.account
        }, function (err, usersObj) {
            if (err) return err;
            if (usersObj.length != 0) {
                req.flash('pannel', '使用者已經存在');
                return res.redirect('/users/regesit');
            }
        });
        customerModel.find({
            email: req.body.user.email
        }, function (err, usersObj) {
            if (err) return err;
            if (usersObj.length != 0) {
                req.flash('pannel', 'Email已經存在');
                return res.redirect('/users/regesit');
            }
        });
        salt = f.makeSalt(6);
        password = usersObj.password;
        usersObj.salt = salt;
        usersObj.password = f.encodePassword(usersObj.password, salt);
        console.log(">>>> usersObj >>>>>>>" + JSON.stringify(usersObj, null, 4));
        _users = new customerModel(usersObj);
        _users.save(function (err, result) {
            if (err) {
                console.log('>>>>>> model.save Error');
                return res.json(err);
            } else {
                console.log('>>>>>> ' + JSON.stringify(result, null, 4));
                fakeID = f.encrypt(result.id);
                res.redirect('/users/account/' + fakeID);
            }
        });
    }
});

router.get('/login', function (req, res, next) {
    adminPass = f.md5("a" + "a"); // Admin，加鹽密碼
    adminPass = f.encodePassword("a", "a")
    console.log(">>>>admin.account:a pass: a encrypt:" + adminPass);
    res.render('users/logins', {
        title: '登入',
        message: req.flash('pannel'),
        cmstype: '使用者登入',
        herf_regesit: '/users/regesit',
    });
});

/* POST login page. */
router.post('/login', function (req, res) {
    // console.log(req.body);
    account = req.body.user.account;
    password = req.body.user.password;
    if (!verify.verify(req, req.body.yzm)) {
        req.flash('pannel', '驗證碼錯誤');
        // 如果直接不是用return的話會報錯 Cannot set headers after they are sent to the client
        return res.redirect('/users/login');
    }
    customerModel.find({
        account: account
    }, function (err, userObj) {
        if (err) return err;
        // findOne 如果沒有資料的話直接錯誤，所以不用這個，除非直接傳送新的http response不然會有問題
        // find 返回一個 [{objects, objects...}]的 json array，因為註冊機制的關係不會重複
        if (userObj.length == 0) {
            req.flash('pannel', '使用者不存在');
            return res.redirect('/users/login');
        } else {
            if (userObj[0].password === f.encodePassword(password, userObj[0].salt)) {
                // 建立會話 session 以雜湊密碼後的密碼+之前亂數salt，再行雜湊
                // req.session.user = f.encodePassword(userObj[0].password, userObj[0].salt);
                // req.session.get = f.encrypt(userObj[0].account);
                account = f.encrypt(userObj[0].account);
                passphrase = f.encodePassword(userObj[0].password, userObj[0].salt);
                req.session.user = {
                    account: account,
                    passphrase: passphrase
                };
                console.log(req.session);
                return res.redirect('/admin');
            } else {
                req.flash('pannel', '密碼錯誤');
                return res.redirect('/users/login');
            }
        }
    });
});

router.get('/logout', function (req, res) {
    // Error: req.flash() requires sessions
    // req.session.destroy(); // 刪除所有會話Express.session這個方法包括cookie
    if (req.session.user) {
        account = f.decrypt(req.session.user.account);
        req.session.user = null; //只有刪除一個會話
        req.flash('pannel', "mesage: " + account + " 您已經登出"); //這會使用到cookie
        return res.redirect('/users/login');
    }
    req.session.user = null; //只有刪除一個會話
    req.flash('pannel', "mesage: '沒有登入'"); //這會使用到cookie
    return res.redirect('/users/login');
    // return res.json({mesage:'已經登出'});
});

//此檔案後面需要登入才能使用 
// session 緩存機制一般在 記憶體内存、cookie、redis、memcached、database
// app.use(function(err, req, res, next){}
// 後面行數，在每一個請求被處理之前都會執行的 middleware
// router.use(function (req, res, next) {
//     if(req.session.user || req.session.admin){
//         next();
//     }else{
//         return res.redirect('/users/login');
//     }
// });
//後面行數，需要登入才能使用

// Controller of the views and model
// 使用者的部分
router.get('/', function (req, res, next) {
    customerModel.fetch(function (err, result) {
        if (err) {
            console.log(err);
            return res.json(err);
        }
        arr = f.fakeIdArray(result);
        console.log("arr>>>\n" + arr);
        res.render('users/index', {
            title: '使用者',
            message: '',
            userlist: arr,
        });
    });
});

// user data detail page after regesit
router.get('/account/:id', function (req, res) {
    //網址上的 :id = req.params.id
    var id = f.decrypt(req.params.id);
    customerModel.findById(id, function (err, result) {
        result.fakeID = f.encrypt(result.id);
        result._id = null;
        console.log("\n>>>findById>>>\n" + result);
        res.render('users/index', {
            title: '您好，' + result.firstname,
            detial: result
        });
    });
});

// user modify
router.get('/account/update/:id', function (req, res) {
    var id = f.decrypt(req.params.id);
    if (id) {
        customerModel.findById(id, function (err, result) {
            result.fakeID = f.encrypt(result.id);
            result._id = null;
            res.render('users/logins', {
                title: '註冊',
                log: "登入",
                herf_login: "/users/login",
                alert: 'modify your password',
                message: req.flash('pannel'),
                users: result,
                reg: "更新",
            });
        });
    }
});

// list delete user data (play with html JS) see datasets/userlist.html
// ajax 異步請求 DELETE (need jquery and ajax)
router.delete('/account/delete/:id', function (req, res) {
    console.log("DELETE>>>>>>"+req.params.id);
    var id = f.decrypt(req.params.id);
    let query = {
        _id: id
    };
    customerModel.remove(query, function (err) {
        if (err) {
            console.log(err);
            return res.json(err);
        }
        res.send('Success');
    });
});

module.exports = router;