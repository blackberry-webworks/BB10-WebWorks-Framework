/*
 *  Copyright 2012 Research In Motion Limited.
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

describe("geolocationPermissionRequest webkitHandler", function () {
    var LIB_PATH = "./../../../../lib/",
        mockedWebview,
        geolocationPermissionRequest = require(LIB_PATH + "webkitHandlers/geolocationPermissionRequest");

    beforeEach(function () {
        mockedWebview = {
            allowGeolocation: jasmine.createSpy()
        };
    });

    afterEach(function () {
        mockedWebview = null;
    });

    describe("createHandler", function () {
        it("exists", function () {
            expect(geolocationPermissionRequest.createHandler).toBeDefined();
        });

        it("returns an object", function () {
            var o = geolocationPermissionRequest.createHandler(mockedWebview);
            expect(o.onGeolocationPermissionRequest).toBeDefined();
        });

        it("calls allowGeolocation on the request origin", function () {
            var request = '{ "origin" : "test.com" }',
                o = geolocationPermissionRequest.createHandler(mockedWebview);
            o.onGeolocationPermissionRequest(request);
            expect(mockedWebview.allowGeolocation).toHaveBeenCalledWith("test.com");
        });
    });
});
