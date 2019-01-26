const p = require('../../config/db');
const request = require('superagent');

exports.saveData = async function (ctx) {
    let url = ctx.url;
    console.log(url);
    if(url !== '/login/saveData?978481876'){
        return ctx.render('login/saveTest',{
            status:false,
            result:'滚'
        })
    }
    let userArray = await queryInuActivityUser();
    await ctx.render('login/saveTest',{
        status:true,
        user:userArray.result
    })
};
exports.saveDataMethod = async function (ctx) {
    let userArray = await queryInuActivityUser();
    let len = userArray.result.length;
    let data = userArray.result;
    let txId= 'c362cddfff6f4d7e32c5f5942adb7bf9d98d593330a82e196a74dc504096d91f';
    let now = '2019-01-25 14:00:05';
    let nowTimeStamp = 1548396005000;
    let values = insertValues(data,len,txId,now,nowTimeStamp,7);
    await saveDrawingMessage(values)
};
//查询已经参与活动的用户
const queryInuActivityUser = async function () {
    return new  Promise ((resolve,reject) => {
        let querySql = `SELECT openid,nickname,total,shareNumber FROM (
SELECT tmp.user AS USER,shareNumber,total FROM  (
SELECT USER,SUM(token_number) AS shareNumber FROM codetx WHERE productAddress = '188aVD1vQgitnu1nUjpdwPbk2jPdXwTQaS' AND LENGTH(singleProductID)>5 GROUP BY USER) tmp 
LEFT JOIN (
SELECT SUM(token_number) total  ,USER FROM codetx WHERE productAddress='188aVD1vQgitnu1nUjpdwPbk2jPdXwTQaS' AND singleProductID=7 group by user) msg 
ON tmp.user=msg.user ) ms LEFT JOIN wechat_user wu ON ms.user=wu.openid WHERE ms.total<(30000*shareNumber) OR ms.total IS NULL`;
        p.query(querySql,function (error, result) {
            if(error){
                reject ({
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

//拼接要插入的数据
function insertValues(data,len,txid,now,nowStamp,singleProductID) {

    let values = '';
    for(let i=0;i<len;i++){
        let userNumber = 150*data[i].shareNumber;
        values += `('${data[i].openid}','154VotBoXFPMci8u1pcEzyMwSW8Zk4jBak','188aVD1vQgitnu1nUjpdwPbk2jPdXwTQaS',${singleProductID},'${txid}','${now}','${data[i].nickname}',${nowStamp},${userNumber})`+','
    }
    values = values.substring(0,values.length-1);
    return values;
}



//提取完成之后将信息保存下来
const saveDrawingMessage = async function (values) {
    let insertSql = `insert into codetx (user,product,productAddress,singleProductID,toPlantTxID,verifiyDate,nickname,timeStamp,token_number) values ${values}`;
    p.query(insertSql,function (error, result) {
        if(error){
            console.log(JSON.stringify(error));
        }else {
            console.log(JSON.stringify(result));
        }
    })
};