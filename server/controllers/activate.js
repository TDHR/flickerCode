const rpcMethod = require('../../rpc/index');


exports.index = async (ctx)=> {
    let params = ctx.request.body;
    // console.log(params);
    let address = params.address;
    // console.log(address);
    // let priAddress = await rpcMethod.getAddr();
    // console.log('address:'+priAddress)
    // let txID = await rpcMethod.sendToAddress(address);
    // console.log('toAddress' + address);
    let myAddress = await rpcMethod.getAddr();//获取项目地址
    //还应该再去验证传过来的产品地址是否属于当前项目地址，测试阶段省去这一步
    let txData = await rpcMethod.sendToAddress(address);
    // console.log(txID)
    ctx.body = {
        success:true,
        txData:txData,
        toAddress:address,
        fromAddress:myAddress
    }
}