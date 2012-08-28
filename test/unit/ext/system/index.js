/*
 * Copyright 2011-2012 Research In Motion Limited.
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

var libDir = __dirname + "./../../../../lib/",
    extDir = __dirname + "./../../../../ext/",
    ID = "system",
    apiDir = extDir + ID + "/",
    Whitelist = require(libDir + "policy/whitelist").Whitelist,
    events = require(libDir + "event"),
    eventExt = require(extDir + "event/index"),
    utils = require(libDir + "utils"),
    sysIndex,
    successCB,
    failCB;

beforeEach(function () {
    GLOBAL.JNEXT = {};
    sysIndex = require(apiDir + "index");
});

afterEach(function () {
    delete GLOBAL.JNEXT;
    sysIndex = null;
});

describe("system index", function () {
    it("hasPermission", function () {
        var success = jasmine.createSpy(),
            env = {
                "request": {
                    "origin": "blah"
                },
                "response": {
                }
            };

        spyOn(Whitelist.prototype, "isFeatureAllowed").andReturn(true);

        sysIndex.hasPermission(success, undefined, {"module": "blackberry.system"}, env);

        expect(Whitelist.prototype.isFeatureAllowed).toHaveBeenCalled();
        expect(success).toHaveBeenCalledWith(0);
    });

    it("hasCapability", function () {
        var success = jasmine.createSpy();

        sysIndex.hasCapability(success, undefined, {"capability": "network.wlan"}, undefined);

        expect(success).toHaveBeenCalledWith(true);
    });

    describe("battery events", function () {
        beforeEach(function () {
            successCB = jasmine.createSpy("Success Callback");
            failCB = jasmine.createSpy("Fail Callback");
            spyOn(utils, "loadExtensionModule").andCallFake(function () {
                return eventExt;
            });
        });

        afterEach(function () {
            successCB = null;
            failCB = null;
        });

        it("responds to 'batterycritical' events", function () {
            var eventName = "batterycritical",
                args = {eventName : encodeURIComponent(eventName)}; 
            spyOn(events, "add");
            sysIndex.registerEvents(jasmine.createSpy());
            eventExt.add(null, null, args);
            expect(events.add).toHaveBeenCalled();
            expect(events.add.mostRecentCall.args[0].event.eventName).toEqual(eventName);
            expect(events.add.mostRecentCall.args[0].trigger).toEqual(jasmine.any(Function));
        });

        it("removes 'batterycritical' events", function () {
            var eventName = "batterycritical",
                args = {eventName : encodeURIComponent(eventName)}; 
            spyOn(events, "remove");
            eventExt.remove(null, null, args);
            expect(events.remove).toHaveBeenCalled();
            expect(events.remove.mostRecentCall.args[0].event.eventName).toEqual(eventName);
        });

        it("responds to 'batterylow' events", function () {
            var eventName = "batterylow",
                args = {eventName : encodeURIComponent(eventName)}; 
            spyOn(events, "add");
            sysIndex.registerEvents(jasmine.createSpy());
            eventExt.add(null, null, args);
            expect(events.add).toHaveBeenCalled();
            expect(events.add.mostRecentCall.args[0].event.eventName).toEqual(eventName);
            expect(events.add.mostRecentCall.args[0].trigger).toEqual(jasmine.any(Function));
        });

        it("removes 'batterylow' events", function () {
            var eventName = "batterylow",
                args = {eventName : encodeURIComponent(eventName)}; 
            spyOn(events, "remove");            
            eventExt.remove(null, null, args);
            expect(events.remove).toHaveBeenCalled();
            expect(events.remove.mostRecentCall.args[0].event.eventName).toEqual(eventName);
        });

        it("responds to 'batterystatus' events", function () {
            var eventName = "batterystatus",
                args = {eventName: encodeURIComponent(eventName)};
                 
            spyOn(events, "add");
            sysIndex.registerEvents(jasmine.createSpy());
            eventExt.add(successCB, failCB, args);
            expect(events.add).toHaveBeenCalled();
            expect(events.add.mostRecentCall.args[0].event.eventName).toEqual(eventName);
            expect(events.add.mostRecentCall.args[0].trigger).toEqual(jasmine.any(Function));
            expect(successCB).toHaveBeenCalled();
            expect(failCB).not.toHaveBeenCalled();            
        });

        it("removes 'batterystatus' events", function () {
            var eventName = "batterystatus",
                args = {eventName: encodeURIComponent(eventName)}; 

            spyOn(events, "remove");
            eventExt.remove(successCB, failCB, args);
            expect(events.remove).toHaveBeenCalled();
            expect(events.remove.mostRecentCall.args[0].event.eventName).toEqual(eventName);
            expect(successCB).toHaveBeenCalled();            
            expect(failCB).not.toHaveBeenCalled();            
        });

        it("invokes success callback when battery event name with not defined", function () {
            var eventName = "batteryeventnotdefined",
                args = {eventName: encodeURIComponent(eventName)};
                 
            spyOn(events, "add");
            sysIndex.registerEvents(jasmine.createSpy());
            eventExt.add(successCB, failCB, args);
            expect(events.add).toHaveBeenCalled();
            expect(successCB).toHaveBeenCalled();            
            expect(failCB).not.toHaveBeenCalled();            
        });

        it("invokes success callback when tring to remove battery event with name not defined", function () {
            var eventName = "batteryeventnotdefined",
                args = {eventName: encodeURIComponent(eventName)};
                 
            spyOn(events, "remove");
            eventExt.remove(successCB, failCB, args);
            expect(events.remove).toHaveBeenCalled();
            expect(successCB).toHaveBeenCalled();            
            expect(failCB).not.toHaveBeenCalled();            
        });
        
        it("invokes fail callback when exception occured", function () {
            var eventName = "batteryeventnotdefined",
                args = {eventName: encodeURIComponent(eventName)};
                 
            spyOn(events, "add").andCallFake(function () {
                throw "";
            });
            
            sysIndex.registerEvents(jasmine.createSpy());            
            eventExt.add(successCB, failCB, args);
            expect(events.add).toHaveBeenCalled();
            expect(successCB).not.toHaveBeenCalled();            
            expect(failCB).toHaveBeenCalledWith(-1, jasmine.any(String));
        });

        it("invokes fail callback when exception occured", function () {
            var eventName = "batteryeventnotdefined",
                args = {eventName: encodeURIComponent(eventName)};
                 
            spyOn(events, "remove").andCallFake(function () {
                throw "";
            });
            eventExt.remove(successCB, failCB, args);
            expect(events.remove).toHaveBeenCalled();
            expect(successCB).not.toHaveBeenCalled();            
            expect(failCB).toHaveBeenCalledWith(-1, jasmine.any(String));
        });
    });
    
    /*
        Helpers for device property tests
     */
    function failDevicePropertiesHelper(prop) {
        var fail = jasmine.createSpy(),
            mockPPS = {
                open: jasmine.createSpy().andReturn(false),
                close: jasmine.createSpy()
            };

        window.qnx.webplatform.pps.create = jasmine.createSpy().andReturn(mockPPS);

        sysIndex[prop](null, fail, null, null);

        expect(mockPPS.open).toHaveBeenCalledWith(window.qnx.webplatform.pps.FileMode.RDONLY);
        expect(fail).toHaveBeenCalledWith(-1, jasmine.any(String));
    }

    function successDevicePropertiesHelper(prop, readObj, expectedValue) {
        var success = jasmine.createSpy(),
            mockPPS = {
                open: jasmine.createSpy().andReturn(true),
                close: jasmine.createSpy()
            };

        window.qnx.webplatform.pps.create = jasmine.createSpy().andReturn(mockPPS);

        sysIndex[prop](success, null, null, null);

        expect(mockPPS.onFirstReadComplete).toBeDefined();
        mockPPS.onFirstReadComplete(readObj);

        expect(mockPPS.open).toHaveBeenCalledWith(window.qnx.webplatform.pps.FileMode.RDONLY);
        expect(mockPPS.close).toHaveBeenCalled();            
        expect(success).toHaveBeenCalledWith(expectedValue);
    }

    describe("device properties", function () {
        var pps = require(libDir + "pps/pps");

        beforeEach(function () {
            sysIndex = require(apiDir + "index");

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
            sysIndex = null;
        });

        it("can call fail if failed to open PPS object for hardwareId", function () {
            failDevicePropertiesHelper('hardwareId');
        });

        it("can call fail if failed to open PPS object for softwareVersion", function () {
            failDevicePropertiesHelper('softwareVersion');
        });

        it("can call success with hardwareId", function () {
            successDevicePropertiesHelper('hardwareId', {
                deviceproperties: {
                    hardwareid: "0x8500240a"
                }
            }, "0x8500240a");
        });

        it("can call success with softwareVersion", function () {
            successDevicePropertiesHelper('softwareVersion', {
                deviceproperties: {
                    scmbundle: "10.0.6.99"
                }
            }, "10.0.6.99");
        });
    });

    describe("device language", function () {
        var pps = require(libDir + 'pps/pps');

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

            sysIndex = require(apiDir + "index");
        });

        afterEach(function () {
            GLOBAL.window = null;
            sysIndex = null;
        });

        it("can call fail if failed to open PPS object for language", function () {
            failDevicePropertiesHelper('language');
        });

        it("can call success with language", function () {
            successDevicePropertiesHelper('language', {
                _CS_LOCALE: "en_US"
            }, "en_US");
        });
    });

    describe("device region", function () {
        var pps = require(libDir + 'pps/pps');

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
            sysIndex = null;
        });

        it("can call fail if failed to open PPS object for region", function () {
            failDevicePropertiesHelper('region');
        });

        it("can call success with region", function () {
            successDevicePropertiesHelper('region', {
                region: 'en_US'
            }, 'en_US');
        });
    });

    describe("languagechanged event", function () {
        beforeEach(function () {
            successCB = jasmine.createSpy("Success Callback");
            failCB = jasmine.createSpy("Fail Callback");
            spyOn(utils, "loadExtensionModule").andCallFake(function () {
                return eventExt;
            });
        });

        afterEach(function () {
            successCB = null;
            failCB = null;
        });

        it("responds to 'languagechanged' events", function () {
            var eventName = "languagechanged",
                args = {eventName : encodeURIComponent(eventName)};
            spyOn(events, "add");
            sysIndex.registerEvents(jasmine.createSpy());
            eventExt.add(null, null, args);
            expect(events.add).toHaveBeenCalled();
            expect(events.add.mostRecentCall.args[0].event.eventName).toEqual(eventName);
            expect(events.add.mostRecentCall.args[0].trigger).toEqual(jasmine.any(Function));
        });

        it("removes 'languagechanged' event", function () {
            var eventName = "languagechanged",
                args = {eventName : encodeURIComponent(eventName)};
            spyOn(events, "remove");
            eventExt.remove(null, null, args);
            expect(events.remove).toHaveBeenCalled();
            expect(events.remove.mostRecentCall.args[0].event.eventName).toEqual(eventName);
        });
    });

    describe("regionchanged event", function () {
        beforeEach(function () {
            successCB = jasmine.createSpy("Success Callback");
            failCB = jasmine.createSpy("Fail Callback");
            spyOn(utils, "loadExtensionModule").andCallFake(function () {
                return eventExt;
            });
        });

        afterEach(function () {
            successCB = null;
            failCB = null;
        });

        it("responds to 'regionchanged' events", function () {
            var eventName = "regionchanged",
                args = {eventName : encodeURIComponent(eventName)};
            spyOn(events, "add");
            sysIndex.registerEvents(jasmine.createSpy());
            eventExt.add(null, null, args);
            expect(events.add).toHaveBeenCalled();
            expect(events.add.mostRecentCall.args[0].event.eventName).toEqual(eventName);
            expect(events.add.mostRecentCall.args[0].trigger).toEqual(jasmine.any(Function));
        });

        it("removes 'regionchanged' event", function () {
            var eventName = "regionchanged",
                args = {eventName : encodeURIComponent(eventName)};
            spyOn(events, "remove");
            eventExt.remove(null, null, args);
            expect(events.remove).toHaveBeenCalled();
            expect(events.remove.mostRecentCall.args[0].event.eventName).toEqual(eventName);
        });
    });
});
