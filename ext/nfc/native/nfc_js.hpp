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

#ifndef NFC_JS_H_
#define NFC_JS_H_

#include <json/value.h>
#include <string>
#include "../common/plugin.h"

typedef void* ThreadFunc(void *args);

class NfcJs : public JSExt
{
public:
    explicit NfcJs(const std::string& id);
    virtual ~NfcJs() {}
    virtual std::string InvokeMethod(const std::string& command);
    virtual bool CanDelete();
    void NotifyEvent(const std::string& eventId, const std::string& event);
private:
    std::string m_id;
};

#endif // NFC_JS_H_
