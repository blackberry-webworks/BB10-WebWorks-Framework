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
var onSuccess,
    onError,
    onSuccessFlag,
    onErrorFlag,
    delay = 750;

describe("blackberry.invoke", function () {
    beforeEach(function () {
        spyOn(window.webworks.event, 'isOn').andReturn(false);
        onSuccessFlag = false;
        onErrorFlag = false;
        onSuccess = jasmine.createSpy("success callback").andCallFake(
            function () {
                onSuccessFlag = true;
            });
        onError = jasmine.createSpy("error callback").andCallFake(
            function () {
                onErrorFlag = true;
            });
    });

    afterEach(function () {
        onSuccess = null;
        onError = null;
        onSuccessFlag = false;
        onErrorFlag = false;
    });

    it('blackberry.invoke should exist', function () {
        expect(blackberry.invoke).toBeDefined();
    });

    describe("Cards", function () {
        var request = {
                target: "net.rim.webworks.invoke.invoke.card.type",
            },
            onChildCardClosed,
            onChildCardStartPeek,
            onChildCardEndPeek;

        beforeEach(function () {
            onChildCardClosed = jasmine.createSpy("onChildCardClosed event");
            onChildCardStartPeek = jasmine.createSpy("onChildCardStartPeek event");
            onChildCardEndPeek = jasmine.createSpy("onChildCardEndPeek event");
            blackberry.event.addEventListener("onChildCardClosed", onChildCardClosed);
            blackberry.event.addEventListener("onChildCardStartPeek", onChildCardStartPeek);
            blackberry.event.addEventListener("onChildCardEndPeek", onChildCardEndPeek);
        });

        afterEach(function () {
            onChildCardClosed = null;
            onChildCardStartPeek = null;
            onChildCardEndPeek = null;
            blackberry.event.removeEventListener("onChildCardClosed", onChildCardClosed);
            blackberry.event.removeEventListener("onChildCardStartPeek", onChildCardStartPeek);
            blackberry.event.removeEventListener("onChildCardEndPeek", onChildCardEndPeek);
        });


        it('invoke should receive onChildCardClosed event when child card was closed', function () {
            request.target = "net.rim.webworks.invoke.invoke.card.type";

            alert("To get onChildCardClosed event this test will invoke card and close it without user interaction.");

            try {
                blackberry.invoke.invoke(request, onSuccess, onError);
            } catch (e) {
                console.log(e);
            }

            waitsFor(function () {
                return onSuccessFlag || onErrorFlag;
            }, "The callback flag should be set to true", delay);

            runs(function () {
                expect(onSuccessFlag).toEqual(true);
                if (onSuccessFlag) {
                    waits(delay);

                    runs(function () {
                        blackberry.invoke.closeChildCard();
                        waits(delay);

                        runs(function () {
                            expect(onChildCardClosed).toHaveBeenCalled();
                        });
                    });
                }
            });
        });

        it('invoke should receive onChildCardStartPeek event when child card was picked', function () {
            request.target = "net.rim.webworks.invoke.invoke.card.type";

            alert("To get onChildCardStartPeek event when card invoked you'll need to press peek then peek it and close if appropriate.");

            try {
                blackberry.invoke.invoke(request, onSuccess, onError);
            } catch (e) {
                console.log(e);
            }

            waitsFor(function () {
                return onSuccessFlag || onErrorFlag;
            }, "The callback flag should be set to true", delay);

            runs(function () {
                expect(onSuccessFlag).toEqual(true);
                if (onSuccessFlag) {
                    waits(delay * 5);

                    runs(function () {
                        expect(onChildCardStartPeek).toHaveBeenCalled();
                    });
                }
            });
        });

        it('invoke should receive onChildCardEndPeek event when child card was picked', function () {
            request.target = "net.rim.webworks.invoke.invoke.card.type";

            alert("To get onChildCardEndPeek event when card invoked you'll need to press peek then peek it and close if appropriate.");

            try {
                blackberry.invoke.invoke(request, onSuccess, onError);
            } catch (e) {
                console.log(e);
            }

            waitsFor(function () {
                return onSuccessFlag || onErrorFlag;
            }, "The callback flag should be set to true", delay);

            runs(function () {
                expect(onSuccessFlag).toEqual(true);
                if (onSuccessFlag) {
                    waits(delay * 5);

                    runs(function () {
                        expect(onChildCardEndPeek).toHaveBeenCalled();
                    });
                }
            });
        });
    });
});
