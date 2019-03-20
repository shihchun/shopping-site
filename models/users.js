var mongoose = require('mongoose');
var userSchema = require('./schemas/user.js'); //引入'../schemas/xx.js'导出的模式模块

// 编译生成xxs模型
var users = mongoose.model('user', userSchema);

// 将xxs模型[构造函数]导出
module.exports = users;