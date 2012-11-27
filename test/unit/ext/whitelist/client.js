/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var EXT_DIR = __dirname + "./../../../../ext/",
    ID = require(EXT_DIR + "whitelist/manifest.json").namespace,
    _client,
    MockXHR = function () {},
    openSpy,
    mockWebWorks;

describe("whitelisting client", function () {

    beforeEach(function () {
        openSpy = jasmine.createSpy();
        MockXHR.prototype = {
            open: openSpy
        };
        GLOBAL.XMLHttpRequest = MockXHR;
        _client = require(EXT_DIR + "whitelist/client");
        mockWebWorks = {
            execSync: jasmine.createSpy()
        };
        GLOBAL.window = {
            webworks: mockWebWorks
        };
    });

    afterEach(function () {
        MockXHR = function () {};
        delete GLOBAL.XMLHttpRequest;
        delete require.cache[require.resolve(EXT_DIR + "whitelist/client")];
        _client = undefined;
        delete GLOBAL.window.webworks;
        delete GLOBAL.window;
        mockWebWorks = undefined;
    });

    it("has no return value", function () {
        expect(_client).toEqual({});
    });

    it("still calls the original xhr.open", function () {
        var xhr = new MockXHR();
        xhr.open("GET", "url");
        expect(openSpy).toHaveBeenCalledWith("GET", "url");
    });

    it("calls down for every xhr.open", function () {
        var xhr = new MockXHR();
        xhr.open("GET", "http://www.google.com");
        expect(mockWebWorks.execSync).toHaveBeenCalledWith(ID, "prepRequest", {url: "http://www.google.com"});
    });

    it("will not call down twice for the same url", function () {
        var xhr = new MockXHR(),
            xhr2 = new MockXHR();

        expect(mockWebWorks.execSync.callCount).toEqual(0);
        xhr.open("GET", "http://www.google.com");
        xhr2.open("GET", "http://www.google.com");
        expect(mockWebWorks.execSync.callCount).toEqual(1);
    });

    it("parses the url before sending requests", function () {
        var xhr = new MockXHR();
        xhr.open("GET", "http://www.google.com/apple/peaches/pears/plums.html");
        expect(mockWebWorks.execSync).toHaveBeenCalledWith(ID, "prepRequest", {url: "http://www.google.com"});
    });
});
