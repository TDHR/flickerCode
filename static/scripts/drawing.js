$('#asset').change(function () {


});

$('#drawingBtn').click(function () {
    let assetIndex = $('#asset').val();
    let tmp  = $(`#asset${assetIndex}`).text();
    let address = $('#address').val();
    let assetCount = tmp.split(':')[1];
    let assetName = tmp.split(':')[0];
    let userInputCount = $('#assetNumber').val();
    userInputCount = parseInt(userInputCount);
    let openid = $('#openid').text();
    let nickname = $('#nickname').text();
    if(!openid || !nickname){
        alert('用户信息错误，请重新登录');
        return false;
    }
    if(!assetName){
        alert('请选择资产');
        return false;
    }
    if(!userInputCount || userInputCount <= 0){
        alert('请填写要提取的金额');
        return false;
    }
    if(parseInt(assetCount) < parseInt(userInputCount)){
        alert('余额不足');
        return false;
    }
    if(!address){
        alert('请输入提取地址');
        return false;
    }
    $.ajax({
        url:'/login/drawing',
        type:'POST',
        data:{
            address:address,
            asset:assetName,
            number:userInputCount,
            openid:openid,
            nickname:nickname
        },
        beforeSend:function () {
            $('#drawingBtn').attr('disabled','true');
        },
        error:function (error) {
            console.log(JSON.stringify(error));
            alert('发送失败，请联系管理员')
        },
        success:function (res) {
            if(res.success){
                alert('提取成功！');
                console.log(res.result);
                // window.location.reload()
            }else {
                alert(res.message);
            }
        }
    })
});