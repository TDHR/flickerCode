const mysql = require('mysql');
const wrapper = require('co-mysql');
const pool = mysql.createPool({
    host:'localhost',
    port:'3306',
    user:'root',
    password:'978481',
    database:'koa2',
})
const SqlP = wrapper(pool);

module.exports = SqlP;