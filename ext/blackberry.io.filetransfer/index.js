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

var filetransfer,
    _event = require("../../lib/event");

module.exports = {
    upload: function (success, fail, args, env) {
        var key,
            key2,
            params = {
                "_eventId": "",
                "filePath": "",
                "server": "",
                "options": {
                    "fileKey": "file",
                    "fileName": "image.jpg",
                    "mimeType": "image/jpeg",
                    "params": {},
                    "chunkedMode": true,
                    "chunkSize": 1024
                }
            },
            undefined_params = [];

        // decodeURI and check for null value params
        for (key in args) {
            args[key] = JSON.parse(decodeURIComponent(args[key]));
            if (!args[key]) {
                undefined_params.push(key);
            }
        }

        // validate params
        if (undefined_params.length !== 0) {
            fail(-1, undefined_params + (undefined_params.length === 1 ? " is " : " are ") + "null");
            return;
        }

        if (args.options && args.options.chunkSize <= 0) {
            fail(-1, "chunkSize must be a postive number");
            return;
        }

        // set user defined args into params
        for (key in args) {
            if (args[key]) {
                if (key === "options") {
                    for (key2 in args[key]) {
                        params[key][key2] = args[key][key2];
                    }
                } else {
                    params[key] = args[key];
                }
            }
        }

        filetransfer.upload(params);
        success();
    }
};


///////////////////////////////////////////////////////////////////
// JavaScript wrapper for JNEXT plugin
///////////////////////////////////////////////////////////////////

JNEXT.FileTransfer = function () {   
    var self = this;

    self.upload = function (args) {  
        return JNEXT.invoke(self.m_id, "upload " + JSON.stringify(args));
    };

    self.getId = function () {
        return self.m_id;
    };

    self.onEvent = function (strData) {
        var arData = strData.split(" ", 7),
            _eventId = arData[0],
            strEventDesc = arData[1],
            strEventResult = arData[2],
            args = {};

        if (strEventDesc === "upload") {
            if (strEventResult === "success") {
                args.result = strEventResult;
                args.bytesSent = arData[3];
                args.responseCode = arData[4];
                args.response = escape(strData.split(" ").slice(5).join(" "));
            } else if (strEventResult === "error") { 
                args.result = strEventResult;
                args.code = arData[3];
                args.source = unescape(arData[4]);
                args.target = unescape(arData[5]);
                args.http_status = arData[6];
            }

            _event.trigger(_eventId, args);
        }
    };

    self.init = function () {
        if (!JNEXT.require("filetransfer")) {   
            return false;
        }

        self.m_id = JNEXT.createObject("filetransfer.FileTransfer");
        
        if (self.m_id === "") {   
            return false;
        }

        JNEXT.registerEvents(self);
    };
    
    self.m_id = "";

    self.init();
};

filetransfer = new JNEXT.FileTransfer();