const RpcClient = require('node-bitcoin-rpc');
const RpcConfig01 = {
    protocol:'http',
    user:'wh03',
    pass:'gnZGUMoSuey3xP_j20ca7fZudX4wpDY7R8wLYd50XlA=',
    host:'192.168.18.131',
    port:'18211'
};
const RpcConfig02 = {
    protocol:'http',
    user:'wuqi0113',
    pass:'diKjwPK51IFEpXB-nplEYngf0QNAMjPuVkoY4Xr6-5o=',
    host:'192.168.1.168',
    port:'18211'
};

const rpc = RpcClient.init(RpcConfig01);

module.exports = rpc;