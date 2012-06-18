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
var _ID = "blackberry.device",
    _extDir = __dirname + "./../../../../ext",
    _apiDir = _extDir + "/" + _ID,
    client,
    mockedWebworks = {},
    fields = [
        "hardwareId",
		"softwareVersion"
    ],
    execSyncArgs = [];

beforeEach(function () {
    GLOBAL.window = GLOBAL;

    
});

afterEach(function () {
    execSyncArgs = [];
    delete GLOBAL.window;
});

function unloadClient() {
    // explicitly unload client for it to be loaded again
    delete require.cache[require.resolve(_apiDir + "/client")];
    client = null;
}

describe("blackberry.device client", function () {
        beforeEach(function () {
			fields.forEach(function (field) {
				execSyncArgs.push([_ID, field, null]);
			});
            mockedWebworks.execSync = jasmine.createSpy().andReturn(null);
            mockedWebworks.defineReadOnlyField = jasmine.createSpy();
            GLOBAL.window.webworks = mockedWebworks;
            // client needs to be required for each test
            client = require(_apiDir + "/client");
        });

        afterEach(unloadClient);

        it("execSync should have been called once for each blackberry.device field", function () {
            expect(mockedWebworks.execSync.callCount).toEqual(fields.length);
        });

        it("hardwareid", function () {
            expect(mockedWebworks.execSync.argsForCall).toContain(execSyncArgs[fields.indexOf("hardwareId")]);
        });				
		
		it("version", function () {            
			expect(mockedWebworks.execSync.argsForCall).toContain(execSyncArgs[fields.indexOf("softwareVersion")]);            
        });
		
		//TODO is there a way to do this? Seems like toHaveBeenCalledWith only work is the function is called once
		//it("readonly fields set", function () {            
		//	expect(mockedWebworks.defineReadOnlyField).toHaveBeenCalledWith(client, "hardwareid", somevalue);
		//	expect(mockedWebworks.defineReadOnlyField).toHaveBeenCalledWith(client, "version", somevalue);
        //});
	}
);