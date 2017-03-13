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

    var params =
               {
                   "version": config.version,
                   "auth": null,
                   "client_id": "4c3b2c1b-364c-4ceb-9416-8371dd4ebe3a",
                   "origins": ["https://webdir.online.lync.com/autodiscover/autodiscoverservice.svc/root"],
                   "cors": true
               };

    var videoService, audioService;
    var fullscreen = false;

    var conversation = null;

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
            if (client && client.conversations &&client.conversations.size() == 1) {

                conv = client.conversations(0);

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

        // sign in and start video
        client.signInManager.signIn(params).then(function () {
            $('#doctor-photo').show();
            $('#doctor-name').text('Dr. ' + client.personsAndGroupsManager.mePerson.displayName());
            $('#online-indicator').css({ 'background-color': '#5DD255' });

            joinConference();

            client.conversations.added(function (conversation) {

                var chatService, dfdChatAccept,
                    audioService, dfdAudioAccept,
                    videoService, dfdVideoAccept,
                    selfParticipant,
                    name, timerId;

                selfParticipant = conversation.selfParticipant;
                videoService = conversation.videoService;
                chatService = conversation.chatService;
                audioService = conversation.audioService;

            });

        }, function (error) {
            // if something goes wrong in either of the steps above,
            // display the error message
            //console.error(error);
            alert(error);
        });
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
            meetingurl = data.OnlineMeetingUri;
        })
        .fail(
            function () {
                alert('Get adhoc meeting failed, please try again.');
            }
        )
        .always(
            function () {
                $(".modal").hide();
            });

        return meetingurl;
    }


    function joinConference() {
        var confUri = GetAdhocMeeting();

        conversation = client.conversationsManager.getConversationByUri(confUri);

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

                }, 2000);
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

});