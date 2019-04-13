/**
 * exports.[function name] = [function name]  require之後直接使用檔案內的函式，檔案內無法調用
 * moudle.exports= [function name]  need instantiation require之後要實例化才可以使用
 */
const fs = require('fs');
var crypto = require('crypto'); // 加密法庫

var base64Img = require('base64-img'); //圖片格式轉換成 base64 blob
// var data = base64Img.base64Sync('models/1.jpg');

/**
 * generate new uuid
 * @returns uuid (8-4-4-4-12)
 */
function makeUuid(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
}

/**
 * Generate md5 using crypto
 * @param {*} str 
 * @returns {string}
 */
exports.md5 = function md5(str){
	return crypto.createHash('md5').update(str).digest('hex');
}


/**
 * random value with set
 * @param {*} min min number
 * @param {*} max max number
 * @returns {string} random num
 */
function rand(min, max) {
    return Math.random()*(max-min+1) + min | 0;
}

/**
 * make random salt with set length
 * @param {number} len salt length
 * @returns {string} random salt
 */
exports.makeSalt = function makeSalt(len) {
    var str = 'qwertyuiop[]asdfghjkl;zxcvbnm,./';
    var salt = '';
    for(var i=0; i<len; i++){
        salt += str.charAt(rand(0, str.length));
    }
    return salt;
}

/**
 * get user info from html
 * @param {string} pageBodys req.body
 * @returns  {string} usersObj is json format
 */
exports.User = function User(pageBodys) { // when post new product
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
exports.Product = function Product(files, pageBodys) { // when post new product
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

/**
 * generate secret 128 strings and cookie ID with uuid (8-4-4-4-12)
 * @returns {{secret: string, ID: string}} secret, ID
 */
exports.makeSecret = function makeSecret() {
    var secret = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrswxyz1234567890-=`~!@#$%^&*()_+}{;:/?><.,";
    for (var i = 0; i < 127; i++)
        secret += possible.charAt(Math.floor(Math.random() * possible.length));
    console.log("\n>>>>>>> New session with: \nsecret (128 strings): \n" + secret); // generate secret 128 strings
    var uuid = makeUuid();
    console.log("cookid id uuid (8-4-4-4-12): \n" + uuid );
    return {secret, uuid};
}

/**
 * 再想如何使用express 的 append *.tar 或是用這個可以用的範例
 * append the images to one ArrayBuffer(one buffer)
 * @param {string} img[] path array
 */
exports.appendImg = function appendImg(img){
    // const pics = ["1.jpg", "2.jpg","3.jpg","4.jpg","5.jpg","6.jpg","7.jpg"]; // input
    // 初始化 arraybuffer
    let buffers = new ArrayBuffer(0);
    let s = 0, n = 0;
    for(let i = 0; i < pics.length; i++){
        n += i;
    }
    for(let i = 0; i < pics.length; i++){
        let pic = pics[i],
            l = pic.length;
        fs.readFile(pic, function(err,data){
            if(err) throw err;
            let m = 0,
                v = data,
                q = data.length;
            let a = new ArrayBuffer(l*4+4+4+q),
                d = new DataView(a);
            d.setUint32(0,l,!1);
            m += 4;
            for(let j = 0; j < l; j++){
                let c = pic.charCodeAt(j);
                d.setUint32(m,c,!1);
                m += 4;
            }
            d.setUint32(m,q,!1);
            m += 4;
            for(let k = 0; k < q; k++){
                d.setUint8(m,v[k],!1);
                m += 1;
            }
            buffers = _appendBuffer(buffers,a);
            s += i;
            // 判断当前是否读完
            if(s == n){
                let imgv = new Uint8Array(buffers);
                // fs.writeFile('out.png', imgv, (err) => {
                //     if (err) throw err;
                //     console.log('It\'s saved!');
                // });
            } else{ console.log("Failed to append files to ArrayBuffer");}
            return imgv;
        });
    }

    // arraybuffer
    var _appendBuffer = function(buffer1, buffer2) {
        var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(new Uint8Array(buffer1), 0);
        tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
        return tmp.buffer;
    };
}



exports.MD5 = function() {

}

