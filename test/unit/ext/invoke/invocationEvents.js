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

var _apiDir = __dirname + "./../../../../ext/invoke/",
    _libDir = __dirname + "./../../../../lib/",
    invocationEvents,
    startupMode,
    mockedInvocation,
    trigger;

describe("invoke invocationEvents", function () {
    beforeEach(function () {
        mockedInvocation = {
            addEventListener: jasmine.createSpy("invocation addEventListener"),
            removeEventListener: jasmine.createSpy("invocation removeEventListener"),
        };
        GLOBAL.window = GLOBAL;
        GLOBAL.window.qnx = {
            webplatform: {
                getApplication: function () {
                    return {
                        invocation: mockedInvocation
                    };
                }
            }
        };

        //since multiple tests are requiring invocation events we must unrequire
        var name = require.resolve(_apiDir + "invocationEvents");
        delete require.cache[name];
        invocationEvents = require(_apiDir + "invocationEvents");
        trigger = function () {};
    });

    afterEach(function () {
        mockedInvocation = null;
        GLOBAL.window.qnx = null;
        trigger = null;
    });

    describe("onCardStartPeek", function () {
        it("add proper event to invocation for 'onCardStartPeek'", function () {
            invocationEvents.addEventListener("onCardStartPeek", trigger);
            expect(mockedInvocation.addEventListener).toHaveBeenCalledWith("cardPeekStarted", trigger);
        });

        it("remove proper event from invocation for 'onCardStartPeek", function () {
            invocationEvents.removeEventListener("onCardStartPeek", trigger);
            expect(mockedInvocation.removeEventListener).toHaveBeenCalledWith("cardPeekStarted", trigger);
        });
    });

    describe("onCardEndPeek", function () {
        it("add proper event to invocation for 'onCardEndPeek'", function () {
            invocationEvents.addEventListener("onCardEndPeek", trigger);
            expect(mockedInvocation.addEventListener).toHaveBeenCalledWith("cardPeekEnded", trigger);
        });

        it("remove proper event from invocation for 'onCardEndPeek", function () {
            invocationEvents.removeEventListener("onCardEndPeek", trigger);
            expect(mockedInvocation.removeEventListener).toHaveBeenCalledWith("cardPeekEnded", trigger);
        });
    });
    describe("onCardChildClosed", function () {
        it("add proper event to invocation for 'onCardChildClosed'", function () {
            invocationEvents.addEventListener("onCardChildClosed", trigger);
            expect(mockedInvocation.addEventListener).toHaveBeenCalledWith("childCardClosed", trigger);
        });

        it("remove proper event from invocation for 'onCardChildClosed", function () {
            invocationEvents.removeEventListener("onCardChildClosed", trigger);
            expect(mockedInvocation.removeEventListener).toHaveBeenCalledWith("childCardClosed", trigger);
        });
    });
});
