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

var _self = {},
    _ID = require("./manifest.json").namespace,
    _onPurchaseSuccess = null,
    _onPurchaseFail = null,
    _onGetExistingPurchasesSuccess = null,
    _onGetExistingPurchasesFail = null,
    _onCancelSubscriptionSuccess = null,
    _onCancelSubscriptionFail = null,
    _onGetPriceSuccess = null,
    _onGetPriceFail = null,
    _onCheckExistingSuccess = null,
    _onCheckExistingFail = null;

function getFieldValue(field) {
    var value;
    try {
        value = window.webworks.execSync(_ID, field);
    } catch (e) {
        console.error(e);
    }
    return value;
}

function invokeClientCallback(result, field, successCb, errorCb, errorMsg) {
    if (result) {
        switch (result.successState.state) {
        case "SUCCESS":
            if (successCb && typeof successCb === "function") {
                successCb(result[field]);
            }
            break;
        case "FAILURE":
        case "BPS_FAILURE":
            if (errorCb && typeof errorCb === "function") {
                errorCb(result.errorObject);
            }
            break;
        }
    } else {
        if (errorCb && typeof errorCb === "function") {
            errorCb({
                errorID: "-1",
                errorText: errorMsg
            });
        }
    }
}

function webworksPurchaseCallback(result) {
    invokeClientCallback(result, "purchasedItem", _onPurchaseSuccess, _onPurchaseFail, "Purchase Failed. Unexpected Error Occured.");
    _onPurchaseSuccess = null;
    _onPurchaseFail = null;
}

function webworksGetExistingPurchasesCallback(result) {
    invokeClientCallback(result, "purchases", _onGetExistingPurchasesSuccess, _onGetExistingPurchasesFail, "GetExistingPurchases Failed. Unexpected Error Occured.");
    _onGetExistingPurchasesSuccess = null;
    _onGetExistingPurchasesFail = null;
}

function webworksCancelSubscriptionCallback(result) {
    invokeClientCallback(result, "dataItem", _onCancelSubscriptionSuccess, _onCancelSubscriptionFail, "CancelSubscription Failed. Unexpected Error Occured.");
    _onCancelSubscriptionSuccess = null;
    _onCancelSubscriptionFail = null;
}

function webworksGetPriceCallback(result) {
    invokeClientCallback(result, "dataItem", _onGetPriceSuccess, _onGetPriceFail, "GetPrice Failed. Unexpected Error Occured.");
    _onGetPriceSuccess = null;
    _onGetPriceFail = null;
}

function webworksCheckExistingCallback(result) {
    invokeClientCallback(result, "dataItem", _onCheckExistingSuccess, _onCheckExistingFail, "CheckExisting Failed. Unexpected Error Occured.");
    _onCheckExistingSuccess = null;
    _onCheckExistingFail = null;
}

_self.purchase = function (purchase_arguments_t, successCallback, failCallback) {
    if (!purchase_arguments_t || typeof purchase_arguments_t !== "object") {
        if (failCallback && typeof failCallback === "function") {
            failCallback({
                errorID: "-1",
                errorText: "Purchase argument is not provided or is not a object."
            });
        }

        return;
    }

    var args = {
        "digitalGoodID" : purchase_arguments_t.digitalGoodID || "",
        "digitalGoodSKU" : purchase_arguments_t.digitalGoodSKU || "",
        "digitalGoodName" : purchase_arguments_t.digitalGoodName || "",
        "metaData" : purchase_arguments_t.metaData || "",
        "purchaseAppName" : purchase_arguments_t.purchaseAppName || "",
        "purchaseAppIcon" : purchase_arguments_t.purchaseAppIcon || "",
        "extraParameters" : purchase_arguments_t.extraParameters || ""
    };
	
    _onPurchaseSuccess = successCallback;
    _onPurchaseFail = failCallback;
    window.webworks.event.once(_ID, "payment.purchase.callback", webworksPurchaseCallback);

    return window.webworks.execSync(_ID, "purchase", args);
};

_self.getExistingPurchases = function (refresh, successCallback, failCallback) {
    if (typeof refresh !== "boolean") {
        if (failCallback && typeof failCallback === "function") {
            failCallback({
                errorID: "-1",
                errorText: "Refresh argument is not provided or is not a boolean value."
            });
        }

        return;
    }

    var args = {
        "refresh" : refresh
    };
	
    _onGetExistingPurchasesSuccess = successCallback;
    _onGetExistingPurchasesFail = failCallback;
    window.webworks.event.once(_ID, "payment.getExistingPurchases.callback", webworksGetExistingPurchasesCallback);

    return window.webworks.execSync(_ID, "getExistingPurchases", args);
};

_self.cancelSubscription = function (transactionID, successCallback, failCallback) {
    if (!transactionID || typeof transactionID !== "string") {
        if (failCallback && typeof failCallback === "function") {
            failCallback({
                errorID: "-1",
                errorText: "Transaction ID is not provided or not a string value."
            });
        }

        return;
    }

    var args = {
        "transactionID" : transactionID
    };

    _onCancelSubscriptionSuccess = successCallback;
    _onCancelSubscriptionFail = failCallback;
    window.webworks.event.once(_ID, "payment.cancelSubscription.callback", webworksCancelSubscriptionCallback);

    return window.webworks.execSync(_ID, "cancelSubscription", args);
};

_self.getPrice = function (sku, successCallback, failCallback) {
    if (!sku || typeof sku !== "string") {
        if (failCallback && typeof failCallback === "function") {
            failCallback({
                errorID: "-1",
                errorText: "SKU is not provided or not a string value."
            });
        }

        return;
    }

    var args = {
        "sku" : sku
    };

    _onGetPriceSuccess = successCallback;
    _onGetPriceFail = failCallback;
    window.webworks.event.once(_ID, "payment.getPrice.callback", webworksGetPriceCallback);

    return window.webworks.execSync(_ID, "getPrice", args);
};

_self.checkExisting = function (sku, successCallback, failCallback) {
    if (!sku || typeof sku !== "string") {
        if (failCallback && typeof failCallback === "function") {
            failCallback({
                errorID: "-1",
                errorText: "SKU is not provided or not a string value."
            });
        }

        return;
    }

    var args = {
        "sku" : sku
    };

    _onCheckExistingSuccess = successCallback;
    _onCheckExistingFail = failCallback;

    window.webworks.event.once(_ID, "payment.checkExisting.callback", webworksCheckExistingCallback);

    return window.webworks.execSync(_ID, "checkExisting", args);
};

_self.checkAppSubscription = function (successCallback, failCallback) {
    //-1 represents the PAYMENTSERVICE_APP_SUBSCRIPTION constant
    var args = {
        "sku" : "-1"
    };

    _onCheckExistingSuccess = successCallback;
    _onCheckExistingFail = failCallback;

    window.webworks.event.once(_ID, "payment.checkExisting.callback", webworksCheckExistingCallback);

    return window.webworks.execSync(_ID, "checkExisting", args);
};

Object.defineProperty(_self, "developmentMode", {
    get: function () {
        return getFieldValue("developmentMode");
    },
    set: function (value) {
        try {
            window.webworks.execSync(_ID, "developmentMode", {"developmentMode": value});
        } catch (e) {
            console.error(e);
        }
    }
});

module.exports = _self;
