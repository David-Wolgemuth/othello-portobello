function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    document.getElementById('token').innerHTML = response.authResponse.accessToken;
    if (response.status === 'connected') {
        userName();
    } else if (response.status === 'not_authorized') {
        document.getElementById('status').innerHTML = 'Please log ' +
            'into this app.';
    } else {
        document.getElementById('status').innerHTML = 'Please log ' +
            'into Facebook.';
    }
}

function checkLoginState() {
    console.log("Checking Login State");
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : "1056352804406476",
        cookie     : true,  
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.5' // use graph api version 2.5
    });

    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });

};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function userName() {
    FB.api('/me', function(response) {
        console.log(response);
        console.log('Successful login for: ' + response.name);
        document.getElementById('name').innerHTML = response.name;
    });
}