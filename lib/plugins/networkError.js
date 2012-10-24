/*
 * Copyright 2010-2012 Research In Motion Limited.
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

var _eventHandlers = require('../eventHandlers');

module.exports = {
    response: function (request, succ, fail, args, env) {
        // Return a result to the actual eventHandlers.js file
        var cached = args.split("=")[1];
        _eventHandlers.networkCacheResponse(cached);
    }
};
