// upload file by using multer
//---------------------------------
const path = require('path');
const multer = require('multer'); // add multipart/form-data at form

// upload part
const storage = multer.diskStorage({ // diskStorage() 式中用{ settings } 加入物件設定
    destination: './public/uploads/', // 暫時
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// init upload as and point the storage -> diskStorage()
const upload = multer({ // 確認是有權限的人使用
    storage: storage
}); // 使用 .any 或是 .single 之後無法調用，調用後定義

// const uploadSingle = multer({
//     storage: storage
// }).single('pageImage'); // add your case input name, can only add single file

// const upload = multer({ // 確認是有權限的人使用
//     storage: storage
// }).any('pageImage');

//---------------------------------
module.exports = upload;