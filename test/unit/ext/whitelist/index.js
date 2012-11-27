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
var EXT_DIR = __dirname + "./../../../../ext/",
    LIB_DIR = __dirname + "./../../../../lib/",
    _index = require(EXT_DIR + "whitelist/index"),
    _webkitOriginAccess = require(LIB_DIR + "policy/webkitOriginAccess");

describe("whitelist index", function () {

    describe("prepRequest function", function () {

        it("exists", function () {
            expect(_index.prepRequest).toBeDefined();
        });

        it("passes the url directly", function () {
            var success = jasmine.createSpy(),
                fail = jasmine.createSpy(),
                url = "ooogaBooga";
            spyOn(_webkitOriginAccess, "addOriginAccess");
            _index.prepRequest(success, fail, {url: encodeURIComponent(JSON.stringify(url))});
            expect(_webkitOriginAccess.addOriginAccess).toHaveBeenCalledWith(url, false);
        });
    });
});
