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

            registerAppListener();
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
    var meetingurl = 'sip:danewman@microsoft.com;gruu;opaque=app:conf:focus:id:840GR8M5';//by default it is adhoc meeting  https://meet.lync.com/microsoft/danewman/840GR8M5

    var params =
               {
                   "version": config.version,
                   "auth": null,
                   "client_id": "25720aa8-cf48-4a48-96b7-4c38366bdfc0",
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

        // sign in and start video
        client.signInManager.signIn(params).then(function () {
            $('#doctor-photo').show();
            $('#doctor-name').text('Dr. ' + client.personsAndGroupsManager.mePerson.displayName());
            $('#online-indicator').css({ 'background-color': '#5DD255' });

            if (conferenceUri === 'adhoc') {
                joinConference();
            }
            else {
                GetAdhocMeeting();
            }

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
            async:false,
            dataType: datatype,
            data: data
        });
    }

    function GetAdhocMeeting() {        
        var getadhocmeetinginput = { Subject: 'adhocMeeting', Description: 'adhocMeeting', AccessLevel: '' };

        ajaxrequest('post', 'https://adhocmeeting.cloudapp.net/GetAdhocMeetingJob', getadhocmeetinginput, 'text').done(function (d) {
            var data = JSON.parse(d);

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
                joinConference();
            });
    }

    function registerAppListener() {
        var convAddedListener = client.conversationsManager.conversations.added(function (conversation) {

            if (conversation.videoService.videoMode() === 'MultiView') {
                subscribeToParticipantsAdded();
            } else if (conversation.videoService.videoMode() === 'ActiveSpeaker') {
                subscribeToActiveSpeaker();
            }

            conversation.state.changed(function onDisconnect(state) {
                if (state === 'Disconnected') {
                    conversation.state.changed.off(onDisconnect);
                    client.conversationsManager.conversations.remove(conversation);
                }
            });

            function subscribeToSelfVideoState() {
                return conversation.selfParticipant.video.state.changed(function (newState, reason, oldState) {
                    var channel;
                    if (newState === 'Notified' && !timerId) {
                        timerId = setTimeout(onAudioVideoNotified, 0);
                    } else if (newState === 'Connected') {
                        console.log('Self video on from doctor side');
                        setTimeout(function () {
                            channel = conversation.selfParticipant.video.channels(0);
                            channel.stream.source.sink.container.set(document.getElementById("myVideo"));
                            $('#myVideo').show();
                        }, 5000);
                    }
                });
            }
            subscribeToSelfVideoState();

            function subscribeToParticipantsAdded() {
                var participantsAddedListnr = conversation.participants.added(function (participant) {
                    participant.person.id.get().then(function (id) {

                        var videoStateListnr = participant.video.state.when('Connected', function () {

                            participant.video.channels(0).stream.source.sink.container.set(document.getElementById("patientWindow"));

                            var videoOnListnr = participant.video.channels(0).isVideoOn.when(true, function () {
                                participant.video.channels(0).isStarted(true);
                                $('#patientWindow').show();
                                $('#loading-content').hide();
                                $('#skypeBackgroundImage').hide();
                            });

                            var videoOffListnr = participant.video.channels(0).isVideoOn.when(false, function () {
                                participant.video.channels(0).isStarted(false);
                            });
                        });


                    });
                });
            }

            function subscribeToActiveSpeaker() {
                var activeSpeaker = conversation.videoService.activeSpeaker;

                activeSpeaker.channel.stream.source.sink.container.set(document.getElementById("patientWindow"));

                var videoOnListener = activeSpeaker.channel.isVideoOn.when(true, function () {
                    activeSpeaker.channel.isStarted(true);
                    $('#patientWindow').show();

                    $('#loading-content').hide();
                    $('#skypeBackgroundImage').hide();

                    console.log('ActiveSpeaker video is available and has been turned on.');
                });

                var videoOffListener = activeSpeaker.channel.isVideoOn.when(false, function () {
                    activeSpeaker.channel.isStarted(false);
                    console.log('ActiveSpeaker video is not available anymore and has been turned off.');
                });

                // the .participant object changes when the active speaker changes
                var participantChangedListener = activeSpeaker.participant.changed(function (newValue, reason, oldValue) {
                    console.log('The ActiveSpeaker has changed. Old ActiveSpeaker:', oldValue && oldValue.displayName(), 'New ActiveSpeaker:', newValue && newValue.displayName());
                });
            }
        });
    }

    function joinConference() {
        conversation = client.conversationsManager.getConversationByUri(meetingurl);
              
        conversation.videoService.start().then(null, function (error) {
            if (error.code && error.code == 'PluginNotInstalled') {
                console.log('You can install the plugin from:');
                console.log('(Windows) https://swx.cdn.skype.com/s4b-plugin/16.2.0.67/SkypeMeetingsApp.msi');
                console.log('(Mac) https://swx.cdn.skype.com/s4b-plugin/16.2.0.67/SkypeForBusinessPlugin.pkg');
            }
        });
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