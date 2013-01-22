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
var _extDir = __dirname + "./../../../../ext",
    _apiDir = _extDir + "/payment",
    _ID = require(_apiDir + "/manifest").namespace,
    client,
    mockedWebworks;

describe("payment client", function () {
    beforeEach(function () {
        mockedWebworks = {
            execSync: jasmine.createSpy("execSync"),
            event: {
                once: jasmine.createSpy("once")
            }
        };
        GLOBAL.window = {
            webworks: mockedWebworks
        };
        delete require.cache[require.resolve(_apiDir + "/client")];
        client = require(_apiDir + "/client");
    });

    afterEach(function () {
        mockedWebworks = null;
        delete GLOBAL.window;
        client = null;
    });

    describe("developmentMode", function () {
        it("getting developmentMode should return value from execSync", function () {
            mockedWebworks.execSync = jasmine.createSpy("execSync").andReturn(false);
            expect(client.developmentMode).toEqual(false);
            expect(mockedWebworks.execSync).toHaveBeenCalledWith(_ID, "developmentMode");
        });

        it("setting developmentMode should call execSync with user-specified value", function () {
            mockedWebworks.execSync = jasmine.createSpy("execSync");
            client.developmentMode = true;
            expect(mockedWebworks.execSync).toHaveBeenCalledWith(_ID, "developmentMode", {
                "developmentMode": true
            });
        });
    });

    describe("purchase", function () {
        it("calling purchase() with invalid params will throw error", function () {
            expect(function () {
                client.purchase(123);
            }).toThrow("Purchase argument is not provided or is not a object.");
        });

        it("calling purchase() with right params should call execSync", function () {
            var successCb = jasmine.createSpy("success"),
                errorCb = jasmine.createSpy("error"),
                args = {
                    "digitalGoodID": "12345",
                    "digitalGoodSKU": "12345",
                    "digitalGoodName": "Hello World",
                    "metaData": "meta",
                    "purchaseAppName": "test app",
                    "purchaseAppIcon": "icon",
                    "extraParameters": ""
                };

            client.purchase(args, successCb, errorCb);

            expect(mockedWebworks.event.once).toHaveBeenCalledWith(_ID, "payment.purchase.callback", jasmine.any(Function));
            expect(mockedWebworks.execSync).toHaveBeenCalledWith(_ID, "purchase", args);
        });
    });

    describe("getExistingPurchases", function () {
        it("calling getExistingPurchases() with non-boolean will throw error", function () {
            expect(function () {
                client.getExistingPurchases(123);
            }).toThrow("Refresh argument is not provided or is not a boolean value.");
        });

        it("calling getExistingPurchases() with right params should call execSync", function () {
            var successCb = jasmine.createSpy("success"),
                errorCb = jasmine.createSpy("error");

            client.getExistingPurchases(true, successCb, errorCb);

            expect(mockedWebworks.event.once).toHaveBeenCalledWith(_ID, "payment.getExistingPurchases.callback", jasmine.any(Function));
            expect(mockedWebworks.execSync).toHaveBeenCalledWith(_ID, "getExistingPurchases", {
                "refresh": true
            });
        });
    });

    describe("cancelSubscription", function () {
        it("calling cancelSubscription with non-string will throw error", function () {
            expect(function () {
                client.cancelSubscription(123);
            }).toThrow("Transaction ID is not provided or not a string value.");
        });

        it("calling cancelSubscription with right params should call execSync", function () {
            var successCb = jasmine.createSpy("success"),
                errorCb = jasmine.createSpy("error");

            client.cancelSubscription("abc", successCb, errorCb);

            expect(mockedWebworks.event.once).toHaveBeenCalledWith(_ID, "payment.cancelSubscription.callback", jasmine.any(Function));
            expect(mockedWebworks.execSync).toHaveBeenCalledWith(_ID, "cancelSubscription", {
                "transactionID": "abc"
            });
        });
    });

    describe("getPrice", function () {
        it("calling getPrice with non-string will throw error", function () {
            expect(function () {
                client.getPrice(123);
            }).toThrow("SKU is not provided or not a string value.");
        });

        it("calling getPrice with right params should call execSync", function () {
            var successCb = jasmine.createSpy("success"),
                errorCb = jasmine.createSpy("error");

            client.getPrice("abc", successCb, errorCb);

            expect(mockedWebworks.event.once).toHaveBeenCalledWith(_ID, "payment.getPrice.callback", jasmine.any(Function));
            expect(mockedWebworks.execSync).toHaveBeenCalledWith(_ID, "getPrice", {
                "sku": "abc"
            });
        });
    });

    describe("checkExisting", function () {
        it("calling checkExisting with non-string will throw error", function () {
            expect(function () {
                client.checkExisting(123);
            }).toThrow("SKU is not provided or not a string value.");
        });

        it("calling checkExisting with right params should call execSync", function () {
            var successCb = jasmine.createSpy("success"),
                errorCb = jasmine.createSpy("error");

            client.checkExisting("abc", successCb, errorCb);

            expect(mockedWebworks.event.once).toHaveBeenCalledWith(_ID, "payment.checkExisting.callback", jasmine.any(Function));
            expect(mockedWebworks.execSync).toHaveBeenCalledWith(_ID, "checkExisting", {
                "sku": "abc"
            });
        });
    });

    describe("checkAppSubscription", function () {
        it("calling checkExisting with right params should call execSync", function () {
            var successCb = jasmine.createSpy("success"),
                errorCb = jasmine.createSpy("error");

            client.checkAppSubscription(successCb, errorCb);

            expect(mockedWebworks.event.once).toHaveBeenCalledWith(_ID, "payment.checkExisting.callback", jasmine.any(Function));
            expect(mockedWebworks.execSync).toHaveBeenCalledWith(_ID, "checkExisting", {
                "sku": "-1"
            });
        });
    });
});
