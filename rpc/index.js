/**
 * 项目地址
 */
const rpc  = require('node-bitcoin-rpc');
const rpcTest = require('../config/rpc')

rpc.init('192.168.18.131',18211,'wh03','gnZGUMoSuey3xP_j20ca7fZudX4wpDY7R8wLYd50XlA=');
// rpc.init('127.0.0.1',18213,'code','BwixPn-bU_lBRqBJEpoSyvJfHIRRgMVelcnhpTn5weM=');

//获取主地址
exports.getAddr = async function() {
    return new Promise((resolve,reject) => {
        rpc.call('getprimeaddr',[] ,function (err, addr) {

            if(err){
                console.error('获取主地址：'+err);
                reject (err);
                // console.log(err)

            }else {
                // address= '主地址为：'+addr.result
                console.log('主地址为：'+addr.result)
                resolve (addr.result);
                // console.log(addr.result.length)
            }
        })
    })
};
//获取新的二级地址
exports.getNewAddress = async function  (account) {
    rpc.call('getnewaddress',[account],function (err, info) {
        if(err){
            console.error('获取新的二级地址'+err);
            return err;
            // console.log(err)
        }else {
            // address= '主地址为：'+addr.result
            console.log('主要信息为：'+JSON.stringify(info.result))
            return JSON.stringify(info.result);
        }
    })
};
//根据地址获取账号
exports.getAccount = async function (btcAddress) {
    rpc.call('getaccount' ,[btcAddress],function (err, info) {
        if(err) {
            console.error('根据地址获取账号' + JSON.stringify(err));
            return err;
        }else {
            console.log('地址账号为：'+ info.result);
            return info.result;
        }
    })
} ;
//根据账号获取地址列表
exports.getAddressesByAccount = async function (account) {
    rpc.call('getaddressesbyaccount', [account],function (err, info) {
        if(err) {
            console.error('根据账号获取地址列表'+err)
        }else {
            console.log('地址列表为：' + info.result);
            return info.result;
        }
    })
};
//根据账号获取地址（生成二级地址时最好用这个）
exports.getaccountaddress = async function (account) {

    // console.log(account);
    return new Promise(function (resolve, reject) {
        rpc.call('getaccountaddress' ,[account],function (err, info) {

                if(err) {
                    console.error('根据账号获取地址'+JSON.stringify(err));
                    reject(err);
                }else {
                    console.log('地址为：' + info.result);
                    resolve(info.result) ;
                }
            })

    })
};
//产生签名
exports.signmessage   = async function (btcAddress,message) {
    return new Promise((resolve,reject) => {
        // console.log('原始签名信息'+message);
        // message = JSON.toString(message)

        rpc.call('signmessage', [btcAddress,message],function (err, info) {
            if(err) {
                console.error('产生签名'+JSON.stringify(err))
                reject(err)
            }else {
                // console.log('签名为：' + info.result);
                resolve (info.result);
            }
        })
    })

};
//所有二级地址账号
exports.listAccounts   = async function (btcAddress,message) {
    return new Promise((resolve,reject) => {
        rpc.call('listaccounts',[] ,function (err, info) {
            if(err) {
                console.error('二级地址账号列表'+err);
                reject(err);
            }else {
                // console.log('二级地址账号列表：' + info.result);
                resolve(info.result) ;
            }
        })
    })
};
exports.sendToAddress =  function (address) {
    return new Promise((resolve,reject) => {
        rpc.call('sendtoaddress',[address,'100001:1'],function (err, info) {
            if(err){
                console.error('sendError' + err)
                reject (err);
            }else {
                console.log('sendResult'+JSON.stringify(info));
                resolve(info)
            }
        })
    })
    // rpc.call('sendtoaddress', ['1KCSdLvZHQBLpyeDEqQyHWpqv1DkVf1C3g', '0:1'], function (err, res) { console.log(res)})

}




