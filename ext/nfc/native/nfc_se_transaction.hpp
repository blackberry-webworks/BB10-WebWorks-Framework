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

#ifndef NFC_SE_TRANSACTION_WW_H_
#define NFC_SE_TRANSACTION_WW_H_

#include <json/value.h>
#include <nfc/nfc_se_transaction.h>
#include <webworks_utils.hpp>

#include <map>

namespace webworks {

typedef std::map<int, nfc_se_transaction_t*> TransactionMap;

class NfcSeTransaction {
public:
    NfcSeTransaction();
    ~NfcSeTransaction();
    static Json::Value SEParseTransaction(const Json::Value& args);
    static Json::Value SETransactionGetSEType(const Json::Value& args);
    static Json::Value SETransactionGetProtocol(const Json::Value& args);
    static Json::Value SEFreeTransaction(const Json::Value& args);
    static Json::Value SETransactionForegroundApplication();
    static Json::Value SETransactionGetNumberOfAIDs(const Json::Value& args);
    static Json::Value SETransactionGetAID(const Json::Value& args);
    static Json::Value SETransactionGetEventDataLength(const Json::Value& args);
    static Json::Value SETransactionGetEventData(const Json::Value& args);

private:
    static nfc_se_transaction_t* getTransactionById(int id);

    static TransactionMap _transactions;
    static int _currentId;
};

} // namespace webworks

#endif // NFC_SE_TRANSACTION_WW_H_
