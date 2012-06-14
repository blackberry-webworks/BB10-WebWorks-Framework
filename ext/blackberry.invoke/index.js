/*
 * Copyright 2010-2011 Research In Motion Limited.
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

var APP_URL_BROWSER = "http://",
    APP_TYPE_ERROR = "The application specified to invoke is not supported.",
    APP_TYPE_ERROR_ID = -1,
    APP_BROWSER_ERROR = "Please specify a fully qualified URL that starts with either the 'http://' or 'https://' protocol.",
    _event = require("./../../lib/event"),
    _eventExt = require("./../blackberry.event/index"),
    _actionMap = {
        invoked: {
            context: require("./invocationEvents"),
            event: "invoked",
            trigger: function () {
                var onInvokedInfo = JSON.parse(qnx.callExtensionMethod('invocation.invokeRequest'));
                _event.trigger("invoked", onInvokedInfo);
            }
        }
    };

module.exports = {
    invoke: function (success, fail, args) {
        var argsObj,
            url;

        switch (parseInt(args.appType, 10)) {
        // Camera
        case 4:
            fail(APP_TYPE_ERROR_ID, APP_TYPE_ERROR);
            return;
        // Maps
        case 5:
            fail(APP_TYPE_ERROR_ID, APP_TYPE_ERROR);
            return;
        //Browser
        case 11:            
            try {
                argsObj = JSON.parse(decodeURIComponent(args.args));
                
                if (!argsObj || !argsObj.url) {
                    url = APP_URL_BROWSER;
                }                       
                else {
                    url = argsObj.url.split("://");
                    
                    //No protocol given, append http protocol
                    if (url.length === 1) {
                        url = APP_URL_BROWSER + url[0];
                    }
                    else if (url.length === 2) {
                        //Check if protocol is supported: http, https
                        if (url[0].toLowerCase() !== "http" && url[0].toLowerCase() !== "https") {
                            fail(APP_TYPE_ERROR_ID, APP_BROWSER_ERROR);
                            return;
                        }                            

                        url = url[0].toLowerCase() + '://' + url[1];
                    }
                }
            } catch (e) {
                url = APP_URL_BROWSER;
            }       

            break;
        // Music
        case 13:
            fail(APP_TYPE_ERROR_ID, APP_TYPE_ERROR);
            return;
        //Photos
        case 14:
            fail(APP_TYPE_ERROR_ID, APP_TYPE_ERROR);
            return;
        //Videos
        case 15:
            fail(APP_TYPE_ERROR_ID, APP_TYPE_ERROR);
            return;
        // AppWorld
        case 16:
            fail(APP_TYPE_ERROR_ID, APP_TYPE_ERROR);
            return;
        default:
            fail(APP_TYPE_ERROR_ID, APP_TYPE_ERROR);
            return;
            
        }
        
        qnx.callExtensionMethod("navigator.invoke", url);
        
        success();
    },
    
    registerEvents: function (success, fail, args, env) {
        try {
            _eventExt.registerEvents(_actionMap);
            success();
        } catch (e) {
            fail(-1, e);
        }
    },

};
