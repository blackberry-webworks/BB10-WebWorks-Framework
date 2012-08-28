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
    pps,
    path = "/pps/services/private/deviceproperties",
    mode = "0";

describe("identity index", function () {
    beforeEach(function () {
        index = require(_apiDir + "index");
        pps = require(_libDir + "pps/pps");
        GLOBAL.window = {
            qnx: {
                webplatform: {
                    pps: {
                        FileMode: {
                            RDONLY: "0"
                        },
                        PPSMode: {
                            FULL: "0"
                        }
                    }
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
                fail = jasmine.createSpy(),
                mockPPS = {
                    open: jasmine.createSpy().andReturn(true),
                    close: jasmine.createSpy()
                };

            GLOBAL.window.qnx.webplatform.pps.create = jasmine.createSpy().andReturn(mockPPS);

            index.uuid(success, fail);

            // Manually trigger the read event
            expect(mockPPS.onFirstReadComplete).toBeDefined();
            mockPPS.onFirstReadComplete({
                deviceproperties: {
                    devicepin: 'mypin'
                }
            });
            
            expect(success).toHaveBeenCalledWith('mypin');
        });
    });
});