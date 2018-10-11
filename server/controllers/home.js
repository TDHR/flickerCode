const p = require('../../config/db');
// const bcrypt = require('bcrypt');
const xss = require('xss');
const rpcMethod = require('../../rpc/index');
const random = require('../../util/myRandom');

let isMatch;

// const co = require('co');
exports.index = async (ctx) => {
    const test = 'test';
    await ctx.render('home',{

    })
};
//二维码页面
exports.wechat = async (ctx) => {
    let result = await queryImg();
    await ctx.render('wechat',{
        result:result
    })
};
exports.cjdjh = async (ctx) => {

    await ctx.render('cjdjh',{

    })
};

async function queryImg() {
    return new Promise((resolve,reject) => {
        let querySql = `SELECT wechat_user.nickname AS nickname ,wechat_user.headimgurl AS url FROM  codetx LEFT JOIN wechat_user ON codetx.user= wechat_user.openid WHERE wechat_user.nickname IS NOT NULL AND LENGTH(wechat_user.headimgurl)>0  GROUP BY codetx.user ORDER BY codetx.id  DESC`

        p.query(querySql,function (err, result) {
            if(err) reject(err);
            else {
                resolve(result);
                // console.log(result)
            }
        })
    })
}

//获取二维码信息
exports.getCodeMessage = async function (ctx) {
    let codeMessage =  await getCodeMessageResult();
    ctx.body = {
        result:codeMessage
    }
};
//获取二维码信息的查询语句
async function getCodeMessageResult() {
    return new Promise((resolve,reject) => {
        let sql = `select * from code_message order by id desc limit 1`;
        p.query(sql,function (err, result) {
            if(err) reject(err);
            else {
                // console.log(result[0]);
                resolve(result[0])
            }
        })
    })
}

//2018-10-11 by zhaojia
//获取微信扫码人
exports.getWxperson = async function (ctx) {
    let result =  await getWxpersonResult(ctx.request.query.start,ctx.request.query.length);
    let result2 =  await getWxpersonResult2()
    ctx.body = {
        result:result,
        length:result2
    }
};
//获微信扫码人sql语句
async function getWxpersonResult(start,length) {
    return new Promise((resolve,reject) => {
        let sql = `SELECT wechat_user.nickname AS nickname ,
        wechat_user.headimgurl AS url 
        FROM  codetx LEFT JOIN wechat_user 
        ON codetx.user= wechat_user.openid
        WHERE wechat_user.nickname IS NOT NULL AND LENGTH(wechat_user.headimgurl)>0  
        GROUP BY codetx.user ORDER BY codetx.id  DESC 
        limit ${start} , ${length} `;

        p.query(sql,function (err, result) {
            if(err) reject(err);
            else {
                resolve(result);
            }
        })
    })
}
async function getWxpersonResult2() {
    return new Promise((resolve,reject) => {
        let sql = `SELECT wechat_user.nickname AS nickname ,
        wechat_user.headimgurl AS url 
        FROM  codetx LEFT JOIN wechat_user 
        ON codetx.user= wechat_user.openid
        WHERE wechat_user.nickname IS NOT NULL AND LENGTH(wechat_user.headimgurl)>0  
        GROUP BY codetx.user ORDER BY codetx.id  DESC `;

        p.query(sql,function (err, result2) {
            if(err) reject(err);
            else {
                resolve(result2.length);
            }
        })
    })
}
// exports.first = async (ctx, next) => {
//
//     const id = ctx.params.id;
//
//     await ctx.render('first',{
//         id:id
//     })
// };
// // async function encryption (name,_psd,next) {
// //     let SALT_WORK = 10;
// //     return new Promise((resolve,reject) => {
// //         bcrypt.genSalt(SALT_WORK,function (err, salt) {
// //             if(err) reject(err)
// //             else {
// //                 bcrypt.hash(_psd, salt,(err,hash) => {
// //                     if(err) reject(err);
// //                     else {
// //                         p.query("INSERT INTO my_table (name,psd) VALUES ('"+ name+"','"+hash+"')",function (error,results,fields) {
// //                             if(error) reject ({'status':false,'message':error}) ;
// //                             else resolve ({'status':true,'message':'插入成功'});
// //                         })
// //                     }
// //                 })
// //             }
// //         })
// //     })
// //
// // }
// async function isExist(name) {
//     return new Promise((resolve,reject) => {
//         p.query("SELECT 1 as isExist FROM my_table WHERE NAME='"+name+"'LIMIT 1",function (error,result) {
//             if(error) reject({'status':false,'message':error});
//             else resolve({'status':true,'message':'查询成功','result':result[0]})
//         })
//     })
// }
// // async  function compare(_psd, psd) {
// //     return new Promise((resolve,reject) => {
// //         bcrypt.compare(_psd, psd,function (err, isMatch) {
// //             if(!err) resolve(isMatch);
// //             else  reject(err);
// //         })
// //     })
// // }
// exports.second = async (ctx) => {
//     const  data =xss(ctx.request.body) ;
// console.log(xss(data.name))
//     let psd = await p.query("SELECT psd from my_table where name ='" + data.name + "'");
//     if(!psd || !psd.length) {
//         //如果查询结果为空
//         isMatch = {
//
//             success: true,
//             data: {
//                 status:true,
//                 match:false,
//                 message:'当前用户不存在'
//             }
//         }
//     }else {
//         let match = await  compare(data.psd,psd[0].psd);
//         isMatch = {
//             success:true,
//             data:{
//                 match:match,
//                 message:'登录成功'
//             }
//
//         }
//     }
//
//
//
//      ctx.body =isMatch
//
// };
//
// exports.third = async (ctx) => {
//     const data = ctx.request.body
//     let isReg;
//     let queryData = await isExist(data.name);
//     if(queryData.status && !queryData.result){
//         //不存在数据库中
//          let insertData = await encryption(data.name,data.psd);
//          if(insertData.status){
//              isReg = {
//                  success:true,
//                  data:{
//                      status:true,
//                      message:'注册成功'
//                  }
//              }
//          }
//     }else {
//         //存在
//         isReg = {
//             success:true,
//             data:{
//                 status:false,
//                 message:'用户当前已经存在'
//             }
//         }
//     }
//
//     ctx.body = isReg
// };
//
// //添加产品的接口
// exports.add = async function (ctx) {
//
//     const data = ctx.request.body;
//     let result = 'This is a result';
//     let name = data.name;
//     let accountList = await rpcMethod.listAccounts();
//
//     if(accountList[name] === undefined) {
//         //产品名没有使用，创建新的二级地址
//         let address  = await rpcMethod.getaccountaddress(data.name);
//         console.log('The new address is :' + address);
//         result = await createProductMessage(data.number,data.digst,address);
//         result = {
//             message:'New product creation success',
//             data:result
//         }
//     }else {
//
//         result =await createProductMessage(data.number,data.digst,'1BtvWKc9bdReVcP74WngsmuRiJrkjUiBNc');//测试专用
//
//         result = {
//             message:'This product name is existed',
//             data:result
//         };
//         // console.log(result)
//     }
//
//     ctx.body = result
// };
// //创建产品信息
// async function createProductMessage(total,digst,address) {
//     //生成随机数列表
//
//     let randomArray =await random(total,digst);
//     let productArray = await addMessageToArray(randomArray,address);
//     return productArray;
// }
// //处理随机数列表，生成产品信息以及签名信息
// async function addMessageToArray(array,address) {
//     let arrayLen = array.length;
//     let productMessageArray = [];
//     for(let i = 0;i<arrayLen;i++){
//         // let message = new Object();
//         let originMessage = `id:${array[i]}`;
//
//         let signMessage = await signProductMessage(originMessage,address);
//         // message["s"] = signMessage;
//         // message["o"] = originMessage;
//         // message['a'] = address;
//        let  message = `s=${signMessage}&o=${originMessage}&id=${array[i]}&a=${address}`;
//         productMessageArray.push(message);
//     }
//
//     return productMessageArray;
// }
// //地址签名
// async function signProductMessage(message,address) {
//     let signMessage = await rpcMethod.signmessage(address,message);
//     return signMessage;
// }
