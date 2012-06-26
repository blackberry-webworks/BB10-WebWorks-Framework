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

function testIODefined(field) {
    expect(blackberry.io[field]).toBeDefined();
}

function testIOReadOnly(field) {
    var before = blackberry.io[field];
    blackberry.io[field] = -1;
    expect(blackberry.io[field]).toEqual(before);
}

function errorHandler(e) {
    var msg = '';

    switch (e.code) {
    case window.FileError.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR';
        break;
    case window.FileError.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR';
        break;
    case window.FileError.SECURITY_ERR:
        msg = 'SECURITY_ERR';
        break;
    case window.FileError.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR';
        break;
    case window.FileError.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR';
        break;
    default:
        msg = 'Unknown Error';
        break;
    }

    console.log('Error: ' + msg);
}

describe("blackberry.io", function () {
    it('blackberry.io should exist', function () {
        expect(blackberry.io).toBeDefined();
    });

    it('blackberry.io.sandbox should exist', function () {
        testIODefined("sandbox");
    });

    it('blackberry.io.sandbox should default to true', function () {
        expect(blackberry.io.sandbox).toBeTruthy();
    });

    it('blackberry.io.sandbox can be set to false', function () {
        blackberry.io.sandbox = false;
        expect(blackberry.io.sandbox).toBeFalsy();
    });

    it('blackberry.io.home should be defined & read-only and set correctly', function () {
        testIODefined("home");
        testIOReadOnly("home");
        expect(blackberry.io.home).toMatch(/data$/);
    });

    it('blackberry.io.sharedFolder should be defined & read-only and set correctly', function () {
        testIODefined("sharedFolder");
        testIOReadOnly("sharedFolder");
        expect(blackberry.io.sharedFolder).toMatch(/data\/\.\.\/shared$/);
    });

    it('blackberry.io.SDCard should be defined & read-only and set correctly', function () {
        testIODefined("SDCard");
        testIOReadOnly("SDCard");
        expect(blackberry.io.SDCard).toEqual("/accounts/1000/removable/sdcard");
    });

    it('can read file in shared/documents folder after unsandboxing file system', function () {
        var readFromFile;

        window.alert("Please make /accounts/1000/shared/documents/log.txt exists and is not empty");

        window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

        window.requestFileSystem(window.TEMPORARY, 1024 * 1024,
            function (fs) {
                // in order to access the shared folder,
                // config.xml must declare the "access_shared" permsission
                fs.root.getFile(blackberry.io.sharedFolder + '/documents/log.txt', {},
                    function (fileEntry) {
                        fileEntry.file(function (file) {
                            var reader = new FileReader();

                            reader.onloadend = function (e) {
                                readFromFile = this.result;
                                var txtArea = document.createElement('textarea');
                                txtArea.value = this.result;
                                document.body.appendChild(txtArea);
                            };

                            reader.readAsText(file);
                        }, errorHandler);
                    }, errorHandler);
            }, errorHandler);

        waitsFor(function () {
            return (typeof readFromFile === "string");
        }, "did not read from file", 15000);
    });
});
