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

/**
 * 網址雜湊使用 fakeSalt = "g.xrqg"; 跟db _id做雜湊出假的 id當網址
*/


/**
 * # 數據交互
 * ✔ jQuery Ajax（Asynchronous JavaScript and XML） // Gmail推出之後漸漸使用廣泛
 * JS操作CSS與DOM（文件物件模型 req content）-> 視覺效果設計會簡單很多（有人說的），現在被大量使用 
 * 直接在，前段使用對應的代碼即可
 * ✘ XMLHttpRequest 這個要在server後端（隱藏的代碼），還有HTML前段寫，有人覺得比較安全
 * var app = express(); //  實例化 after require express.js httpserver module
 * var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
 * var xhr = new XMLHttpRequest();
 * app.get('/users', function(req, res, next) {
 *    res.send({"name": "tom", "age": 24});
 *  });
 * <script>
 * var xhr = new XMLHttpRequest();
 * xhr.open('get', '/users', true);
 * xhr.responseType = 'json';
 * xhr.send(null);
 * xhr.onreadystatechange = function() {
 *     if(xhr.status===200 && xhr.readyState===4) {
 *         console.log(xhr.response);
 *     }
 * }    
 * </script>
 */

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
                _users.password = encodePassword(_users.password, salt);
                console.log(">>>users>>>\n"+ _users);
            }
            _users = _underscore.extend(result, usersObj); // 替換字段
            _users.save(function (err, result) {
                if (err) {
                    console.log(">>>>>>mongodb save error>>>>>>" + err);
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
        usersObj.password = encodePassword(usersObj.password, salt);
        console.log(">>>> usersObj >>>>>>>" + JSON.stringify(usersObj, null, 4));
        _users = new userModel(usersObj);
        _users.save(function (err, result) {
            if (err) {
                console.log('>>>>>> model.save Error');
            } else {
                console.log('>>>>>> ' + JSON.stringify(result, null, 4));
                fakeID = f.encrypt(result.id);
                res.redirect('/admin/users/' + fakeID);
            }
        });
    }
});

router.get('/login', function (req, res, next) {
    adminPass = f.md5("a" + "a");
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
        if(userObj==""){ 
            console.log("使用者不存在");
            req.flash('pannel', '使用者不存在');
            res.redirect('/admin/login');
        }
        else{
            console.log("encode from insert>>>>>>"+ encodePassword(password, userObj[0].salt));
            console.log("database>>>>>>>" + userObj[0].password);
            if (userObj[0].password === encodePassword(password, userObj[0].salt)) {
                // 建立會話 session 以雜湊密碼後的密碼+之前亂數salt，再行雜湊
                req.session.user = encodePassword(userObj[0].password, userObj[0].salt);
                console.log(req.session);
                console.log(userObj);
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
    req.session.user = null; //只有刪除一個會話
    req.flash('pannel', "mesage:'已經登出'"); //這會使用到cookie
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
        // mongoose 返回的 .id 不可寫，所以建立一個fakeID當 URL
        for(i=0; i <= result.length -1; i++){
            result[i].fakeID = f.encrypt(result[i].id);
            de = f.decrypt(result[i].fakeID);
            console.log("\n>>>>>fetch["+i+"]>>>\n"+result[i] +"\n");
            console.log("\n>>>>>["+i+"].fakeID>>>\n"+result[i].fakeID +"\n")
            console.log("\n>>>>>["+i+"].decrypt>>>\n"+de +"\n");
        }
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

// user data detail page after regesit
router.get('/users/:id', function (req, res) {
    //網址上的 :id = req.params.id
    var id = f.decrypt(req.params.id);
    userModel.findById(id, function (err, result) {
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
            // console.log("\n>>>findById>>>\n"+result);
            result.fakeID = f.encrypt(result.id);
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
        }
        res.render('admin/index', {
            title: '管理員',
            message: '',
            userlist: result,
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
            return res.render('admin/index', {
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
                //     return res.redirect('/admin/goods/' + result._id);
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
    id =f.decrypt(req.params.id);
    let query = {
        _id: id
    }; // point the item by _id
    goodModel.remove(query, function (err) {
        if (err) {
            console.log(err);
        }
        res.send('Success'); // 得到這個訊息HTTP 200，會做js動作
    });
});

// goods modify
router.get('/goods/update/:id', function (req, res) {
    var id = f.decrypt(req.params.id);
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
    var id = f.decrypt(req.params.id);
    goodModel.findById(id, function (err, result) {
        res.render('admin/index', {
            // result 是之前實例化的 Model
            productDetial: result
        });
    });
});

module.exports = router;