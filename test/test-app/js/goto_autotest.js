function countDown() {
    var autoTestURI = 'automatic/SpecRunner.htm',
        seconds = 5,
        myTimer; 
    myTimer = setInterval(function() {
        s = document.getElementById('countdown'),
        seconds -= 1;
        s.innerHTML = seconds;

        if(seconds === 0) {
            clearInterval(myTimer);
            gotoURI(autoTestURI);

        }
    }, 1000);
}

function gotoURI(uri) {
    window.location = uri;
}

function startAutoTest() {
    try {
    $.get('http://169.254.0.2:3000/runAutoTest', function(result) {
        console.log("xhr response: " + result);
        window.location = 'automatic/SpecRunner.htm';
    });
    } catch (e) {
        console.log("error: " + e);
    }
}
