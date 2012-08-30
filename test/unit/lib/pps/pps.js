/*
 * Copyright 2010-2011 Research In Motion Limited.
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

var _libRoot = __dirname + "/../../../../lib/";

describe("pps", function () {
    var pps = require(_libRoot + "pps/pps");

    beforeEach(function () {
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
    });

    describe("readPPSObject", function () {
        it("can read from a PPS object", function () {
            var success = jasmine.createSpy(),
                fail = jasmine.createSpy(),
                mockPPS = {
                    open: jasmine.createSpy().andReturn(true),
                    close: jasmine.createSpy()
                };

            GLOBAL.window.qnx.webplatform.pps.create = jasmine.createSpy().andReturn(mockPPS);

            pps.readPPSObject('ppsname', success, fail);
            expect(mockPPS.onFirstReadComplete).toBeDefined();

            // Trigger onFirstRead
            mockPPS.onFirstReadComplete('data');

            expect(success).toHaveBeenCalled();
            expect(mockPPS.open).toHaveBeenCalled();
            expect(mockPPS.close).toHaveBeenCalled();
            expect(success).toHaveBeenCalledWith('data');
            expect(fail).not.toHaveBeenCalled();
        });

        it("can trigger fail when pps cannot be opened", function () {
            var success = jasmine.createSpy(),
                fail = jasmine.createSpy(),
                mockPPS = {
                    open: jasmine.createSpy().andReturn(false),
                    close: jasmine.createSpy()
                };

            GLOBAL.window.qnx.webplatform.pps.create = jasmine.createSpy().andReturn(mockPPS);

            pps.readPPSObject('ppsname', success, fail);
            expect(fail).toHaveBeenCalled();
            expect(success).not.toHaveBeenCalled();
        });

        it("can fail when the pps cannot be created", function () {
            var success = jasmine.createSpy(),
                fail = jasmine.createSpy();

            GLOBAL.window.qnx.webplatform.pps.create = jasmine.createSpy().andReturn(null);

            pps.readPPSObject('ppsname', success, fail);
            expect(fail).toHaveBeenCalled();
            expect(success).not.toHaveBeenCalled();
        });
    });
});
