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
var _apiDir = __dirname + "./../../../../ext/blackberry.push/",
    _libDir = __dirname + "./../../../../lib/",
    successCB,
    failCB,
    args = {},
    index;

describe("blackberry.push index", function () {
    beforeEach(function () {
        GLOBAL.JNEXT = {
            require: jasmine.createSpy().andReturn(true),
            createObject: jasmine.createSpy().andReturn("1"),
            invoke: jasmine.createSpy().andReturn(2),
            registerEvents: jasmine.createSpy().andReturn(true)
        };
        
        successCB = jasmine.createSpy();
        failCB = jasmine.createSpy();
        index = require(_apiDir + "index");
    });

    afterEach(function () {
        GLOBAL.JNEXT = null;
        index = null;
    });

    it("makes sure that JNEXT is initalized", function () {
        expect(GLOBAL.JNEXT.require).toHaveBeenCalled();
    });

    it("makes sure that JNEXT startService called properly", function () {        
        index.startService(successCB, failCB, args);
        
        expect(GLOBAL.JNEXT.invoke).toHaveBeenCalled();
        expect(successCB).toHaveBeenCalledWith(2);
    });

    it("makes sure that JNEXT createChannel called properly", function () {        
        index.createChannel(successCB, failCB, args);
        
        expect(GLOBAL.JNEXT.invoke).toHaveBeenCalled();
        expect(successCB).toHaveBeenCalledWith(2);
    });

    it("makes sure that JNEXT destroyChannel called properly", function () {        
        index.destroyChannel(successCB, failCB, args);
        
        expect(GLOBAL.JNEXT.invoke).toHaveBeenCalled();
        expect(successCB).toHaveBeenCalledWith(2);
    });

    it("makes sure that JNEXT extractPushPayload called properly", function () {        
        index.extractPushPayload(successCB, failCB, args);
        
        expect(GLOBAL.JNEXT.invoke).toHaveBeenCalled();
        expect(successCB).toHaveBeenCalledWith(2);
    });

    it("makes sure that JNEXT launchApplicationOnPush called properly", function () {        
        index.launchApplicationOnPush(successCB, failCB, args);
        
        expect(GLOBAL.JNEXT.invoke).toHaveBeenCalled();
        expect(successCB).toHaveBeenCalledWith(2);
    });

    it("makes sure that JNEXT acknowledge called properly", function () {        
        index.acknowledge(successCB, failCB, args);
        
        expect(GLOBAL.JNEXT.invoke).toHaveBeenCalled();
        expect(successCB).toHaveBeenCalledWith(2);
    });
});
