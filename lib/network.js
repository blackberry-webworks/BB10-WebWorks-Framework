/*
 *  Copyright 2012 Research In Motion Limited.
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

//Wrapping PPSUtils as PPSReader in order to keep our code aligned with the browser code
//Eventually this code will go in webplaform, so having them aligned will help this transition.
var ppsReader = {
        read: function (pathToPPS, callback) {
            var ppsUtils = require("../lib/pps/ppsUtils"),
                ppsObj = ppsUtils.createObject(),
                result = {
                    data: {}
                },
                ppsData;
                
            try {
                ppsObj.init();
                if (ppsObj.open(pathToPPS, "0")) {
                    ppsData = ppsObj.read();
                    if (ppsData) {
                        result.data = ppsData;
                    }
                }
            } finally {
                ppsObj.close();
            }
            
            callback(result);
        }
    },
    self;

var NETWORK_INTERFACE_ROOT = '/pps/services/networking/interfaces/',
    NETWORK_INTERFACES = ['rndis0', 'ecm0', 'ti0', 'ppp0']; // In order of precedence.

function handleNetworkStatusForInterface(networkInterface) {
    var ipAddresses = networkInterface.data.ip_addresses;
    if (ipAddresses && ipAddresses.length === 2) {
        // The ip addresses are returned in an array of the format:
        // [ 'ipv4Address/subnet', 'ipv6Address%interface/subnet' ]
        // so we trim them down here for the convenience of the caller.
        return {
            ipv4Address: ipAddresses[0].substr(0, ipAddresses[0].indexOf('/')),
            ipv6Address: ipAddresses[1].substr(0, ipAddresses[1].indexOf('%')),
        };
    }
}

function getNetworkStatusForInterface(i, callback) {
    if (i < NETWORK_INTERFACES.length) {
        ppsReader.read(NETWORK_INTERFACE_ROOT + NETWORK_INTERFACES[i], function (networkInterface) {
            var networkStatus = handleNetworkStatusForInterface(networkInterface);
            if (networkStatus) {
                callback(networkStatus);
                return;
            }

            getNetworkStatusForInterface(++i, callback);
        });
    } else {
        callback();
    }
}

self = {
    getNetworkStatus : function (callback) {
        if (callback) {
            getNetworkStatusForInterface(0, callback);
        }
    }
};

module.exports = self;
