
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
var _extDir = __dirname + "./../../../../ext/",
    ID = "qnx.webviews",
    client;


describe("webviews client", function () {
    var mockedWindow;
    beforeEach(function () {
        client = require(_extDir + "webviews/client");

        mockedWindow = {
            webworks: {
                execSync: jasmine.createSpy("window.webworks.execSync")
            }
        };

        GLOBAL.window = mockedWindow;
    });

    it("has an init function", function () {
        var args = {x: 1, y: 2};
        expect(client.init).toBeDefined();
        client.init(args);
        expect(mockedWindow.webworks.execSync).toHaveBeenCalledWith(ID, "init", args);
    });

    describe("create function", function () {

        it("has a create function", function () {
            expect(client.create).toBeDefined();
        });

        it("returns a tab object", function () {
            var tab = client.create();
            expect(tab).toEqual(jasmine.any(Object));
            expect(tab.resize).toEqual(jasmine.any(Function));
        });

        it("calls down to native appropriately", function () {
            client.create();
            expect(mockedWindow.webworks.execSync).toHaveBeenCalledWith("qnx.webviews", "create", {});
        });

        it("passes arguments properly", function () {
            var args = {unos: 1, duos: 2, tres: 3};
            client.create(args);
            expect(mockedWindow.webworks.execSync).toHaveBeenCalledWith("qnx.webviews", "create", {options: args});
        });
    });
});
