const router = require('koa-router')();
const message = require('../controllers/message');

router.get('/message',message.index);

module.exports = router;