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
var _apiDir = __dirname + "./../../../../ext/identity/",
    _libDir = __dirname + "./../../../../lib/",
    index,
    mockDevice,
    path = "/pps/services/private/deviceproperties",
    mode = "0";

describe("identity index", function () {
    beforeEach(function () {
        index = require(_apiDir + "index");
        mockDevice = {
            getDevicePin: function (success, fail) {
                success("0x12345");
            }
        };
        GLOBAL.window = {
            qnx: {
                webplatform: {
                    getDevice: jasmine.createSpy().andReturn(mockDevice)
                }
            }
        };
    });

    afterEach(function () {
        GLOBAL.window = null;
        index = null;
    });

    describe("uuid", function () {
        it("can call success with devicepin", function () {
            var success = jasmine.createSpy(),
                fail = jasmine.createSpy();

            index.uuid(success, fail);
            expect(success).toHaveBeenCalledWith("0x12345");
        });
    });
});