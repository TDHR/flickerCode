const router = require('koa-router')();
const login = require('../controllers/login');
const save = require('../controllers/saveData');

router.get('/login',login.index);
router.post('/login',login.login);
router.post('/getPhoneCode',login.getPhoneCode);//获取手机验证码
router.get('/drawingTest',login.drawingTest);


// router.get('/drawing',login.drawingTest);//提取页面
router.get('/drawing',login.drawing);//提取页面



router.post('/drawing',login.drawingAsset);//提取方法

router.get('/saveData',save.saveData);
router.post('/saveData',save.saveDataMethod);

module.exports = router;