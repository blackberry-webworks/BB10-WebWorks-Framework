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
    index;

describe("blackberry.io.filetransfer index", function () {
    beforeEach(function () {
        GLOBAL.JNEXT = {
            require: jasmine.createSpy().andReturn(true),
            createObject: jasmine.createSpy().andReturn("0"),
            registerEvents: jasmine.createSpy(),
            invoke: jasmine.createSpy()
        };

        index = require(root + "ext/blackberry.io.filetransfer/index");
    });

    afterEach(function () {
        GLOBAL.JNEXT = null;
        index = null;
    });

    it("can access filetransfer module in JNEXT", function () {
        expect(JNEXT.require).toHaveBeenCalledWith("filetransfer");
        expect(JNEXT.createObject).toHaveBeenCalledWith("filetransfer.FileTransfer");
    });

    describe("filetransfer upload", function () {
        it("should call JNEXT.invoke with custom params", function () {
            var mocked_args = {
                    "_eventId": encodeURIComponent(JSON.stringify("1")),
                    "filePath": encodeURIComponent(JSON.stringify("2")),
                    "server": encodeURIComponent(JSON.stringify("3")),
                    "options": encodeURIComponent(JSON.stringify({
                        "fileKey": "test",
                        "fileName": "test.gif",
                        "mimeType": "image/gif",
                        "params": { "test": "test" },
                        "chunkedMode": false
                    }))
                },
                expected_args = {
                    "_eventId": "1",
                    "filePath": "2",
                    "server": "3",
                    "options": {
                        "fileKey": "test",
                        "fileName": "test.gif",
                        "mimeType": "image/gif",
                        "params": { "test": "test" },
                        "chunkedMode": false
                    }
                },
                successCB = jasmine.createSpy(),
                failCB = jasmine.createSpy();
          
            index.upload(successCB, failCB, mocked_args, null);

            expect(JNEXT.invoke).toHaveBeenCalledWith("0", "upload " + JSON.stringify(expected_args));
            expect(successCB).toHaveBeenCalled();
            expect(failCB).not.toHaveBeenCalled();
        });

        it("should call JNEXT.invoke with default params", function () {
            var mocked_args = {
                    "_eventId": encodeURIComponent(JSON.stringify("1")),
                    "filePath": encodeURIComponent(JSON.stringify("2")),
                    "server": encodeURIComponent(JSON.stringify("3"))
                },
                expected_default_args = {
                    "_eventId": "1",
                    "filePath": "2",
                    "server": "3",
                    "options": {
                        "fileKey": "file",
                        "fileName": "image.jpg",
                        "mimeType": "image/jpeg",
                        "params": {},
                        "chunkedMode": true
                    }
                },
                successCB = jasmine.createSpy(),
                failCB = jasmine.createSpy();
          
            index.upload(successCB, failCB, mocked_args, null);

            expect(JNEXT.invoke).toHaveBeenCalledWith("0", "upload " + JSON.stringify(expected_default_args));
            expect(successCB).toHaveBeenCalled();
            expect(failCB).not.toHaveBeenCalled();
        });

        it("should call failure callback with null parameters", function () {
            var mocked_args = {
                    "_eventId": encodeURIComponent(JSON.stringify("1")),
                    "filePath": encodeURIComponent(JSON.stringify("")),
                    "server": encodeURIComponent(JSON.stringify(""))
                },
                successCB = jasmine.createSpy(),
                failCB = jasmine.createSpy();

            index.upload(successCB, failCB, mocked_args, null);

            expect(successCB).not.toHaveBeenCalled();
            expect(failCB).toHaveBeenCalled();
        });
    });
});