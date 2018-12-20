const router = require('koa-router')();
const home = require('./home');
const login = require('./login');
// const message = require('./message');
// const activate = require('./activate');

router.use('/',home.routes(),home.allowedMethods());
router.use('/login',login.routes(),login.allowedMethods());



module.exports = router;