$(function () {
    'use strict';

    var Application;
    var client;

    var params ={
                    "version": config.version,
                    "auth": null,
                    "client_id": "4c3b2c1b-364c-4ceb-9416-8371dd4ebe3a", 
                    "origins": ["https://webdir.online.lync.com/autodiscover/autodiscoverservice.svc/root"],
                    "cors": true
                };


    var shownAppts = [];
    var isApptShowing = false;


    //Skype.initialize(
    //    {
    //        apiKey:config.apiKey,
    //    },
    //    function (api) {
    //        Application = api.application;
    //        client = new Application();
    //        init();
    //    },
    //    function (err) {
    //        console.log('error on initialize');
    //        console.log(err);
    //    });

    var username; //= 'danab@litwareinc.com'; //'danab@metio.net'; 
    var password; //= 'pass@word1'; //'dev+Uc=:)*2';
    var endpointSip; //= 'skype.helper@litwareinc.com';
    var patientId;
    var isPatientWaitingText = 'isPatientWaiting';
    var isPolling = true;
    var pollingChatService;
    var sleepTimer = 10000;

    var init = function () {
        username = $('#skypeUserId').val();
        password = $('#skypePassword').val();
        endpointSip = $('#endpointSip').val();
        patientId = $('#patientId').val();
        
        client.signInManager.signIn(params).then(function () {
            $('#doctor-name').text('Dr. ' + client.personsAndGroupsManager.mePerson.displayName());
            $('#doctor-photo img').load(function () {
                $('#doctor-photo').show();
            });
            client.personsAndGroupsManager.mePerson.avatarUrl.changed(function (url) {
                console.log('avatar url changed');
                console.log('avatar url: ' + url);
                setTimeout(function () { $('#doctor-photo img').on('error', doctorImageFailedLoad); $('#doctor-photo img').attr('src', url); }, 0);
            });
            $('#online-indicator').css({ 'background-color': '#5DD255' });
            setPatientName();
        }, function (error) {
            alert(error || 'Cannot sign in');
        });

        $('#conferenceUriDisplay').val('not set');

        $('#patientOverlay').click(navigateToAppointment);
    }

    var doctorImageFailedLoad = function (event) {
        if ($(event.target).attr('src') != '../Content/Images/cal_drPhoto.png') {
            $(event.target).attr('src', '../Content/Images/cal_drPhoto.png'); //revert to default if image fails to load
        }
        $('#doctor-photo img').off('error');
    }

    var navigateToAppointment = function () {
        $('#submitForm').submit();
    }

    function updateDisplayName(displayName) {
        if ($('#providedDisplayName').val() === '') {
            if (displayName === '') {
                displayName = $('#defaultDisplayName').val();
            }

            $('#displayName').val(displayName);

            $('#patient-name').text(displayName);
            $('#overlay-name').text(displayName);
            $('#calendar-name').text(displayName);
        }
    }

    var showAppointment = function () {
        $('#appt-time').fadeOut('300', function () {
            $('#patient-ready').fadeIn('600');
        });

        $('#appt-group').addClass('cursor');
        $('#appt-group').click(navigateToAppointment);
        $('#appt-img').addClass('cursor');
        $('#appt-img').click(navigateToAppointment);
        $('#patientOverlay').slideDown('750', function () {
            setTimeout(function () {
                $('#patientOverlay').fadeOut('2000');
            }, sleepTimer);
        });
    }

    function getPersonBySipPromise(personName) {
        var pSearch = client.personsAndGroupsManager.createPersonSearchQuery();

        pSearch.limit(1);
        pSearch.text(personName);

        return pSearch.getMore().then(function (sr) {
            if (sr.length < 1)
                alert('Contact not found');
            return sr[0].result;
        });
    }
    function showNewAppointment(uri, displayName, sipAddress) {
        if (isApptShowing == false) {
            isApptShowing = true;
            shownAppts.push(uri);

            $('#conferenceUriDisplay').val(uri);
            $('#sipAddress').val(sipAddress);
            updateDisplayName(displayName);
            showAppointment();

            setTimeout(resetApptShowing, sleepTimer);
        }
    }

    function resetApptShowing() {
        isApptShowing = false;
    }

    function processEndpointMessage(message) {
        if (message.text() != '' && !(message.text().indexOf(isPatientWaitingText) > -1) && isPolling) {
            //isPolling = false;

            var result = JSON.parse(message.text());
            if (result != null && result.conferences.length > 0) {
                var index;
                for (index = 0; index < result.conferences.length; ++index) {
                    if (shownAppts.indexOf(result.conferences[index].conferenceUri) == -1) {
                        showNewAppointment(result.conferences[index].conferenceUri, result.conferences[index].displayName, result.conferences[index].sipAddress);
                    }
                }
            }
        }

        else if (!(message.text().indexOf(isPatientWaitingText) > -1)) {
            console.log("Invalid message received from endpoint " + message.text());
        }
    }

    function startPoll() {
        getPersonBySipPromise(endpointSip)
            .then(function (contact) {
                var conversation = client.conversationsManager.getConversation(contact);
                conversation.historyService.activityItems.added(processEndpointMessage);
                pollingChatService = conversation.chatService;
                pollingChatService.start().then(function () {
                    pollIsPatientWaiting();
                });
            }).then(_, function (error) {
                alert(error);
            });
    }

    function pollIsPatientWaiting() {
        setTimeout(function () {
            var sendMessage = isPatientWaitingText;
            if (patientId != null && patientId != "") {
                sendMessage = isPatientWaitingText + "|" + patientId;
            }

            pollingChatService.sendMessage(sendMessage).then(function () {
                if (isPolling === true) {
                    pollIsPatientWaiting();
                }
            })
        }, 3000);
    }

    function setPatientName() {
        if (patientId == null || patientId == "") {
            startPoll();
        }
        else {
            if (patientId.indexOf('@') == -1) {
                patientId = patientId + '@skype.net';
            }

            getPersonBySipPromise(patientId)
                        .then(function (contact) {
                            updateDisplayName(contact.displayName());
                            startPoll();
                        }).then(_, function (error) {
                            startPoll();
                            alert(error);
                        });
        }
    }

    $('#patient-name').hover(function () {
        $(this).css('cursor','pointer');
    });

    $('#patient-name').click(function () {
        window.location = "lamnahealthcarePatient/Home/Appointment";
    });


});