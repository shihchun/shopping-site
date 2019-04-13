var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    account: String,
    fullname: String,
    firstname: String,
    lastname: String,
    email: String,
    DOB: Date,
    password: String,
    admin: Boolean,
    salt: String,
    
    // meta 更新或录入数据的时间记录
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        },
    }
});

// xxSchema.pre 表示每次存储数据之前都先调用这个方法
userSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }
    next();
});

// xxSchema 模式的静态方法 定義method使用的基本設定（也可以不設定）
userSchema.statics = {
    fetch: function (cb) {
        return this
            .find({})
            .sort('meta.updateAt')
            .exec(cb)
    },
    findById: function (id, cb) {
        return this
            .findOne({_id: id})
            .exec(cb)
    }
}

// 导出xxSchema模式
module.exports = userSchema;