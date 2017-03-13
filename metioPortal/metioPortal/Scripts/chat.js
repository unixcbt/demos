$(function () {
    var chatService;
    var show = false;
    var lastRole = '';
    var firstMessage = true;
    var Message = function () {
        var pSearch = Client.personsAndGroupsManager.createPersonSearchQuery();
        pSearch.limit(1);
        pSearch.text("sip:botmonitor@metio.ms");
        pSearch.getMore().then(function (sr) {
            if (sr.length < 1){
                throw new Error('Contact not found');
            }
            return sr[0].result;
        }).then(function (contact) {
            var conversation = Client.conversationsManager.getConversation(contact);
            chatService = conversation.chatService;
            chatService.start().then(function () {
                chatService.sendMessage('Hi');
            });

            conversation.historyService.activityItems.added(function (message) {
                if(firstMessage){
                    firstMessage = false;
                    return;
                }
                messageHandler(message);
            });
        });

        this.hideChatWindow();
    };

    function setDemoStatus(message) {
        message = message.toLowerCase();
        if (message.indexOf('skypehealthcare') > -1) {
            $('.metio-healthcare').attr('available', message.indexOf('running') > -1 );
        }
        else if (message.indexOf('skypefinserv') > -1) {
            $('.finserv').attr('available', message.indexOf('running') > -1);
        }
        else if (message.indexOf('contactcenter') > -1) {
            $('.contact-center').attr('available', message.indexOf('running') > -1);
        }
        $('#content').show();
    };

    function messageHandler(message) {
        $("#chat-back").animate({ opacity: 1.0, marginLeft: "-=25px" }, 600);
        $("footer").delay(300).animate({ opacity: 1.0, bottom: "0px" }, 600, 'easeOutQuint');

        var messageText = message.text();

        if (message.direction() == "Incoming") {
            //Set the status from UI
            setDemoStatus(messageText.toLowerCase());
        }
        addMessage(message);
    };

    function addMessage(message) {
        var messageText = message.text();
        var timestamp = message.timestamp();
        var direction = message.direction();
        var $messageContainer = $('<div class="message"></div>');
        $messageContainer.addClass(direction == 'outgoing' ? 'outgoing-message' : 'incoming-message');
        $messageContainer.html('<div>' + messageText + '</div>');
        if (direction== "Incoming") {
            $messageContainer.prepend($('<img src="images/bot.jpg">'));
        }
        //$('.mCustomScrollBox').remove();
        if (direction != lastRole) {
            var $time = $('<div class="message-time"></div>');
            var month = timestamp.toDateString().split(' ')[1];
            var time = timestamp.format(' dd, hh:mm:ss');
            $time.text(month + time);
            $('#message-list').append($time);
        }
        $('#message-list').append($messageContainer);
        $messageContainer.addClass('last-message');
        if (lastRole == direction) {
            $messageContainer.prev().removeClass('last-message');
        }
        lastRole = direction;
        $('#message-list').animate({ scrollTop: $('#message-list')[0].scrollHeight }, "fast");
    };

    $('#chat-input-text').keydown(function (evt) {
        if (evt.keyCode == 13) {
            var message = $(this).val();
            if (message != "") {
                $(this).val("");
                chatService.sendMessage(message);
            }
            evt.preventDefault();
            return false;  
        }
    });

    $('.double-arrow-hide').click(function(){
        $("#chat").animate({ right: "-400px" }, 500);
        $('.slide-bar').animate({ right: "0px" }, 500, function () {
            $('.double-arrow-hide').hide();
            $('.double-arrow-show').show();
        });
        show = false;
    });

    $('.double-arrow-show').click(function(){
        show = true;
        $("#chat").animate({ right: "0px" }, 500);
        $('.double-arrow-show').hide();
        $('.double-arrow-hide').show();
        $('.slide-bar').animate({ right: "370px" }, 500);
    });

    window.Message = Message;
});
