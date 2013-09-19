/*
 * Copyright 2013 Research In Motion Limited.
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

#include <json/value.h>
#include <json/writer.h>
#include <stdio.h>
#include <resolv.h>
#include <webworks_utils.hpp>
#include "nfc_se_transaction.hpp"

namespace webworks {

int NfcSeTransaction::_currentId = 0;

NfcSeTransaction::NfcSeTransaction()
{
}

NfcSeTransaction::~NfcSeTransaction()
{
}

nfc_se_transaction_t* NfcSeTransaction::getTransactionById(int id)
{
    TransactionMap::iterator found;

    if ((found = _transactions.find(id)) == _transactions.end()) {
        return NULL;
    } else {
        return found->second;
    }
}

/****************************************************************
 * Public Functions
 ****************************************************************/

Json::Value NfcSeTransaction::SEParseTransaction(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("data") || !args["data"].isString()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    nfc_se_transaction_t* transaction;

    nfc_result_t result = nfc_se_parse_transaction(&transaction, args["data"].asCString());

    if (result == NFC_RESULT_SUCCESS) {
        _transactions[_currentId] = transaction;
        returnObj["transaction"] = _currentId;
        _currentId++;
        returnObj["_success"] = true;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeTransaction::SETransactionGetSEType(const Json::Value& args)
{
    Json::Value returnObj;
    nfc_se_transaction_t* transaction;

    if (!args.isMember("transaction") || !args["transaction"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    } else {
        if ((transaction = getTransactionById(args["transaction"].asInt())) == NULL) {
            returnObj["_success"] = false;
            return returnObj;
        }
    }

    secure_element_id_type_t seType = nfc_se_transaction_get_se_type(transaction);

    returnObj["_success"] = true;
    returnObj["seType"] = seType;

    return returnObj;
}

Json::Value NfcSeTransaction::SETransactionGetProtocol(const Json::Value& args)
{
    Json::Value returnObj;
    nfc_se_transaction_t* transaction;

    if (!args.isMember("transaction") || !args["transaction"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    } else {
        if ((transaction = getTransactionById(args["transaction"].asInt())) == NULL) {
            returnObj["_success"] = false;
            return returnObj;
        }
    }

    unsigned int technologyType = nfc_se_transaction_get_protocol(transaction);

    returnObj["_success"] = true;
    returnObj["technologyType"] = technologyType;

    return returnObj;
}

Json::Value NfcSeTransaction::SEFreeTransaction(const Json::Value& args)
{
    Json::Value returnObj;
    nfc_se_transaction_t* transaction;

    if (!args.isMember("transaction") || !args["transaction"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    } else {
        if ((transaction = getTransactionById(args["transaction"].asInt())) == NULL) {
            returnObj["_success"] = false;
            return returnObj;
        }
    }

    nfc_se_free_transaction(transaction);
    _transactions.erase(args["transaction"].asInt());

    returnObj["_success"] = true;

    return returnObj;
}

Json::Value NfcSeTransaction::SETransactionGetNumberOfAIDs(const Json::Value& args)
{
    Json::Value returnObj;
    nfc_se_transaction_t* transaction;

    if (!args.isMember("transaction") || !args["transaction"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    } else {
        if ((transaction = getTransactionById(args["transaction"].asInt())) == NULL) {
            returnObj["_success"] = false;
            return returnObj;
        }
    }

    unsigned int numAIDs = nfc_se_transaction_get_number_of_aids(transaction);

    returnObj["_success"] = true;
    returnObj["numAIDs"] = numAIDs;

    return returnObj;
}

Json::Value NfcSeTransaction::SETransactionGetAID(const Json::Value& args)
{
    Json::Value returnObj;
    nfc_se_transaction_t* transaction;

    if (!args.isMember("transaction") || !args["transaction"].isInt() ||
        !args.isMember("index") || !args["index"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    } else {
        if ((transaction = getTransactionById(args["transaction"].asInt())) == NULL) {
            returnObj["_success"] = false;
            return returnObj;
        }
    }

    unsigned int index = args["index"].asInt();
    const uint8_t* aid;
    size_t aidLength;

    nfc_result_t result = nfc_se_transaction_get_aid(transaction, index, &aid, &aidLength);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        // convert aid to send as a base64 string
        returnObj["aid"] = webworks::Utils::toBase64(aid, aidLength);
        returnObj["aidLength"] = aidLength;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value NfcSeTransaction::SETransactionGetEventDataLength(const Json::Value& args)
{
    Json::Value returnObj;
    nfc_se_transaction_t* transaction;

    if (!args.isMember("transaction") || !args["transaction"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    } else {
        if ((transaction = getTransactionById(args["transaction"].asInt())) == NULL) {
            returnObj["_success"] = false;
            return returnObj;
        }
    }

    size_t eventDataLength = nfc_se_transaction_get_event_data_length(transaction);

    returnObj["_success"] = true;
    returnObj["eventDataLen"] = eventDataLength;

    return returnObj;
}

Json::Value NfcSeTransaction::SETransactionGetEventData(const Json::Value& args)
{
    Json::Value returnObj;
    nfc_se_transaction_t* transaction;

    if (!args.isMember("transaction") || !args["transaction"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    } else {
        if ((transaction = getTransactionById(args["transaction"].asInt())) == NULL) {
            returnObj["_success"] = false;
            return returnObj;
        }
    }

    const uint8_t* eventData = nfc_se_transaction_get_event_data(transaction);

    returnObj["_success"] = true;
    // convert eventData to send as a base64 string
    returnObj["eventData"] = webworks::Utils::toBase64(eventData, nfc_se_transaction_get_event_data_length(transaction));

    return returnObj;
}

Json::Value NfcSeTransaction::SETransactionForegroundApplication()
{
    Json::Value returnObj;

    nfc_result_t result = nfc_se_transaction_foreground_application();

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

} // namespace webworks

