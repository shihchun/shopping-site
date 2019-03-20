var mongoose = require('mongoose');
var goodSchema = require('./schemas/goods.js'); //引入'../schemas/xx.js'导出的模式模块

// 编译生成xxs模型
var goods = mongoose.model('good', goodSchema);

// 将xxs模型[构造函数]导出
module.exports = goods;