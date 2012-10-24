describe("eventHandlers", function () {
    var webview,
        libPath = "./../../../",
        mockedController,
        mockedWebview,
        mockedApplication,
        eventHandlers = require(libPath + "lib/eventHandlers"),
        config = require(libPath + "lib/config");

    beforeEach(function () {
        webview = require(libPath + "lib/webview");
        mockedController = {
            enableWebInspector: undefined,
            enableCrossSiteXHR: undefined,
            visible: undefined,
            active: undefined,
            setGeometry: jasmine.createSpy(),
            dispatchEvent : jasmine.createSpy(),
            addEventListener : jasmine.createSpy()
        };
        mockedWebview = {
            id: 42,
            enableCrossSiteXHR: undefined,
            visible: undefined,
            active: undefined,
            zOrder: undefined,
            url: undefined,
            setFileSystemSandbox: undefined,
            setGeometry: jasmine.createSpy(),
            setApplicationOrientation: jasmine.createSpy(),
            notifyApplicationOrientationDone: jasmine.createSpy(),
            onContextMenuRequestEvent: undefined,
            onNetworkResourceRequested: undefined,
            destroy: jasmine.createSpy(),
            executeJavaScript: jasmine.createSpy(),
            windowGroup: undefined,
            addEventListener: jasmine.createSpy(),
            enableWebEventRedirect: jasmine.createSpy(),
            allowGeolocation: jasmine.createSpy(),
            disallowGeolocation: jasmine.createSpy()
        };
        mockedApplication = {
            windowVisible: undefined
        };
        GLOBAL.qnx = {
            callExtensionMethod: jasmine.createSpy(),
            webplatform: {
                getController: function () {
                    return mockedController;
                },
                createWebView: function (options, createFunction) {
                    //process.nextTick(createFunction);
                    //setTimeout(createFunction,0);
                    if (typeof options === 'function') {
                        runs(options);
                    }
                    else {
                        runs(createFunction);
                    }
                    return mockedWebview;
                },
                getApplication: function () {
                    return mockedApplication;
                }
            }
        };
        GLOBAL.window = {
            qnx: qnx
        };
        GLOBAL.screen = {
            width : 1024,
            height: 768
        };
    });

    describe("init", function () {
        it("can set up a eventHandlers object", function () {
            webview.create();
            waits(1);
            expect(eventHandlers.init).toBeDefined();
            eventHandlers.init(mockedWebview);
        });

        it("can check whether the onGeolocationPermissionRequest is defined", function () {
            expect(eventHandlers.onGeolocationPermissionRequest).toBeDefined();
        });
    });

    describe("permissons tests", function () {

        beforeEach(function () {
            webview.create();
            waits(1);
            expect(eventHandlers.init).toBeDefined();
            eventHandlers.init(mockedWebview);
        });

        it("can call the onGeolocationPermissionRequest with permission properly to allow", function () {
            var request = '{ "origin" : "test.com" }';
            if (config && config.permissions) {
                config.permissions.push("read_geolocation");
            } else {
                config.permissions = ["read_geolocation"];
            }
            eventHandlers.onGeolocationPermissionRequest(request);
            expect(mockedWebview.allowGeolocation).toHaveBeenCalledWith("test.com");
        });

        it("can call the onGeolocationPermissionRequest with permission properly to disallow", function () {
            var request = '{ "origin" : "test.com" }';
            if (config && config.permissions) {
                config.permissions = null;
            }
            eventHandlers.onGeolocationPermissionRequest(request);
            expect(mockedWebview.disallowGeolocation).toHaveBeenCalledWith("test.com");
        });
    });

    describe("Network Tests", function () {

        beforeEach(function () {
            webview.create();
            waits(1);
            expect(eventHandlers.init).toBeDefined();
            eventHandlers.init(mockedWebview);
            webview.setURL("test.com");
        });

        it("can call the onNetworkError function with an error and get a preventDefault", function () {
            expect(eventHandlers.onNetworkError('{"type" : "NetworkError"}')).toEqual('{"setPreventDefault": true}');
        });

        it("can call the onNetworkError function with an error and get an event trigger since the url is defined", function () {
            var _event = require(libPath + "lib/event");
            webview.setURL("test.com");
            spyOn(_event, "trigger");
            expect(eventHandlers.onNetworkError('{"type" : "NetworkError"}')).toEqual('{"setPreventDefault": true}');
            expect(_event.trigger).toHaveBeenCalledWith('NetworkError', jasmine.any(Object));
        });

        it("can call the onNetworkError function with an error and undefined webview location and remote request and get an executeJS", function () {
            webview.setURL(undefined);
            spyOn(webview, "executeJavascript");
            expect(eventHandlers.onNetworkError('{"type" : "NetworkError", "url" : "http://google.com"}')).toEqual('{"setPreventDefault": true}');
            expect(webview.executeJavascript).toHaveBeenCalledWith("var xhr = new XMLHttpRequest(); xhr.open('GET', 'http://localhost:8472/networkError/response/caching/?cached=' + !(window.applicationCache.status === 0), true); xhr.send();");
        });

        it("can call the networkCachedResponse with a proper value and trigger a network error", function () {
            var _event = require(libPath + "lib/event"),
                cached = "true";

            spyOn(_event, "trigger");
            webview.setURL(undefined);
            expect(eventHandlers.onNetworkError('{"type" : "NetworkError", "url" : "http://google.com"}')).toEqual('{"setPreventDefault": true}');
            eventHandlers.networkCacheResponse(cached);
            expect(_event.trigger).toHaveBeenCalledWith('NetworkError', jasmine.any(Object));
        });

        it("can can't a trigger a network error since the pending request should be undefined", function () {
            var _event = require(libPath + "lib/event"),
                cached = "true";

            webview.setURL("http://test.com");
            expect(eventHandlers.onNetworkError('{"type" : "NetworkError"}')).toEqual('{"setPreventDefault": true}');
            spyOn(_event, "trigger");
            eventHandlers.networkCacheResponse(cached);
            expect(_event.trigger).not.toHaveBeenCalled();
        });

        it("can can't a trigger a network error since the cache result returns false", function () {
            var _event = require(libPath + "lib/event"),
                _utils = require(libPath + "lib/utils"),
                cached = "false";

            spyOn(_event, "trigger");
            webview.setURL(undefined);
            spyOn(webview, "setURL");
            spyOn(_utils, "isRemote").andReturn(true);
            expect(eventHandlers.onNetworkError('{"type" : "NetworkError"}')).toEqual('{"setPreventDefault": true}');
            eventHandlers.networkCacheResponse(cached);
            expect(_event.trigger).not.toHaveBeenCalledWith();
            expect(webview.setURL).toHaveBeenCalledWith("local:///chrome/lib/public/NetworkError.html?redirect=undefined");
        });
    });

});
