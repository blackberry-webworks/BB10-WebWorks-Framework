describe("Cross Origin Request", function () {

    function mixin (from, to) {
        Object.getOwnPropertyNames(from).forEach(function (prop) {
            if (Object.hasOwnProperty.call(from, prop)) {
                Object.defineProperty(to, prop, Object.getOwnPropertyDescriptor(from, prop));
            }
        });
        return to;
    }

    function testHtmlElement (htmlElement, attributes) {
        var element = document.createElement(htmlElement);
        mixin(attributes, htmlElement);
        element.onload = jasmine.createSpy();
        element.onerror = jasmine.createSpy();
        expect(element.onload).hasBeenCalled();
        expect(element.onerror).wasNotCalled();
    }


    it("should allow cross origin xhr for a whitelisted domain", function () {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", 'http://www.w3.org/html/logo/downloads/HTML5_Logo_512.png', false);
        xhr.send();
        expect(xhr.readyState).toBe(4);
        expect(xhr.status).toBe(200);
    });

    it("should allow cross origin images for a whitelisted domain", function () {
        testHtmlElement('img', {src: "http://www.w3.org/html/logo/downloads/HTML5_Logo_512.png"});
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

        it("should NOT allow navigation for a non-whitelisted domain", function () {
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

        it("should allow api access for a whitelisted url", function () {
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

        it("should NOT allow api access for a non-whitelisted url", function () {
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
