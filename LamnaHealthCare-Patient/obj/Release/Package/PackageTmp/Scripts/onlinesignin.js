var clientid = '4c3b2c1b-364c-4ceb-9416-8371dd4ebe3a';

if (/^#access_token=/.test(location.hash)) {

    location.assign('/Home/index?auto=1&ss=0' +
        '&cors=1' +
        '&client_id=' + clientid+
        '&origins=https://webdir.online.lync.com/autodiscover/autodiscoverservice.svc/root');
}

$('.loginForm').submit(function (event) {
    event.preventDefault();
    if (location.hash == '') {
        location.assign('https://login.windows.net/common/oauth2/authorize?response_type=token' +
            '&client_id=' + clientid+
            '&redirect_uri=http://healthcarenocc.azurewebsites.net/' +
            '&resource=https://webdir.online.lync.com');
    }
});
