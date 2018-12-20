$('#getPhoneCode').click(function () {
    var phoneNumber = $('#user').val();
    var isPhone = isPhoneNum(phoneNumber);
    if(!isPhone){
        alert('请输入正确的手机号');
        return false;
    }
    $.ajax({
        type:'post',
        url:'/login/getPhoneCode',
        data:{
            phone:phoneNumber
        },
        beforeSend:function () {

            $('#getPhoneCode').attr('disabled','true');
            djs();
        },
        error:function (err) {
            alert('发送失败')
        },
        success:function (res) {
            if(res.success){
                alert(res.message)
            }else {
                alert(res.message)
            }
        }
    })
});

//倒计时方法
var wait=60;
var exit=false;
function djs() {
    if (wait <= 0 || exit) {

        $('#getPhoneCode').removeAttr('disabled');
        $('#getPhoneCode').html("获取");
        wait = 60;
    } else {
        // $('#getCode').removeAttr("onclick");
        $('#getPhoneCode').html("剩余" + wait + "秒");
        wait--;
        setTimeout(function() {
            djs();
        },1000);
    }
}
//校验手机号是否合法
function isPhoneNum(phoneNumber) {

    var phonenum = phoneNumber
    var myreg = /^1[34578]\d{9}$/;
    if (!myreg.test(phonenum)) {
//            alert('请输入有效的手机号码！');
        $("#phoneNumber").focus();
        return false;
    } else {
        return true;
    }
}
//登录
$('#signinBtn').click(function () {
    var phoneNumber = $('#user').val();
    var phoneCode = $('#imgCode').val();
    var isPhone = isPhoneNum(phoneNumber);
    if(!isPhone){
        alert('请输入正确的手机号');
        return false;
    }
    if(!phoneCode){
        alert('请输入手机验证码')
    }
    $.ajax({
        url:'/login/login',
        type:'POST',
        data:{
            phone:phoneNumber,
            phoneCode:phoneCode
        },
        beforeSend:function () {
            $('#signinBtn').attr('disabled','true');
        },
        error:function (error) {
            alert('登录失败，请稍后再试');
            console.log(JSON.stringify(error));
            $('#signinBtn').removeAttr('disabled');
        },
        success:function (res) {
            console.log(JSON.stringify(res))
            if(!res.success){
                alert(res.message);
            }else {
                window.location.href='/login/drawing';
            }
            // console.log(JSON.stringify(res));
            $('#signinBtn').removeAttr('disabled');
        }
    })
});