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
var _libDir = __dirname + "/../../../lib/",
    ppsUtils,
    network = require(_libDir + "network"),
    mockedPPS,
    mode = "0";

function testNetworkStatus(pathToPPS) {
    var callback = jasmine.createSpy();

    mockedPPS.open = jasmine.createSpy().andCallFake(function (path) {
        return pathToPPS === path;
    });
    
    spyOn(ppsUtils, "createObject").andReturn(mockedPPS);
    network.getNetworkStatus(callback);

    expect(mockedPPS.init).toHaveBeenCalled();
    expect(mockedPPS.open).toHaveBeenCalledWith(pathToPPS, mode);
    expect(mockedPPS.read).toHaveBeenCalledWith();
    expect(mockedPPS.close).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith({
        ipv4Address: "169.254.0.1",
        ipv6Address: "fe80::8060:7ff:feed:2389",
    });
}
    
describe("network.js", function () {
    beforeEach(function () {
        GLOBAL.JNEXT = {};
        ppsUtils = require(_libDir + "pps/ppsUtils");
        mockedPPS = {
            init: jasmine.createSpy(),
            open: jasmine.createSpy().andReturn(true),
            read: jasmine.createSpy().andCallFake(function () {
                return {"ip_addresses": ["169.254.0.1/255.255.255.252", "fe80::8060:7ff:feed:2389%rndis0/ffff:ffff:ffff:ffff::"]};
            }),
            close: jasmine.createSpy()
        };
    });

    afterEach(function () {
        GLOBAL.JNEXT = null;
        ppsUtils = null;
        mockedPPS = null;
    });

    describe("getNetworkStatus", function () {
        it("can get the network information for rndis0(usb) connections", function () {
            testNetworkStatus('/pps/services/networking/interfaces/rndis0');
        });
        
        it("can get the network information for ecm0 connections", function () {
            testNetworkStatus('/pps/services/networking/interfaces/ecm0');
        });
        
        it("can get the network information for ti0 connections", function () {
            testNetworkStatus('/pps/services/networking/interfaces/ti0');
        });
        
        it("can get the network information for ppp0 connections", function () {
            testNetworkStatus('/pps/services/networking/interfaces/ppp0');
        });
    });
});