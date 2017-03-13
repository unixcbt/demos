if (/^#access_token=/.test(location.hash)) {

    location.assign('/Home/index?auto=1&ss=0' +
        '&cors=1' +
        '&client_id=25720aa8-cf48-4a48-96b7-4c38366bdfc0' +
        '&origins=https://webdir.online.lync.com/autodiscover/autodiscoverservice.svc/root');
}

$('.loginForm').submit(function (event) {
    event.preventDefault();
    if (location.hash == '') {
        location.assign('https://login.windows.net/common/oauth2/authorize?response_type=token' +
            '&client_id=25720aa8-cf48-4a48-96b7-4c38366bdfc0' +
            '&redirect_uri=https://lamnahealthcare.azurewebsites.net' +
            '&resource=https://webdir.online.lync.com');
    }
});
