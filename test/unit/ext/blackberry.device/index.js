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
var _apiDir = __dirname + "./../../../../ext/blackberry.device/",
    _libDir = __dirname + "./../../../../lib/",
    index,
    ppsUtils,
    mockedPPS,
    path = "/pps/services/deviceproperties",
    mode = "0";

describe("blackberry.device index", function () {
    beforeEach(function () {
        GLOBAL.JNEXT = {};
        ppsUtils = require(_libDir + "pps/ppsUtils");
        index = require(_apiDir + "index");
        mockedPPS = {
            init: jasmine.createSpy(),
            open: jasmine.createSpy().andReturn(true),
            read: jasmine.createSpy().andReturn({"hardwareid" : "0x8500240a", "scmbundle" : "10.0.6.99"}),
            close: jasmine.createSpy()
        };
    });

    afterEach(function () {
        GLOBAL.JNEXT = null;
        ppsUtils = null;
        index = null;
        mockedPPS = null;
    });
    
	it("can call fail if failed to open PPS object for hardwareId", function () {		
		var fail = jasmine.createSpy();

		mockedPPS.open = jasmine.createSpy().andReturn(false);
		spyOn(ppsUtils, "createObject").andReturn(mockedPPS);

		index.hardwareId(null, fail, null, null);

		expect(mockedPPS.init).toHaveBeenCalled();
		expect(mockedPPS.open).toHaveBeenCalledWith(path, mode);
		expect(mockedPPS.read).not.toHaveBeenCalled();
		expect(mockedPPS.close).toHaveBeenCalled();            
		expect(fail).toHaveBeenCalledWith(-1, jasmine.any(String));
	});

	it("can call fail if failed to open PPS object for softwareVersion", function () {		
		var fail = jasmine.createSpy();

		mockedPPS.open = jasmine.createSpy().andReturn(false);
		spyOn(ppsUtils, "createObject").andReturn(mockedPPS);

		index.softwareVersion(null, fail, null, null);

		expect(mockedPPS.init).toHaveBeenCalled();
		expect(mockedPPS.open).toHaveBeenCalledWith(path, mode);
		expect(mockedPPS.read).not.toHaveBeenCalled();
		expect(mockedPPS.close).toHaveBeenCalled();            
		expect(fail).toHaveBeenCalledWith(-1, jasmine.any(String));
	});

	it("can call success with hardwareid", function () {
		var success = jasmine.createSpy();

		spyOn(ppsUtils, "createObject").andReturn(mockedPPS);

		index.hardwareId(success, null, null, null);

		expect(mockedPPS.init).toHaveBeenCalled();
		expect(mockedPPS.open).toHaveBeenCalledWith(path, mode);
		expect(mockedPPS.read).toHaveBeenCalled();
		expect(mockedPPS.close).toHaveBeenCalled();
		expect(success).toHaveBeenCalledWith("0x8500240a");
	});			
	
	it("can call success with softwareVersion", function () {
		var success = jasmine.createSpy();

		spyOn(ppsUtils, "createObject").andReturn(mockedPPS);

		index.softwareVersion(success, null, null, null);

		// The PPS objects should have been init in the test above; once the PPS has been read it is cached
		expect(mockedPPS.init).not.toHaveBeenCalled();
		expect(mockedPPS.open).not.toHaveBeenCalledWith(path, mode);
		expect(mockedPPS.read).not.toHaveBeenCalled();
		expect(mockedPPS.close).not.toHaveBeenCalled();
		expect(success).toHaveBeenCalledWith("10.0.6.99");
	});			
});