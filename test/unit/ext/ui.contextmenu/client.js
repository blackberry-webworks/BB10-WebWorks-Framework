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
var _ID = "blackberry.ui.contextmenu",
    _extDir = __dirname + "./../../../../ext",
    _apiDir = _extDir + "/" + "ui.contextmenu",
    client = null,
    mockedWebworks = {
        execAsync: jasmine.createSpy("execAsync").andCallFake(function (service, action, args) {
            return true;
        }),
    };

describe("blackberry.ui.contextmenu client", function () {

    beforeEach(function () {
        GLOBAL.window.webworks = mockedWebworks;
        client = require(_apiDir + "/client");
        spyOn(console, "log");
    });

    it("enabled context menu calls execAsync", function () {
        client.enabled = true;
        expect(mockedWebworks.execAsync).toHaveBeenCalledWith(_ID, "enabled", {"enabled": true});
    });

    it("disabled context menu calls execAsync", function () {
        client.enabled = false;
        expect(mockedWebworks.execAsync).toHaveBeenCalledWith(_ID, "enabled", {"enabled": false});
    });

    it("disabled context menu wont get called since incorrect value is passed", function () {
        client.enabled = "false";
        expect(console.log).toHaveBeenCalledWith("contextmenu.enabled only accepts boolean values");
        expect(mockedWebworks.execAsync).wasNotCalledWith(_ID, "enabled", {"enabled": "false"});
    });
    it("disabled context menu wont get called since incorrect value is passed", function () {
        client.enabled = 0;
        expect(console.log).toHaveBeenCalledWith("contextmenu.enabled only accepts boolean values");
        expect(mockedWebworks.execAsync).wasNotCalledWith(_ID, "enabled", {"enabled": "0"});
    });
    it("disabled context menu wont get called since incorrect value is passed", function () {
        client.enabled = 1;
        expect(console.log).toHaveBeenCalledWith("contextmenu.enabled only accepts boolean values");
        expect(mockedWebworks.execAsync).wasNotCalledWith(_ID, "enabled", {"enabled": "1"});
    });
    it("disabled context menu wont get called since incorrect value is passed", function () {
        client.enabled = "true";
        expect(console.log).toHaveBeenCalledWith("contextmenu.enabled only accepts boolean values");
        expect(mockedWebworks.execAsync).wasNotCalledWith(_ID, "enabled", {"enabled": "true"});
    });

});
