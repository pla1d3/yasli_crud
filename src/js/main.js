document.addEventListener("DOMContentLoaded", function() {

    if(window.location.pathname == '/') addScript('/build/js/all.js');
    else addScript('/build/js/'+window.location.pathname.replace(/\//gi, '')+'.js');

    function addScript(src){
        var script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
    }

});