var mongoose = require('mongoose');
var customerSchema = require('./schemas/customer.js'); //引入'../schemas/xx.js'导出的模式模块

// 编译生成xxs模型
var customers = mongoose.model('customer', customerSchema);

// 将xxs模型[构造函数]导出
module.exports = customers;