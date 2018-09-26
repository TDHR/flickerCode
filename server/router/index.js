const router = require('koa-router')();
const home = require('./home');
// const message = require('./message');
// const activate = require('./activate');

router.use('/',home.routes(),home.allowedMethods());
// router.use('/message',message.routes(),message.allowedMethods());
// router.use('/activate',activate.routes(),activate.allowedMethods());


module.exports = router;