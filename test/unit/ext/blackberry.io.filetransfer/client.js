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

var root = __dirname + "/../../../../",
    _ID = "blackberry.io.filetransfer",
    client,
    mockedWebworks = {},
    constants = {
        "FILE_NOT_FOUND_ERR": 1,
        "INVALID_URL_ERR": 2,
        "CONNECTION_ERR": 3
    },
    defineROFieldArgs = [];

describe("blackberry.io.filetransfer client", function () {
    beforeEach(function () {
        mockedWebworks.execAsync = jasmine.createSpy();
        mockedWebworks.defineReadOnlyField = jasmine.createSpy();
        mockedWebworks.event = { 
            once : jasmine.createSpy(),
            isOn : jasmine.createSpy()
        };

        GLOBAL.window.webworks = mockedWebworks;

        client = require(root + "ext/blackberry.io.filetransfer/client");
    });

    afterEach(function () {
        delete GLOBAL.window;
    });

    describe("blackberry.io.filetransfer constants", function () {
        it("should return constant", function () {
            Object.getOwnPropertyNames(constants).forEach(function (c) {
                defineROFieldArgs.push([client, c, constants[c]]);
            });
            
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("FILE_NOT_FOUND_ERR")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("INVALID_URL_ERR")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("CONNECTION_ERR")]);
        });
    });

    describe("blackberry.io.filetransfer upload", function () {
        var filePath = "a",
            server = "b",
            options = { "c": "d" },
            callback = function () {};

        it("should create a once event handler", function () {
            client.upload(filePath, server, callback, callback, options);
            expect(mockedWebworks.event.isOn).toHaveBeenCalledWith(jasmine.any(String));
            expect(mockedWebworks.event.once).toHaveBeenCalledWith("blackberry.io.filetransfer", jasmine.any(String), jasmine.any(Function));
        });
        
        it("should call webworks.execAsync", function () {
            var expected_args = {
                "_eventId": jasmine.any(String),
                "filePath": filePath,
                "server": server,
                "options": options
            };

            client.upload(filePath, server, callback, callback, options);
            expect(mockedWebworks.execAsync).toHaveBeenCalledWith(_ID, "upload", expected_args);
        });
    });
});