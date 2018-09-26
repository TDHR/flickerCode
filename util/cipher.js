//加密函数
const crypto = require('crypto');
function myCipher(buf) {
    let encrypted = "";
    let cip = crypto.createCipher('rc4', 'test123456789456123456132456');//第一个参数为加密方式，第二个为密钥
    encrypted += cip.update(buf, 'utf-8', 'hex');
    encrypted += cip.final('hex');
    return encrypted;
}
module.exports = myCipher;