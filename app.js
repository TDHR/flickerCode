const Koa = require('koa');
const request = require('superagent');
const view = require('koa-views');
const routers = require('./server/router/index');
const path = require('path');
// const bodyParser = require('koa-bodyparser');
const koaBody = require('koa-body');
const app = new Koa();
const ora = require('ora');
const favicon = require('koa-favicon');
const static = require('koa-static');
// const spinner = ora('Loading unicorns').start();
const myCipher = require('./util/cipher');
const myRandom = require('./util/myRandom');
const session = require('koa-session');
// setTimeout(() => {
//     spinner.color = 'red';
//     spinner.text = 'Loading rainbows';
// },3000);
//设置favicon
app.use(favicon(__dirname + '/static/image/favicon/favicon.ico'));
// app.use(bodyParser());
app.use(koaBody());
// app.use(function *(next) {
//    yield next;
//    if(parseInt(this.status) === 404){
//        this.body = '当前页面不存在'
//    }
// });
const sessionConfig = {
    key:'flickerCode',
    maxAge: 2*60*60*1000,
    httpOnly:true,
    signed:true,

};
app.keys = ['flicker','code','wh'];
app.use(session(sessionConfig,app));
app.use(view(path.join(__dirname,'./server/views'),{
    extension:'ejs'
}));
app.use(static(__dirname + '/static'));
app.use(routers.routes())
    .use(routers.allowedMethods());
app.listen('3011',()=> {
    // console.log(myCipher("{'adf':打发第三方}"));//加密
    // myRandom(100000,5).then(result=>{
    //     console.log(result)
    // })//随机数
    console.log('正在监听'+ 3011)
});