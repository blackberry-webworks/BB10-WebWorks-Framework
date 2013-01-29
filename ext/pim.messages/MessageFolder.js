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
var MesssageFolder,
    Type;

MesssageFolder = function (args) {
    args = args || {};
    Object.defineProperty(this, "id", { "value": "" + args.id });
    this.name = args.name;
    this.type = args.type;
};

MesssageFolder.prototype.getJSON = function () {
    return {
        'id': this.id,
        'name': this.name,
        'type': this.type,
    };
};

MesssageFolder.getArrayOfObjectsFromArrayOfJSONs = function (folders) {
    var foldersArray = [];

    if (folders) {
        folders.forEach(function (folder) {
            foldersArray.push(new MesssageFolder(folder));
        });
    }

    return foldersArray;
};

MesssageFolder.getArrayOfJSONsFromArrayOfObjects = function (folders) {
    var jsonsArray = [];

    if (folders) {
        folders.forEach(function (folder) {
            jsonsArray.push(folder.getJSON());
        });
    }

    return jsonsArray;
};

Type = function () {
};
Object.defineProperty(Type, "Unknown", {"value": 0});
Object.defineProperty(Type, "Inbox", {"value": 1});
Object.defineProperty(Type, "Outbox", {"value": 2});
Object.defineProperty(Type, "Drafts", {"value": 3});
Object.defineProperty(Type, "Sent", {"value": 4});
Object.defineProperty(Type, "Trash", {"value": 5});
Object.defineProperty(Type, "Other", {"value": 6});

MesssageFolder.Type = Type;

module.exports = MesssageFolder;