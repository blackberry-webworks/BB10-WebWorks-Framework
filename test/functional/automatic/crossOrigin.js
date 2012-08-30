describe("Cross Origin Request", function () {

    function mixin (from, to) {
        Object.getOwnPropertyNames(from).forEach(function (prop) {
            if (Object.hasOwnProperty.call(from, prop)) {
                to[prop] = from[prop];
            }
        });
        return to;
    }

    function testHtmlElement (htmlElement, attributes, shouldFail) {
        var element = document.createElement(htmlElement),
            wasLoaded = false;
        mixin(attributes, element);
        element.onload = jasmine.createSpy();
        element.onerror = jasmine.createSpy();
        document.body.appendChild(element);
        waits(100);
        waitsFor(function () {
            return shouldFail? element.onerror.wasCalled: element.onload.wasCalled;
        }, "the element to " + (shouldFail ? "un" : "") + "successfully load", 5000);
        runs(function () {
            expect(element.onload.wasCalled).toBe(!shouldFail);
            expect(element.onerror.wasCalled).toBe(!!shouldFail);
            document.body.removeChild(element);
        });
    }

    function whitelistedImgUrl () {
        return 'http://www.w3.org/html/logo/downloads/HTML5_Logo_512.png?v=' + new Date().getTime();
    }

    it("should allow cross origin xhr for a whitelisted domain", function () {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", whitelistedImgUrl(), false);
        xhr.send();
        expect(xhr.readyState).toBe(4);
        expect(xhr.status).toBe(200);
    });

    it("should allow cross origin images for a whitelisted domain", function () {
        testHtmlElement('img', {src: whitelistedImgUrl()});
    });

    it("should allow navigation for a whitelisted domain", function () {
        testHtmlElement('iframe', {src: whitelistedImgUrl() });
    });

    xit("should allow scripts to run for a whitelisted domain", function () {
        testHtmlElement('script', {type: "text/javascript", innerHTML: ""});
    });
    
    it("should not allow cross origin xhr for a non-whitelisted domain", function () {
        var xhr = new XMLHttpRequest(),
            url = "http://www.nba.com/";
        //spyOn(console, "error").andCallThrough();
        spyOn(xhr, "send").andCallThrough();
        xhr.open("GET", url, false);
        expect(function () {
            xhr.send();
        }).toThrow({
            message: "NETWORK_ERR: XMLHttpRequest Exception 101" 
        });
        //expect(console.error).toHaveBeenCalledWith('Access to "' + url + '" not allowed');
    });

    it("should not allow cross origin images for a non-whitelisted domain",  function () {
        spyOn(window, "alert");
        testHtmlElement('img', {src: "http://octodex.github.com/images/strongbadtocat.png"}, true);
    });

    it("should not allow navigation for a whitelisted domain", function () {
        spyOn(window, "alert");
        testHtmlElement('iframe', {src: "http://www.github.com/"});
    });

    describe("Within an iFrame", function () {
        var ifr;

        beforeEach(function () {
            ifr = document.createElement('iframe');
        });

        afterEach(function () {
            document.body.removeChild(ifr);
        });

        it("should allow navigation for a whitelisted domain", function () {
            var url = "http://www.rim.com/",
                oddJob = jasmine.createSpy();
            ifr.src = url;
            ifr.onerror = oddJob;
            ifr.sandbox = "allow-same-origin allow-scripts";
            document.body.appendChild(ifr);
            waitsFor(function () {
                return ifr.contentDocument && ifr.contentDocument.readyState === 'complete';
            }, "iFrame never loaded", 10000);
            expect(oddJob).wasNotCalled();
        });

        xit("should NOT allow navigation for a non-whitelisted domain", function () {
            var url = "http://www.nba.com/",
                oddJob = jasmine.createSpy();
            ifr.src = url;
            ifr.onerror = oddJob;
            ifr.sandbox = "allow-same-origin allow-scripts";
            document.body.appendChild(ifr);
            waitsFor(function () {
                return ifr.contentDocument && ifr.contentDocument.readyState === 'complete';
            }, "iFrame never loaded", 10000);
            expect(oddJob).hasBeenCalled();
        });

        xit("should allow api access for a whitelisted url", function () {
            var url = "http://www.rim.com/",
                scriptRef = ifr.contentDocument.createElement("script");

            ifr.src = url;
            ifr.sandbox = "allow-same-origin allow-scripts";
            document.body.appendChild(ifr);

            waitsFor(function () {
                return ifr.contentDocument && ifr.contentDocument.readyState === 'complete';
            }, "iFrame never loaded", 10000);

            scriptRef.innerHTML = "var xhr = new XMLHttpRequest(); xhr.open('GET', 'http://localhost:8472/blackberry.app/author', false); xhr.send();";
            ifr.contentDocument.body.appendChild(scriptRef);

            waitsFor(function () {
                return ifr.contentDocument && ifr.contentDocument.readyState === 'complete' && ifr.contentWindow.xhr && ifr.contentWindow.xhr.readyState === 4;
            }, "iFrame script never loaded", 10000);

            expect(ifr.contentWindow.xhr.status).toBe(200);
        });

        xit("should NOT allow api access for a non-whitelisted url", function () {
            var url = "http://www.google.com/",
                scriptRef = ifr.contentDocument.createElement("script");

            ifr.src = url;
            ifr.sandbox = "allow-same-origin allow-scripts";
            document.body.appendChild(ifr);

            waitsFor(function () {
                return ifr.contentDocument && ifr.contentDocument.readyState === 'complete';
            }, "iFrame never loaded", 10000);

            scriptRef.innerHTML = "var xhr = new XMLHttpRequest(); xhr.open('GET', 'http://localhost:8472/blackberry.app/author', false); xhr.send();";
            ifr.contentDocument.body.appendChild(scriptRef);

            waitsFor(function () {
                return ifr.contentDocument && ifr.contentDocument.readyState === 'complete' && ifr.contentWindow.xhr && ifr.contentWindow.xhr.readyState === 4;
            }, "iFrame script never loaded", 10000);

            expect(ifr.contentWindow.xhr.status).toBe(200);
        });


    });
});
