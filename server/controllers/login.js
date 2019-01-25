const p = require('../../config/db');
const request = require('superagent');
const random = require('number-random');
const xss = require('xss');
const router = require('koa-router')();

//登录页面显示
exports.index = async (ctx) => {
    // console.log(111)
    let loginInfo = ctx.session.user;
    if(loginInfo){
        ctx.redirect('/login/drawing');
    }else {
        await ctx.render('login/login',{

        })
    }

};
//四位随机手机号验证码
const createPhoneCode = async function () {
    let phoneCode = random(1000,9999);
    return phoneCode;
};
//获取手机验证码
exports.getPhoneCode = async (ctx) => {

  let params = ctx.request.body;
  let phone = params.phone;
  let phoneMessage = await chectPhoneExist(phone);
  if(phoneMessage.status&&phoneMessage.result){
      let phoneCode = await createPhoneCode();
        let flag = await sendPhoneCode(phone,phoneCode,ctx);


      if(flag === 1){
          ctx.body = {
                  success:true,
                  message:'发送成功！'
          }
      }else if(flag === 2){
          ctx.body = {
              status:false,
              message:'发送失败，请稍后再试'
          }
      }else {
          ctx.body = {
              status:false,
              message:'发送失败'
          }
      }


  }else {
      ctx.body ={
          success:false,
          message:'当前手机号未在系统登记，请到闪码公众号中登记'
      }
  }


};
//发送获取验证码的请求
const sendPhoneCode = async function (phone,phoneCode,ctx) {
    return new Promise((resovle,reject) => {
        request
            .post('https://sms.yunpian.com/v2/sms/single_send.json')
            .set('Accept','application/json;charset=utf-8')
            .set('Content-Type','application/x-www-form-urlencoded;charset=utf-8')
            .send({
                "apikey":"e50da878f115a22f9031df0b0ffe9214",
                "mobile":phone,
                "text":`【闪码平台服务】您的验证码是${phoneCode}`
            })
            .end(function (err,result) {

                if(err){
                    console.log(JSON.stringify(err));

                    resovle(2)

                }else {

                    ctx.session[phone] = phoneCode;
                    resovle(1)

                }

            })
    })

};
//查询当前手机号是否已经存在用户表中，如果存在则发送验证码
const chectPhoneExist = async (phone) => {
    let querySql = `select * from wechat_user where phone = '${phone}'`;
    return new Promise((resolve,reject) => {
        p.query(querySql,function (error, result) {
            if(error){
                console.log(JSON.stringify(error));
                reject({
                    status:false,
                    message:JSON.stringify(error)
                })
            }else {
                resolve({
                    status:true,
                    result:result[0]
                })
            }
        })
    })
};
//登录方法
exports.login = async (ctx) => {
    let params = ctx.request.body;
    let phone = params.phone;
    let phoneCode =parseInt(params.phoneCode);

    if(!phoneCode){
        ctx.body = {
            success:false,
            message:'请输入手机验证码'
        }
    }
    let phoneCodeSave = ctx.session[phone];
    // console.log(typeof phoneCode);
    // console.log(typeof phoneCodeSave)
    if(phoneCodeSave !== phoneCode){
        ctx.body = {
            success:false,
            message:'验证码不正确，请核对后再提交'
        }
    }else {
        ctx.session.user = phone;
        ctx.body = {
            success:true,

        };

    }

};
//提取的测试页面
exports.drawingTest = async function (ctx) {
    let user = ctx.session.user;

    if(!user){
       await ctx.render('login/drawingTest',{
            status:false,
            loginMessage:'当前用户未登录，请返回登录'
        })
    }else {
       let userMessage = await  queryOpenid(user);//查询openid
        let result = await  queryUserAsset(userMessage.result.openid);//根据openid查询用户资产
        // console.log(result.result)
       await ctx.render('login/drawingTest',{
            status:true,
            loginMessage:'登录成功',
            user:user,
            asset:result.result,
           userMessage:userMessage.result
        })
    }
};


//提取的页面
exports.drawing = async function (ctx) {

    //页面维护
    // await ctx.render('login/developing',{
    //
    // });


  let user = ctx.session.user;

  if(!user){
     await ctx.render('login/drawing',{
          status:false,
          loginMessage:'登录已过期，点击登录'
      })
  }else {
     let userMessage = await  queryOpenid(user);//查询openid
      let result = await  queryUserAsset(userMessage.result.openid);//根据openid查询用户资产
      //查询当日可提取个数
        let surplus = await queryAvailable(userMessage.result.openid);
      // console.log(result.result)
     await ctx.render('login/drawing',{
          status:true,
          loginMessage:'登录成功',
          user:user,
          asset:result.result,
         userMessage:userMessage.result,
         surplus:surplus
      })
  }
};
// 查询openid
const queryOpenid = async function (user) {
  let querySql = `select openid,nickname,headimgurl from wechat_user where phone = ${user}`;
  return new Promise((resolve,reject) => {
      p.query(querySql,function (error, result) {
          if(error){
              console.log(JSON.stringify(error));
              reject({
                  status:false,
                  message:JSON.stringify(error)
              })
          }else {
              resolve({
                  status:true,
                  result:result[0]
              })
          }
      })
  })
};
//查询当前用户当日还可提取的INU个数
const queryAvailable = async function (openid) {
    let addressQuota = '188aVD1vQgitnu1nUjpdwPbk2jPdXwTQaS';
    let userQuota = await queryUserQuota(addressQuota,openid);
    let quotaCount = userQuota.result.countNumber * 150;
    //获取当前用户今日的提币数量
    let todayCountMessage = await vertifyCount(openid);
    let todayCount;
    if(!todayCountMessage.result.todayCount){
        todayCount = 0;
    }else {
        todayCount = Math.abs(todayCountMessage.result.todayCount);
    }
    let surplus = quotaCount - todayCount;
    return new Promise((resolve,reject) => {
        resolve(surplus);
    })
};
//查询当前用户的资产
const queryUserAsset = async function (openid) {
    let querySql = `SELECT SUM(addresscount) AS COUNT ,NAME FROM (
        SELECT addresscount, NAME FROM (
        SELECT * FROM (
        SELECT SUM(temp.count) AS addresscount,temp.productAddress FROM (
        SELECT (SUM(1))*token_number AS COUNT ,productAddress,token_number FROM codetx WHERE USER = '${openid}' GROUP BY productAddress,token_number) AS temp
        GROUP BY temp.productAddress
      ) AS address 
      LEFT JOIN code_product ON address.productAddress=code_product.proAddress
    ) AS asset LEFT JOIN t_asset AS ta ON asset.assetId=ta.id ) AS assetcount GROUP BY NAME`;
    return new Promise((resolve,reject) => {
        p.query(querySql,function (error,result) {
            if(error){
                console.log(JSON.stringify(error));
                reject({
                    status:false,
                    message:JSON.stringify(error)
                })
            }else {
                resolve({
                    status:true,
                    result:result
                })
            }
        })
    })

};
//提取方法
exports.drawingAsset = async function (ctx) {
    let address = xss(ctx.request.body.address);
    let asset =xss(ctx.request.body.asset) ;
    let number = xss(ctx.request.body.number);
    let openid = xss(ctx.request.body.openid);
    let nickname = xss(ctx.request.body.nickname);

    //验证地址的正确性
    let addressIsTrue = await vertifyAddress(address);
    if(!addressIsTrue.status){
        return ctx.body = {
            status:false,
            result:addressIsTrue.result
        }
    }


    let loginInfo = ctx.session.user;
    if(!loginInfo){
        return ctx.body = {
            status:false,
            result:'登录时间已过期，请重新登录'
        }
    }
    let userMessage = await  queryOpenid(loginInfo);//查询openid
    let userOpenId = userMessage.result.openid;//
    if(userOpenId !== openid){

        frozenAccount(openid);
        frozenAccount(userOpenId);

        return ctx.body = {
            status:false,
            result:'当前操作异常，已禁封您的账号'
        }
    }
    if(asset!=='INU'){
        return ctx.body = {
            status:false,
            result:'当前仅支持INU提取'
        }
    }
    //提取时间限制
    let allowDrawingTime = await queryLastDrawingTime(openid);
    if(allowDrawingTime === 0) {
         return ctx.body = {
            success:false,
            result:'五分钟内仅允许提取一次'
        }
    }
    //查询账号状态
    let accountStatus = await queryAccountStatus(openid);
    if(accountStatus === 1) {
        return ctx.body = {
            success:false,
            result:'当前账号状态异常，请联系管理员'
        }
    }
    //提取数量限制
    let addressQuota = '188aVD1vQgitnu1nUjpdwPbk2jPdXwTQaS';
    let userQuota = await queryUserQuota(addressQuota,openid);
    let quotaCount = userQuota.result.countNumber * 150;
    //获取当前用户今日的提币数量
    let todayCountMessage = await vertifyCount(openid);
    let todayCount;
    if(!todayCountMessage.result.todayCount){
        todayCount = 0;
    }else {
        todayCount = Math.abs(todayCountMessage.result.todayCount);
    }
    todayCount = parseInt(todayCount);
    number = parseInt(number);
    if(todayCount+number > quotaCount){
        return ctx.body = {
            success:false,
            result:'当前提取数量超出限制'
        }
    }
    //

    let result = await sendDrawingRequest(address,asset,number,openid,nickname);
    if(result.status){
        return ctx.body = {
            success:true,
            result:result.message.txId
        }
    }else {
        return ctx.body = {
            success:false,
            result:result.message
        }
    }

};
//验证地址正确性
const vertifyAddress = async function (address) {
    return new Promise((resolve,reject) => {
        request
            .get('http://59.110.171.208:20080/nrc_center/fapi/FNrcChain/verifyAddress')
            .set('Accept', 'application/json')
            .set('Content-type','application/json')
            .query({
                address:address
            })
            .end(function (error, result) {
                if(error){
                    JSON.stringify(error)
                    reject({
                        status:false,
                        message:JSON.stringify(error)
                    })
                }else {
                    let resultMessage = result.text;
                    resultMessage = JSON.parse(resultMessage);
                    resolve({
                        status:resultMessage.success,
                        result:resultMessage.message
                    })
                }
            })
    })
}
//发送提取请求
const sendDrawingRequest = async function (address,asset,number,openid,nickname) {

    return new Promise((resolve,reject)=> {
        request
            .post('127.0.0.1:3009/transfer/drawing')
            .timeout({
                response: 5500,  // Wait 5 seconds for the server to start sending,
                deadline: 60000, // but allow 1 minute for the file to finish loading.
            })
            .set('Accept', 'application/json')
            .set('Content-type','application/json')

            .send({
                address:address,
                asset:asset,
                number:number,
                openid:openid,
                nickname:nickname
            })
            .end(function (error, result) {
                if(error){
                    saveDrawingErrorMessage(openid, nickname,asset, number,error.status,address);
                    console.log(JSON.stringify(error));


                    let errorTime = new Date().getTime();
                    setTimeout(function () {
                        chargeFrozenAccount(openid,address,errorTime)
                    },20000);


                    resolve({
                        status:false,
                        message:'提取失败，请稍后再试'
                    })
                }else {

                    if(result.body.success){
                        saveDrawingResultMessage(openid, nickname, address, asset, number);




                        resolve({
                            status:true,
                            message:result
                        })
                    }else {
                        resolve({
                            status:false,
                            message:'提取失败'
                        })
                    }

                }
            })
    } )
};


//提取的错误信息保存
const saveDrawingErrorMessage = async function (openid, nickname,asset, token_number,errorStatus,address) {
    let date =  new Date();
    let now = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    let nowStamp = new Date(now).getTime();

    let value = `('${openid}','${nickname}','${asset}',${token_number},'${now}',${nowStamp},'${errorStatus}','${address}')`;
    let saveSql = `insert into code_drawing_error (openid,nickname,asset,token_number,dateTime,dateTimeStamp,error_status,address) values ${value}`;
    return new Promise((resolve,reject) => {
        p.query(saveSql,function(error,result){
            if(error){
                console.log(JSON.stringify(error));
                reject({
                    status:false,
                    message:JSON.stringify(error)
                })
            }else {
                resolve({
                    status:true,
                    result:result
                })
            }
        })
    })
};
//提取的结果信息保存
const saveDrawingResultMessage = async function (openid, nickname, address, asset, number) {
    let date =  new Date();
    let now = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    let nowStamp = new Date(now).getTime();

    let value = `('${openid}','${nickname}','${address}','${asset}',${number},'${now}',${nowStamp})`;
    let saveSql = `insert into code_drawing_result (openid,nickname,address,asset,number,dateTime,dateTimeStamp) values ${value}`;

    return new Promise((resolve,reject) => {
        p.query(saveSql,function (error, result) {
            if(error) {
                console.log(JSON.stringify(error));
                reject({
                    status:false,
                    message:JSON.stringify(error)
                })
            }else {
                resolve({
                    status:true,
                    result:result
                })
            }
        })
    })
};
//查询账号状态
const queryAccountStatus = async function (openid) {
  let querySql = `select status from wechat_user where openid = '${openid}'` ;
  return new Promise((resolve,reject) => {
      p.query(querySql,function (error, result) {
          if(error){
              console.log(JSON.stringify(error));
              reject({
                  status:false,
                  message:JSON.stringify(error)
              })
          }else {
              let status = result[0].status;
              resolve(status);
          }
      })
  })
};
//查询最后一次提取的时间（五分钟之内仅允许一次提币）
const queryLastDrawingTime = async function (openid) {
  let querySql = `select * from codetx where user = '${openid}' and singleProductID = -1 order by timeStamp desc limit 1`;
  return new Promise((resolve,reject) => {
      p.query(querySql,function (error, result) {
        if(error){
            console.log(JSON.stringify(error));
            reject({
                status:false,
                message:JSON.stringify(error)
            })
        }else {
            let nowTimeStamp = new Date().getTime();
            let allowTime = 5*60*1000;
            let allowBeginTime = nowTimeStamp - allowTime;
            if(result[0]){
                if(result[0].timeStamp < allowBeginTime){
                    //如果最后一次提取时间小于允许开始的时间，则允许提币
                    resolve(1);
                }else {
                    resolve(0);
                }
            }else {
                resolve(1);
            }

        }
      })
  })

};
//产生错误后判断是否需要冻结账号的提币
const chargeFrozenAccount = async function (openid,address,errorTime) {
    return new Promise((resolve,reject) => {
        request
            .get('http://59.110.171.208:20080/nrc_comm/papi/pbrower/getaddresstxs')
            .set('Accept','application/json')
            .query({
                address:address,
                pageIndex:0,
                pageSize:1
            })
            .end(function (error, result) {
                if(error){
                    reject({
                        status:false,
                        message:JSON.stringify(error)
                    })
                }else {
                    let txResult = result.body.data.list;
                    if(txResult){
                        let time = txResult[0].time;
                        let timeStamp = new Date(time);
                        let difTime = timeStamp-errorTime;
                        let difAllotTime = 2*60*1000;
                        if(difTime<difAllotTime && difTime >0){
                            //冻结账号
                            frozenAccount(openid)

                        }else {

                        }
                    }else {
                        resolve(1)
                    }
                }
            })
    })

};
//产生错误之后冻结账号
const frozenAccount = async function (openid) {
  let querySlq = `update wechat_user set status = 1 where openid = '${openid}'`;
  return new Promise((resolve,reject) => {
      p.query(querySlq,function (error, result) {
          if(error){
              console.log(JSON.stringify(error));
              reject({
                  status:false,
                  message:JSON.stringify(error)
              })
          }else {
              resolve({
                  status:true,
                  message:result
              })
          }
      })
  })
};
//查询当前用户的提取限额
const queryUserQuota = async function (address,openid) {
    let querySql = `select count(token_number) as countNumber from codetx where user = '${openid}' 
and productAddress = '${address}' and LENGTH(singleProductID) >5`;
    return new Promise((resolve,reject) => {
        p.query(querySql,function (error, result) {
            if(error){
                console.log(JSON.stringify(error));
                reject({
                    status:false,
                    message:JSON.stringify(error)
                })
            }else {
                resolve({
                    status:true,
                    result:result[0]
                })
            }
        })
    })

};
//验证提取金额
const vertifyCount = async function (openid) {
    let date = new Date();
    let  todayStart = new Date(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} 00:00:00`).getTime();
    let  todayEnd = new Date(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} 23:59:59`).getTime();
    let querySql = `select sum(token_number) as todayCount 
    from codetx where singleProductID = -1 and user ='${openid}' and TIMESTAMP BETWEEN ${todayStart} and ${todayEnd}`;
    return new Promise((resolve,reject) => {
        p.query(querySql,function (error, result) {
            if(error){
                console.log(JSON.stringify(error));
                reject({
                    status:false,
                    message:JSON.stringify(error)
                })
            }else {
                resolve({
                    status:true,
                    result:result[0]
                })
            }
        })
    })

};