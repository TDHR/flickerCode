const p = require('../../config/db');
const request = require('superagent');
const random = require('number-random');
const xss = require('xss');
const router = require('koa-router')();

//登录页面显示
exports.index = async (ctx) => {
    // console.log(111)
    await ctx.render('login/login',{

    })
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

//提取的页面
exports.drawing = async function (ctx) {
  let user = ctx.session.user;

  if(!user){
     await ctx.render('login/drawing',{
          status:false,
          loginMessage:'当前用户未登录，点击登录'
      })
  }else {
     let openid = await  queryOpenid(user);//查询openid
      let result = await  queryUserAsset(openid.result.openid);//根据openid查询用户资产
      // console.log(result.result)
     await ctx.render('login/drawing',{
          status:true,
          loginMessage:'登录成功',
          user:user,
         asset:result.result
      })
  }
};
// 查询openid
const queryOpenid = async function (user) {
  let querySql = `select openid from wechat_user where phone = ${user}`;
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
    let address = ctx.body.address;
    let asset = ctx.body.asset;
    let number = ctx.body.number;
    let result = await sendDrawingRequest(address,asset,number);
    if(result.status){
        ctx.body = {
            success:true,
            result:result.message.txId
        }
    }else {
        ctx.body = {
            success:false,
            result:result.message
        }
    }

};
//发送提取请求
const sendDrawingRequest = async function (address,asset,number) {
    return new Promise((resolver,reject)=> {
        superagent
            .post('123.206.85.98:3009/transfer/drawing')
            .set('Accept', 'application/json')
            .send({
                address:address,
                asset:asset,
                number:number
            })
            .end(function (error, result) {
                if(error){
                    resolve({
                        status:false,
                        message:'提取失败，请稍后再试'
                    })
                }else {
                    if(result.success){
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