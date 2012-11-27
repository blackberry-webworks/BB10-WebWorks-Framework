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
var oldXHROpen = XMLHttpRequest.prototype.open,
    ID = require("./manifest.json").namespace,
    utils = require("./../../lib/utils"),
    requests = [];

function preCheck(url) {
    var parsedUrl = utils.parseUri(url),
        key = parsedUrl.scheme + "://" + parsedUrl.authority;
    if (requests.indexOf(key) === -1) {
        //Always add to requests first or suffer the infinite loop creating a request here
        requests.push(key);
        window.webworks.execSync(ID, "prepRequest", {url: parsedUrl.scheme + "://" + parsedUrl.authority});
    }

}

XMLHttpRequest.prototype.open = function () {
    var args = Array.prototype.slice.call(arguments);
    preCheck(args[1]);
    return oldXHROpen.apply(this, args);
};

