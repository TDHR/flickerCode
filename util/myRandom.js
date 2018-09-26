/**
 *
 * @param total 数量（一共要生成多少个随机数）
 * @param digit 位数（Example：生成4位的随机数）
 */

async function myRandom(total, digit) {

    digit = digit?digit:5;//默认生成五位随机数
    total = total?total:1;//默认生成一个单品
    let range = await randomRange(parseInt(digit));
    let max = range.max-1;
    let omin = range.min;
    let min = range.min;
    if(total > max-min){
        return '输入数量大于总数'
    }
    let randomArray =await createAllRandom(max,omin,min);
    let result = await sortArray(randomArray,total);

    return result
}
async  function randomRange(disgit) {
        disgit -= 1;
        let min = '1';
        let max = '10';
        for (let i = 0;i < disgit;i++){
            min += '0';
            max += '0';
        }
        let oldRange = {
            max:parseInt(max),
            min:parseInt(min)
        }
        return oldRange;


}
async function createAllRandom(max, omin,min) {
        let randomArray = [];
        for(let i = 0;i<max -omin;i++){
            randomArray[i] = min;
            min ++;
        }
        return randomArray;

}
async function sortArray(array,total) {
        let randomResult = [];
        array.sort(function () {
            return 0.5 - Math.random();
        });
        for(let i = 0; i<total;i++){
            randomResult.push(array[i]);
        }
        return randomResult
}

module.exports = myRandom;