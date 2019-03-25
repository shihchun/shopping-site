var mongoose = require('mongoose');

var goodSchema = new mongoose.Schema({
    name: String,
    quentity: Number,
    price: Number,
    des: String,
    draft: String,
    img_count: Number,
    img: Array,
    
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
goodSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }
    next();
});

// xxSchema 模式的静态方法
goodSchema.statics = {
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
module.exports = goodSchema;