const mysql = require('mysql');
const wrapper = require('co-mysql');
// const pool = mysql.createPool({
//     host:'localhost',
//     port:'3306',
//     user:'root',
//     password:'978481',
//     database:'flickercodetest',
//     charset:'utf8mb4',
//     useConnectionPooling: true
// })
const pool = mysql.createPool({
    host:'59.110.171.208',
    user:'root',
    password:'nrc1qaz@WSX',
    database:'reits_data',
    port:3306,
    charset:'utf8mb4',
    useConnectionPooling: true
})
const SqlP = wrapper(pool);

module.exports = SqlP;