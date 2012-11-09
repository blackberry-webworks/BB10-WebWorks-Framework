describe("lib/request", function () {
    var request,
        libPath = "./../../../",
        Whitelist = require(libPath + 'lib/policy/whitelist').Whitelist,
        utils = require(libPath + "lib/utils"),
        server = require(libPath + 'lib/server'),
        mockedWebview;

    beforeEach(function () {
        request = require(libPath + "lib/request");
        mockedWebview = {
            originalLocation : "http://www.origin.com",
            executeJavaScript : jasmine.createSpy(),
            addOriginAccessWhitelistEntry: jasmine.createSpy()
        };
    });

    it("creates a callback for yous", function () {
        var requestObj = request.init(mockedWebview);
        expect(requestObj.networkResourceRequestedHandler).toBeDefined();
    });


    it("can access the whitelist", function () {
        spyOn(Whitelist.prototype, "isAccessAllowed").andReturn(true);
        var url = "http://www.google.com",
            requestObj = request.init(mockedWebview);
        requestObj.networkResourceRequestedHandler(JSON.stringify({url: url}));
        expect(Whitelist.prototype.isAccessAllowed).toHaveBeenCalled();
    });

    it("no longer differentiates between iframes and other requests when accessing the whitelist", function () {
        spyOn(Whitelist.prototype, "isAccessAllowed").andReturn(true);
        var url = "http://www.google.com",
            requestObj = request.init(mockedWebview);
        requestObj.networkResourceRequestedHandler(JSON.stringify({url: url, targetType: "TargetIsXMLHTTPRequest"}));
        expect(Whitelist.prototype.isAccessAllowed).toHaveBeenCalledWith(url);
    });

    it("can apply whitelist rules and allow valid urls", function () {
        spyOn(Whitelist.prototype, "isAccessAllowed").andReturn(true);
        var url = "http://www.google.com",
            requestObj = request.init(mockedWebview),
            returnValue = requestObj.networkResourceRequestedHandler(JSON.stringify({url: url}));
        expect(Whitelist.prototype.isAccessAllowed).toHaveBeenCalled();
        expect(JSON.parse(returnValue).setAction).toEqual("ACCEPT");
    });

    it("can apply whitelist rules and deny blocked urls", function () {
        spyOn(Whitelist.prototype, "isAccessAllowed").andReturn(false);
        var url = "http://www.google.com",
            requestObj = request.init(mockedWebview),
            returnValue = requestObj.networkResourceRequestedHandler(JSON.stringify({url: url}));
        expect(Whitelist.prototype.isAccessAllowed).toHaveBeenCalled();
        expect(JSON.parse(returnValue).setAction).toEqual("DENY");
        expect(mockedWebview.executeJavaScript.mostRecentCall.args[0]).toEqual("alert('Access to \"" + url + "\" not allowed')");
    });

    it("can call the server handler when certain urls are detected", function () {
        spyOn(server, "handle");
        var url = "http://localhost:8472/roomService/kungfuAction/customExt/crystalMethod?blargs=yes",
            requestObj = request.init(mockedWebview),
            returnValue = requestObj.networkResourceRequestedHandler(JSON.stringify({url: url, referrer: "http://www.origin.com" })),
            expectedRequest = {
                params: {
                    service: "roomService",
                    action: "kungfuAction",
                    ext: "customExt",
                    method: "crystalMethod",
                    args: "blargs=yes"
                },
                body: undefined,
                origin: "http://www.origin.com"
            },
            expectedResponse = {
                send: jasmine.any(Function)
            };
        expect(JSON.parse(returnValue).setAction).toEqual("SUBSTITUTE");
        expect(server.handle).toHaveBeenCalledWith(expectedRequest, expectedResponse);
    });

    it("can call the server handler correctly with a multi-level method", function () {
        spyOn(server, "handle");
        var url = "http://localhost:8472/roomService/kungfuAction/customExt/crystal/Method?blargs=yes",
            requestObj = request.init(mockedWebview),
            returnValue = requestObj.networkResourceRequestedHandler(JSON.stringify({url: url, referrer: "http://www.origin.com" })),
            expectedRequest = {
                params: {
                    service: "roomService",
                    action: "kungfuAction",
                    ext: "customExt",
                    method: "crystal/Method",
                    args: "blargs=yes"
                },
                body: undefined,
                origin: "http://www.origin.com"
            },
            expectedResponse = {
                send: jasmine.any(Function)
            };
        expect(JSON.parse(returnValue).setAction).toEqual("SUBSTITUTE");
        expect(server.handle).toHaveBeenCalledWith(expectedRequest, expectedResponse);
    });

    describe("whitelisting", function () {
        it("Adds whitelist entries based on the config", function () {
            request.init(mockedWebview);
            expect(mockedWebview.addOriginAccessWhitelistEntry).toHaveBeenCalledWith('local://', utils.getURIPrefix(), true);
            expect(mockedWebview.addOriginAccessWhitelistEntry).toHaveBeenCalledWith('local://', 'file://', true);
        });

        it("Adds whitelist entries based on the config", function () {
            var accessList = [
                    {
                        uri : "http://google.com",
                        allowSubDomain : true,
                        features : null
                    }
                ],
                originalForEach = Array.prototype.forEach,
                requestObj;
            spyOn(Array.prototype, "forEach").andCallFake(function (callback) {
                originalForEach.call(accessList, callback);
            });
            requestObj = request.init(mockedWebview);
            expect(mockedWebview.addOriginAccessWhitelistEntry).toHaveBeenCalledWith('http://google.com', "local://", true);
            expect(mockedWebview.addOriginAccessWhitelistEntry).toHaveBeenCalledWith('http://google.com', "file://", true);
            expect(mockedWebview.addOriginAccessWhitelistEntry).toHaveBeenCalledWith("file://", 'http://google.com', true);
            expect(mockedWebview.addOriginAccessWhitelistEntry).toHaveBeenCalledWith("local://", 'http://google.com', true);
            expect(mockedWebview.addOriginAccessWhitelistEntry).not.toHaveBeenCalledWith('http://google.com', utils.getURIPrefix(), true);
        });

        it("Adds whitelist entries based on the config", function () {
            var accessList = [
                    {
                        uri : "http://google.com",
                        allowSubDomain : true,
                        features : [{
                            id : "blackberry.app",
                            required : true,
                            version : "1.0.0"
                        }]
                    }
                ],
                originalForEach = Array.prototype.forEach,
                requestObj;
            spyOn(Array.prototype, "forEach").andCallFake(function (callback) {
                originalForEach.call(accessList, callback);
            });
            requestObj = request.init(mockedWebview);
            expect(mockedWebview.addOriginAccessWhitelistEntry).toHaveBeenCalledWith('http://google.com', "local://", true);
            expect(mockedWebview.addOriginAccessWhitelistEntry).toHaveBeenCalledWith('http://google.com', "file://", true);
            expect(mockedWebview.addOriginAccessWhitelistEntry).toHaveBeenCalledWith("file://", 'http://google.com', true);
            expect(mockedWebview.addOriginAccessWhitelistEntry).toHaveBeenCalledWith("local://", 'http://google.com', true);
            expect(mockedWebview.addOriginAccessWhitelistEntry).toHaveBeenCalledWith('http://google.com', utils.getURIPrefix(), true);
        });

        it("dynamically adds whitelist entries based on requests", function () {
            spyOn(Whitelist.prototype, "isAccessAllowed").andReturn(true);
            var url = "http://www.google.com",
                securityOrigin = "loca/://",
                requestObj = request.init(mockedWebview);
            expect(mockedWebview.addOriginAccessWhitelistEntry).not.toHaveBeenCalledWith(securityOrigin, url, false);
            expect(mockedWebview.addOriginAccessWhitelistEntry).not.toHaveBeenCalledWith(securityOrigin, url, true);
            requestObj.networkResourceRequestedHandler(JSON.stringify({url: url, securityOrigin: securityOrigin}));
            expect(mockedWebview.addOriginAccessWhitelistEntry).toHaveBeenCalledWith(securityOrigin, url, false);
        });

        it("does not add duplicates", function () {
            spyOn(Whitelist.prototype, "isAccessAllowed").andReturn(true);
            var url = "http://www.google.com",
                securityOrigin = "loca/://",
                requestObj = request.init(mockedWebview),
                originalCallCount = mockedWebview.addOriginAccessWhitelistEntry.callCount;
            requestObj.networkResourceRequestedHandler(JSON.stringify({url: url, securityOrigin: securityOrigin}));
            requestObj.networkResourceRequestedHandler(JSON.stringify({url: url, securityOrigin: securityOrigin}));
            expect(mockedWebview.addOriginAccessWhitelistEntry.callCount).toEqual(originalCallCount + 1);
        });

    });

});
