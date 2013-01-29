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
var MessageFindOptions;

MessageFindOptions = function (args) {
    args = args || {};
    this.account = args.account || null;
    this.folder = args.folder || null;
    this.filter = args.filter || null;
    this.offset = args.offset || 0;
    this.limit = args.limit || -1;
};

MessageFindOptions.prototype.getJSON = function () {
    return {
        'accountId': (this.account ? this.account.id : ""),
        'folder': (this.folder ? this.folder.getJSON() : ""),
        'filter': (this.filter ? this.filter.getJSON() : ""),
        'offset': this.offset,
        'limit': this.limit
    };
};

module.exports = MessageFindOptions;