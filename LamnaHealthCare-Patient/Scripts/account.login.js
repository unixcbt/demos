var client;

$(document).ready(function () {
    Skype.initialize(
        {
            apiKey: $('#apiKey').val(),
        },
        function (api) {
            Application = api.application;
            client = new Application();
            console.log('initialize successfully');
        },
        function (err) {
            console.log('error on initialize');
            console.log(err);
        });

    $('.loginForm').submit(function (event) {
        event.preventDefault();

        $('.loginForm [name="submit"]').val("Signing in...");
        $('.loginForm [name="submit"]').addClass("disabled");
        $('.loginForm .validation-summary-errors').empty();

        var usr = $('.loginForm input[name="username"]');
        var pass = $('.loginForm input[name="password"]');
        var patient = $('.loginForm input[name="patient"]');
        var displayName = $('.loginForm input[name="displayName"]').val();

        if (usr.val() === '' || pass.val() === '') {
            $(usr).parent().addClass('has-error');
            $(pass).parent().addClass('has-error');
            var errorMessage = 'Both username and password are required.';
            $('.loginForm .validation-summary-errors').append($('<span/>').text(errorMessage));
            $('.loginForm [name="submit"]').val("Sign in");
            $('.loginForm [name="submit"]').removeClass("disabled");
            return;
        }

        client.signInManager.state.changed(
            function (state) {
                console.log('state changed');
                console.log(state);
            });
        client.signInManager.signIn(
            {
                username: usr.val(),
                password: pass.val()
            }).then(
            function () {
                console.log('signed in as ' + client.personsAndGroupsManager.mePerson.displayName());
                window.location = $('#loginUrl').val() + '?sip=' + encodeURIComponent(usr.val()) + '&pw=' + encodeURIComponent(pass.val()) + '&patient=' + encodeURIComponent(patient.val()) + '&displayName=' + encodeURIComponent(displayName);
            },
            function (error) {
                console.log('error signing in');
                console.log(error);
                $(usr).parent().addClass('has-error');
                $(pass).parent().addClass('has-error');
                var errorMessage = 'Login failed. Verify the credentials and try again.';
                $('.loginForm .validation-summary-errors').append($('<span/>').text(errorMessage));
                $('.loginForm [name="submit"]').val("Sign in");
                $('.loginForm [name="submit"]').removeClass("disabled");
            });
    });
});