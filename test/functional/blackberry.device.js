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
function testDeviceValue(field) {
    expect(blackberry.device[field]).toBeDefined();
    expect(blackberry.device[field]).toEqual(jasmine.any(String));
    expect(blackberry.device[field]).not.toEqual("");
}

function testDeviceReadOnly(field) {
    var before = blackberry.device[field];
    blackberry.device[field] = "MODIFIED";
    expect(blackberry.device[field]).toEqual(before);
}

describe("blackberry.device", function () {
    it('blackberry.device.hardwareId should exist', function () {
        testDeviceValue("hardwareId");
    });

    it('blackberry.identity.hardwareId should be read-only', function () {
        testDeviceReadOnly("hardwareId");
    });

	it('blackberry.device.softwareVersion should exist', function () {
        testDeviceValue("softwareVersion");
    });

    it('blackberry.identity.softwareVersion should be read-only', function () {
        testDeviceReadOnly("softwareVersion");
    });

});
