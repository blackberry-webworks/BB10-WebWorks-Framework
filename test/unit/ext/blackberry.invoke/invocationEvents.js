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

var _apiDir = __dirname + "./../../../../ext/blackberry.invoke/",
    _libDir = __dirname + "./../../../../lib/",
    invocationEvents = require(_apiDir + "invocationEvents"),
    mockedInvocation;

describe("blackberry.invoke invocationEvents", function () {
    beforeEach(function () {
        mockedInvocation = {
            addEventListener: jasmine.createSpy("invocation addEventListener"),
            removeEventListener: jasmine.createSpy("invocation removeEventListener")
        };
        GLOBAL.window = {};
        GLOBAL.window.qnx = {
            webplatform: {
                getApplication: function () {
                    return {
                        invocation: mockedInvocation
                    };
                }
            }
        };
    });

    afterEach(function () {
        mockedInvocation = null;
        GLOBAL.qnx = null;
    });

    describe("addEventListener", function () {
        var trigger = function () {};

        it("calls framework setOnInvoked for 'invoked' event", function () {
            invocationEvents.addEventListener("invoked", trigger);
            expect(mockedInvocation.addEventListener).toHaveBeenCalledWith("Invoked", trigger);
        });
    });

    describe("removeEventListener", function () {
        var trigger = function () {};

        it("calls framework setOnInvoked for 'invoked' event", function () {
            invocationEvents.removeEventListener("invoked", trigger);
            expect(mockedInvocation.removeEventListener).toHaveBeenCalledWith("Invoked", trigger);
        });
    });
});
