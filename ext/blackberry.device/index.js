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
var _ppsUtils = require("../../lib/pps/ppsUtils"),
	_deviceprops;

/*
 * Read the PPS object once and cache it for future calls
 */	
function readDeviceProperties () {
    var PPSUtils = _ppsUtils.createObject();

    PPSUtils.init();

    if (PPSUtils.open("/pps/services/deviceproperties", "0")) {
        _deviceprops = PPSUtils.read();
    }   

    PPSUtils.close();
}

module.exports = {
    hardwareid: function (success, fail, args, env) {
		if (!_deviceprops) {
			readDeviceProperties();          
		}   

		if (_deviceprops) {
			success(_deviceprops.hardwareid);
		} else {
			fail(-1, "Cannot open PPS object");
		}
    },		
	
	version: function (success, fail, args, env) {        
		if (!_deviceprops) {
			readDeviceProperties();          
		}   

		if (_deviceprops) {
			success(_deviceprops.scmbundle);
		} else {
			fail(-1, "Cannot open PPS object");
		}
    }
};