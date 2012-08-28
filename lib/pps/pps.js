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

function readPPSObject(path, success, fail) {
    var ppsObj = window.qnx.webplatform.pps.create(path, window.qnx.webplatform.pps.PPSMode.FULL);

    if (ppsObj) {
        ppsObj.onFirstReadComplete = function (data) {
            ppsObj.close();
            success(data);
        };

        if (!ppsObj.open(window.qnx.webplatform.pps.FileMode.RDONLY)) {
            fail(-1, "Failed to open PPS object");
        } 
    } else {
        fail(-1, "Failed to create PPS object");
    }
}

module.exports = {
    readPPSObject: readPPSObject
};