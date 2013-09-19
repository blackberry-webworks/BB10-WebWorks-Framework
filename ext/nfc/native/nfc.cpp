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
#include <webworks_utils.hpp>
#include "nfc.hpp"

namespace webworks {

Nfc::Nfc()
{
}

Nfc::~Nfc()
{
}

bool Nfc::convertArgToSetting(int intSetting, nfc_settings_t* setting)
{
    switch (intSetting) {
        case NFC_SETTING_ENABLED:
        case NFC_SETTING_CE_BACKLIGHT_OFF:
        case NFC_SETTING_CE_POWERED_OFF:
        case NFC_SETTING_PROMPT_TO_SEND_FILES:
            *setting = static_cast<nfc_settings_t>(intSetting);
            return true;
        default:
            return false;
    }
}

/****************************************************************
 * Public Functions
 ****************************************************************/

Json::Value Nfc::GetSetting(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("setting") || !args["setting"].isInt()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    nfc_settings_t setting;

    if (!convertArgToSetting(args["setting"].asInt(), &setting)) {
        returnObj["_success"] = false;
        return returnObj;
    }

    bool enabled;
    nfc_result_t result = nfc_get_setting(setting, &enabled);

    if (result == NFC_RESULT_SUCCESS) {
        returnObj["_success"] = true;
        returnObj["enabled"] = enabled;
    } else {
        returnObj["_success"] = false;
        returnObj["code"] = result;
    }

    return returnObj;
}

Json::Value Nfc::SetSetting(const Json::Value& args)
{
    Json::Value returnObj;

    if (!args.isMember("setting") || !args["setting"].isInt() ||
        !args.isMember("enable") || !args["enable"].isBool()) {
        returnObj["_success"] = false;
        return returnObj;
    }

    nfc_settings_t setting;

    if (!convertArgToSetting(args["setting"].asInt(), &setting)) {
        returnObj["_success"] = false;
        return returnObj;
    }

    nfc_result_t result = nfc_set_setting(setting, args["enable"].asBool());

    if (result != NFC_RESULT_SUCCESS) {
        returnObj["code"] = result;
        returnObj["_success"] = false;
    } else {
        returnObj["_success"] = true;
    }

    return returnObj;
}

} // namespace webworks

