$(function () {
    'use strict'    
    var hasSignIn;
    function initializeSkypeAPI(){
        Skype.initialize({
            apiKey:'SWX-BUILD-SDK',
        }, function(api){
            window.Client= new api.application();
        }, function(err){
            alert('some error occured when initialize API : '+err);
        });
    };

    initializeSkypeAPI();

    function requestData() {
        $('.modal').hide();
        $.get("demos/dashboard/api/values", function (data) {
            data.forEach(function (val) {
                renderUI(val);
            });
            setTimeout(requestData, 1000 * 10);
        });
    };

    requestData();

    function renderUI(message)
    {
        message = message.toLowerCase();
        if (message.indexOf('skypehealthcare') > -1) {
            $('.healthcare').attr('available', message.indexOf('running') > -1 );
        }
        else if (message.indexOf('skypefinserv') > -1) {
            $('.finserv').attr('src', 'available', message.indexOf('running') > -1);
        }
        else if (message.indexOf('contactcenter') > -1) {
            $('.contact-center').attr('available', message.indexOf('running') > -1);
        }
    }

    $('.btn-instruction').click(function () {
        var href = $(this).attr('target');

        var a = $('<a target="_blank">go</a>');
        a.attr('href', href);
        a.css('visibility','hidden')
        $('body').append(a);
        a[0].click()
        a.remove();
    });

    $('.btn-go').click(function (evt) {

        var ticket = $('#ticket').val();
        var ticket2 = $('#ticket2').val();
        var targetname = $('#username2').val();

        if ($(this).parent().attr('available') != 'false') {
            var href = $(this).attr('target');
            var isfabrikam = false;
            //check the demo is fabrikamAgent or fabrikam,
            //if fabrikam, we use the second token
            if (href.indexOf('fabrikamAgent') == -1 && href.indexOf('fabrikam5k') == -1 && href.indexOf('fabrikam') > 0) {
                isfabrikam = true;
            }

            if (isfabrikam) {
                if (ticket2) href += '?ticket=' + ticket2;
            }
            else if (ticket) {
                href += '?ticket=' + ticket;
            }

            if (href.indexOf('fabrikamAgent') > -1) {

                if(targetname) href += '?ticket=' + ticket + '&' + targetname;
            }

            var a = $('<a target="_blank">go</a>');
            a.attr('href', href);
            a.css('visibility', 'hidden')
            $('body').append(a);
            a[0].click()
            a.remove();
            evt.stopPropagation();
        }
    });

    $(window).on('hashchange', function () {
        alert();
        monitor();
    });

    function monitor(){
        var hash = window.location.hash;
        if(hash == "#monitor"){
            if(hasSignIn){

            }
            else{
                $('.sign-in-container').show(); 
            } 
        }
    };
    monitor();

    $('#signin').click(function(){
        $('.modal').show();
        $('.sign-in-container').hide();
        Client.signInManager.signIn({
            username:$('#username').val(),
            password:$('#password').val()
        }).then(
        function(){
            signinSuccess();
        },
        function(err){
            alert("Failed to sing in.");   
            $('.modal').hide();
            $('.sign-in-container').show();             
            cosole.log(err);
        }); 
    });

    $('.sign-out').click(function () {
        signOut();
    });

    function signOut() {
        var iframe = document.createElement('iframe'); 
        iframe.src = 'https://login.live.com/logout.srf?wa=wsignout1.0';
        iframe.onload = function () {
            window.location = 'portal/Account/ExternalLogout';
        };
        document.body.appendChild(iframe);
    }

    //$('.sign-out').click(function () {
    //    Client.signInManager.signOut();
    //    window.location.href = '/demos';
    //});

    $('#username, #password').keydown(function (e) {
        if (e.which == 13) {
            $('#signin').click();
        }
    });

    function signinSuccess(){
        $('.modal').hide();
        var alias = Client.personsAndGroupsManager.mePerson.id();
        alias = alias.split(':')[1].split('@')[0];
        // $.ajax({
        //     type: "get",
        //     url: "http://demos.metio.net/demos/adminchecker/api/values/" + alias
        // }).done(function (msg) {
        //     isDomainAdmin = msg;
        //     if (isDomainAdmin == 'True') {
        //         $('.slide-bar').show();
        //         $('#chat').show();
        //     };
        // });

        $('.slide-bar').show();
        $('#chat').show();
        new Message();
    };

    var bHeight = 979;
    var mHeight = 750;
    var resizeMiddle = function () {
        var left;
        var width = $('body').outerWidth();
        if (width <= 350) {
            document.documentElement.clientWidth = 350;
        }
        if (width < 1600) {
            left = 450 - (1600 - width);
            left = left < 0 ? 0 : left;
        }
        else {
            left = (width - 900) / 2;
        }

        $('#middle-container').css({
            width: '900px',
            left: left + 'px'
        });

        var mH = mHeight - (bHeight - $(window).height());
        $('#message-list').css('height', mH + 'px');
        $('.chat-container').css('height', (mH + 36) + 'px');
        $('#message-list').animate({ scrollTop: $('#message-list')[0].scrollHeight }, "fast");
    };
    resizeMiddle();
    $(window).resize(function () {
        resizeMiddle();
    });
});