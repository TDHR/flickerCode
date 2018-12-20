const router = require('koa-router')();
const login = require('../controllers/login');

router.get('/login',login.index);
router.post('/login',login.login);
router.post('/getPhoneCode',login.getPhoneCode);//获取手机验证码
router.get('/drawing',login.drawing);//提取页面

module.exports = router;