document.addEventListener("DOMContentLoaded", function() {
    var popup = document.getElementById('popup-container');
    var closeBtn = document.getElementById('close-popup');
    var popupLinks = popup.querySelectorAll('a');

    var COOKIE_NAME = "popupShown";
    var HOURS_BEFORE_SHOW_AGAIN = 24;

    function setCookie(name, value, hours) {
        var d = new Date();
        d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        var cname = name + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(cname) === 0) return c.substring(cname.length, c.length);
        }
        return "";
    }

    if (!getCookie(COOKIE_NAME)) {
        popup.style.display = 'block';
    }

    closeBtn.addEventListener('click', function() {
        popup.style.display = 'none';
        setCookie(COOKIE_NAME, "true", HOURS_BEFORE_SHOW_AGAIN);
    });

    popupLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            setCookie(COOKIE_NAME, "true", HOURS_BEFORE_SHOW_AGAIN);
            popup.style.display = 'none';
        });
    });
});
