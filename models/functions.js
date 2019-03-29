/**
 * exports.[function name] = [function name]  直接使用
 * moudle.exports= [function name]  need instantiation 要實例化才可以使用
 */
const fs = require('fs');
var base64Img = require('base64-img'); //圖片格式轉換

/**
 * get user info from html
 * @param {string} pageBodys req.body
 * @returns  {string} usersObj is json format
 */
exports.User = function (pageBodys) { // when post new product
    usersObj = {
        "account": pageBodys.account,
        "fullname": pageBodys.lastname + pageBodys.firstname,
        "firstname": pageBodys.firstname,
        "lastname": pageBodys.lastname,
        "email": pageBodys.email,
        "DOB": pageBodys.DOB, //dateofbirth.toISOString(), or use moment.js
        "password": pageBodys.password,
    };
    if(pageBodys._id){usersObj._id = pageBodys._id;}
    console.log(">>>>>>>>> user info" + JSON.stringify(usersObj, null, 4));
    return usersObj;
}

/**
 * get product info and slice img path to "\\uploads\\product-1553682446493.jpg"
 * @param {string} files req.files
 * @param {string} pageBodys req.body
 * @returns {string} goodsObj is json format
 */
exports.Product = function (files, pageBodys) { // when post new product
    var img = []; // 不用 = new Array(); 效率問題
    for (let i = 0; i < files.length; ++i) { // 檔案上傳個數
        console.log("上傳的第" + (i + 1) + "個路徑到: " + files[i].path.slice(6));
        img[i] = files[i].path.slice(6);
    }
    // var data = base64Img.base64Sync(files[0].path);
    
    goodsObj = {
        name: pageBodys.goods.name,
        quentity: pageBodys.goods.quentity,
        des: pageBodys.goods.des,
        price: pageBodys.goods.price,
        draft: pageBodys.goods.draft,
        img_count: files.length,
        img: img,
    };
    // var data = fs.readFileSync('models/1.jpg');
    // console.log("data read >>>>>>");
    // console.log(data);
    // goodsObj.base64.data = data;
    // goodsObj.base64.type = 'image/png';
    if(pageBodys._id){goodsObj._id = pageBodys._id;}
    console.log("files count: " + files.length);
    console.log(">>>>>>>>> new product" + JSON.stringify(goodsObj, null, 4));
    return goodsObj;
}

function makeUuid(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
  }

/**
 * generate secret 128 strings and cookie ID with uuid (8-4-4-4-12)
 * @returns {{secret: string, ID: string}} secret, ID
 */
exports.makeSecret = function() {
    var secret = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrswxyz1234567890-=`~!@#$%^&*()_+}{;:/?><.,";
    for (var i = 0; i < 127; i++)
        secret += possible.charAt(Math.floor(Math.random() * possible.length));
    console.log("\n>>>>>>> New session with: \nsecret (128 strings): \n" + secret); // generate secret 128 strings
    var uuid = makeUuid();
    console.log("cookid id uuid (8-4-4-4-12): \n" + uuid );
    return {secret, uuid};
}

exports.MD5 = function() {

}

