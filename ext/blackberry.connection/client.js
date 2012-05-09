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
var _self = {},
    _ID = "blackberry.connection",
    UNKNOWN = 0;

Object.defineProperty(_self, "type", {
    get: function () {
        var type;

        try {
            type = window.webworks.execSync(_ID, "type");
        } catch (e) {
            type = UNKNOWN;
            console.error(e);
        }

        return type;
    }
});

/*
 * Define constants for type constants
 */
window.webworks.defineReadOnlyField(_self, "UNKNOWN", UNKNOWN);
window.webworks.defineReadOnlyField(_self, "ETHERNET", 1);
window.webworks.defineReadOnlyField(_self, "WIFI", 2);
window.webworks.defineReadOnlyField(_self, "BLUETOOTH_DUN", 3);
window.webworks.defineReadOnlyField(_self, "USB", 4);
window.webworks.defineReadOnlyField(_self, "VPN", 5);
window.webworks.defineReadOnlyField(_self, "BB", 6);
window.webworks.defineReadOnlyField(_self, "CELLULAR", 7);
window.webworks.defineReadOnlyField(_self, "NONE", 8);

module.exports = _self;
