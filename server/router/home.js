const router = require('koa-router')();
const home = require('../controllers/home');

// module.exports = function () {
//     router .get('/',home.index);
//     router .get('/home/first/:id?',home.first);
//     router .post('/second',home.second);
// };
router .get('/',home.index);
router .get('home/wxss',home.wechat);
router .get ('home/cjdjh',home.cjdjh);
//跳转到添加产品的页面
// router .get('home/add',home.first);
// // router .post('home/second',home.second);
// // router .post('home/third',home.third);
// //添加产品的接口
// router .post('home/add',home.add);

module.exports = router;