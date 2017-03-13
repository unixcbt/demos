$(function () {
    'use strict';

    var Application;
    var client;

    Skype.initialize(
        {
            apiKey: config.apiKey,
        },
        function (api) {
            Application = api.application;
            client = new Application();
            init();
        },
        function (err) {
            console.log('error on initialize');
            console.log(err);
        });

    var username; //= 'danab@litwareinc.com'; //'danab@metio.net'; 
    var password; //= 'pass@word1'; //'dev+Uc=:)*2';
    var endpointSip; //= 'skype.helper@litwareinc.com';
    var conferenceUri;
    var chatService;
    var videoService;
    var timer = null;
    var videoService, audioService;
    var fullscreen = false;
    var conversation = null;
    var confUri = "sip:danewman@microsoft.com;gruu;opaque=app:conf:focus:id:840GR8M5";
    var meetingurl = "https://meet.lync.com/metio/toshm/V16WYJRM";
    var serviceurl = "http://adhocmeeting.cloudapp.net";
    

    var anonAppInput = {
        ApplicationSessionId: "AnonMeeting",
        AllowedOrigins: window.location.href,
        MeetingUrl: meetingurl
    };
    
    var anonmeetingsignin = {};

    $(document).ready(function () {
        $('#doctor-name').text("Logging in...");

        $(document).on('videoConnected', hideLoadingSpinner);

        $('#btnFullScreen').click(function () {
            if (fullscreen) {
                $('#bodyContainer').toggleClass('fullscreen-container');
                $('#divCallControl').toggleClass('fullscreen');
                $('#bottomInfo').show();
                $('#sideInfo').show();
                $('#navigation').show();

                $('#videoControl').css({
                    'height': '514px',
                    'width': '800px'
                });

                $('#skypeBackgroundImage').css({
                    'height': '514px',
                    'width': '800px'
                });

                $('#patientWindow').css({
                    'height': '514px',
                    'width': '800px'
                });

                $('#callControls').css({
                    'width': '800px'
                });

                $('#bodyContainer').css({
                    'width': ''
                });

                $('#loading-content').css({
                    'left': '215px',
                    'top' : '200px'
                });

                $('#myVideo').css({
                    'top': '+15px',
                    'width': '200px',
                    'height': '120px'
                });

                $('#callButtons').css({
                    'margin-left': '325px'
                });
            }
            else {
                $('#bottomInfo').hide();
                $('#sideInfo').hide();
                $('#navigation').hide();
                $('#bodyContainer').toggleClass('fullscreen-container');
                $('#divCallControl').toggleClass('fullscreen');


                var winHeight = window.innerHeight - 66;
                var winWidth = window.innerWidth - 16;

                $('#videoControl').css({
                    'height': winHeight,
                    'width': winWidth
                });

                $('#skypeBackgroundImage').css({
                    'height': winHeight,
                    'width': winWidth
                });

                $('#patientWindow').css({
                    'height': winHeight,
                    'width': winWidth
                });

                $('#callControls').css({
                    'width': winWidth
                });

                $('#bodyContainer').css({
                    'width': winWidth
                });

                $('#loading-content').css({
                    'left': (winWidth - 342) / 2,
                    'top': (winHeight - 100) / 2 - 100
                });

                $('#myVideo').css({
                    'top':'-64px',
                    'width': winWidth / 4,
                    'height': winHeight / 4.28
                });

                $('#callButtons').css({
                    'margin-left' : (winWidth - 113) / 2
                });
            }

            $('#divCallControl').toggleClass('width-fill');
            $('#leftColumn').toggleClass('width-fill');
            fullscreen = !fullscreen;
        });

        $('#firstTextBtn').click(function () {
            $('.textAreas').hide();
            $('#firstText').fadeIn('fast');
            $('.textButtons').removeClass('font-bold');
            $('.textButtons').addClass('font-lightgray');
            $('#firstTextBtn').removeClass('font-lightgray');
            $('#firstTextBtn').addClass('font-bold');
            $('#note-title').text('Today\'s Notes:');
        });

        $('#secondTextBtn').click(function () {
            $('.textAreas').hide();
            $('#secondText').fadeIn('fast');
            $('.textButtons').removeClass('font-bold');
            $('.textButtons').addClass('font-lightgray');
            $('#secondTextBtn').removeClass('font-lightgray');
            $('#secondTextBtn').addClass('font-bold');
            $('#note-title').text('Notes from November 14, 2014:');
        });

        $('#thirdTextBtn').click(function () {
            $('.textAreas').hide();
            $('#thirdText').fadeIn('fast');
            $('.textButtons').removeClass('font-bold');
            $('.textButtons').addClass('font-lightgray');
            $('#thirdTextBtn').removeClass('font-lightgray');
            $('#thirdTextBtn').addClass('font-bold');
            $('#note-title').text('Notes from August 28, 2014:');
        });
    });

    function init() {

        username = $('#skypeUserId').val();
        password = $('#skypePassword').val();
        endpointSip = $('#endpointSip').val();
        conferenceUri = $('#conferenceUriDisplay').val();

        $('#btnHangUp').click(function () {
            client.signInManager.signOut()
            .then(function () {
                window.location.href = $('#homeLink').attr('href') + "?sip=" + encodeURIComponent($('#skypeUserId').val()) + "&patient=" + encodeURIComponent($('#patientId').val()) + "&pw=" + encodeURIComponent($('#skypePassword').val());
            }, function (error) {
                // or a failure
                alert(error || 'Cannot sign out');
            });
        });

        $('#btnVideo').click(function () {
            var conv, channel;
            if (client && client.conversationsManager.conversations && client.conversationsManager.conversations.size() == 1) {

                conv = client.conversationsManager.conversations(0);
                channel = conv.participants(0).video.channels(0);
                channel.stream.source.sink.container.set(document.getElementById('patientWindow'));
                channel.isStarted.set(true);
            }

            if (conversation) {
                var p = conversation.participants(0);
                var channel = p.video.channels(0);

                channel.stream.source.sink.container.set(document.getElementById("patientWindow")).then(function () {
                    p.video.channels(0).isStarted.set(true);
                });
            }
        });


        GetAdhocMeeting();

    }

    function getconfid(meetingurl) {
        var confid = '';
        if (meetingurl && meetingurl.indexOf('/') > -1 && meetingurl.split('://').length == 2) {
            var meetingpart = meetingurl.split('://')[1];
            meetingpart = meetingpart.split('/');
            if (meetingpart && meetingpart.length == 4) {
                var domain = meetingpart[1];
                var user = meetingpart[2];
                var id = meetingpart[3];
                confid = 'sip:' + user + '@' + domain + '.onmicrosoft.com;gruu;opaque=app:conf:focus:id:' + id;
            }
        }

        return confid;
    }

    function hideLoadingSpinner() {
        $('#loading-content').hide();
    }

    function ajaxrequest(verb, url, data, datatype) {
        return $.ajax({
            url: url,
            type: verb,
            dataType: datatype,
            data: data
        });
    }

    function GetAdhocMeeting() {
        var meetingurl;

        var getadhocmeetinginput = { Subject: 'adhocMeeting', Description: 'adhocMeeting', AccessLevel: '' };

        ajaxrequest('post', 'http://adhocmeeting.cloudapp.net/GetAdhocMeetingJob', getadhocmeetinginput, 'text').done(function (d) {
            var data = JSON.parse(d);
            var meetingUrl = data.JoinUrl;
            var discoverUri = data.DiscoverUri;
            meetingurl = data.JoinUrl;
        })
        .fail(
            function () {
                alert('Get adhoc meeting failed, please try again.');
            }
        )
        .done(
            function () {
                anonAppInput.MeetingUrl = meetingurl;
                getanonmeetingtoken();
            });
    }

    function joinConference() {
        //var confUri = getconfid(meetingurl);
        conversation = client.conversationsManager.conversations(0);

        conversation.selfParticipant.video.state.changed(function (newState) {
            var selfChannel;
            if (newState == 'Connected') {
                                
                var p = conversation.participants(0);
                var channel = p.video.channels(0);

                channel.stream.source.sink.container.set(document.getElementById("patientWindow")).then(function () {
                    p.video.channels(0).isStarted.set(true);
                });


                $('#loading-content').hide();
                $('#skypeBackgroundImage').hide();

                $('#patientWindow').show();
                $('#myVideo').show();

                if (p && p.displayName()) {
                    $('#patientname').html(p.displayName());
                }

                setTimeout(function () {
                    selfChannel = conversation.selfParticipant.video.channels(0);
                    selfChannel.stream.source.sink.container.set(document.getElementById("myVideo"));

                }, 200);
            }
        });

        conversation.videoService.start();
    }

    function hangupClick() {
        client.signInManager.signOut()
            .then(function () {
            }, function (error) {
                // or a failure
                alert(error || 'Cannot sign out');
            });
    }


    ///get anon meeting token and sign in
    function getanonmeetingtoken() {
        

        $.ajax({
            url: serviceurl + '/GetAnonTokenJob',
            type: 'post',
            async: true,
            dataType: 'text',
            data: anonAppInput,
            success: function (d) {
                //get anon meetiong join token and sign in
                var data = JSON.parse(d);
                if (data) {
                    var tokenRaw = data.Token;
                    var user = data.DiscoverUri;

                    anonmeetingsignin = {
                        name: 'AnonUser',
                        cors: true,
                        root: { user: user },
                        auth: function (req, send) {
                            // the GET /discover must be sent without the token
                            if (req.url != user)
                                req.headers['Authorization'] = "Bearer " + tokenRaw;

                            return send(req);
                        }
                    };
                    //sign in with anon meeting token
                    client.signInManager.signIn(anonmeetingsignin).then(function () {
                        console.log('Signed in successfully');
                            $('#doctor-photo').show();
                            $('#doctor-name').text('Dr. ' + client.personsAndGroupsManager.mePerson.displayName());
                            $('#online-indicator').css({ 'background-color': '#5DD255' });
                            //Join conference and start video
                            joinConference();                            
                    }, function (error) {
                        console.log(error);
                    });
                }

            },
            error: function (error) { console.log(error); }
        });
    }

});