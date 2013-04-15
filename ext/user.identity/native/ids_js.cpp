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

#include <bps/bps.h>
#include <json/reader.h>
#include <json/writer.h>
#include <sstream>
#include <string>
#include <errno.h>
#include <sys/pps.h>
#include <sys/netmgr.h>
#include <sys/iomsg.h>

#include "ids_js.hpp"

volatile int eventCHID = 0;

extern "C" {
	void getTokenSuccessCB(ids_request_id_t requestId, const char *token, int paramCount, const ids_token_param_t *params, void *cbData) {
		if( cbData ) {
			IDSEXT *request = (IDSEXT *) cbData;

			Json::FastWriter writer;
			Json::Value resultJSON;

			resultJSON["requestId"] = requestId;
			resultJSON["token"] = token;

			resultJSON["paramCount"] = paramCount;
			Json::Value tokenParams;
			int i;
			for(i = 0; i < paramCount; i++) {
				tokenParams[i]["name"] = params[i].name;
				tokenParams[i]["value"] = params[i].value;
			}
			resultJSON["tokenParams"] = Json::Value(tokenParams);

			std::string resultStr = writer.write(resultJSON);
			request->NotifyEvent(request->getEventId(), writer.write(resultJSON));
		}
	}

	void clearTokenSuccessCB( ids_request_id_t requestId, bool clear, void* cbData ) {
		if( cbData ) {
			IDSEXT *request = (IDSEXT *) cbData;

			Json::FastWriter writer;
			Json::Value resultJSON;

			resultJSON["requestId"] = requestId;
			resultJSON["clear"] = clear;

			std::string resultStr = writer.write(resultJSON);

			request->NotifyEvent(request->getEventId(), resultStr.c_str());
		}
	}

	void getPropertiesSuccessCB( ids_request_id_t requestId, int propertyCount, const ids_property_t* properties, void* cbData ) {
		if( cbData ) {
			IDSEXT *request = (IDSEXT *) cbData;

			Json::FastWriter writer;
			Json::Value resultJSON;

			resultJSON["requestId"] = requestId;
			resultJSON["propertyCount"] = propertyCount;
			Json::Value userProperties;

			int i;
			for(i = 0; i < propertyCount; i++) {
				userProperties[i]["uri"] = properties[i].name;
				userProperties[i]["value"] = properties[i].value;
			}

			resultJSON["userProperties"] = Json::Value(userProperties);

			std::string resultStr = writer.write(resultJSON);

			request->NotifyEvent(request->getEventId(), resultStr.c_str());
		}
	}

//	void createPropertySuccessCB( ids_request_id_t requestId, void* cbData ) {
//		if( cbData ) {
//			IDSEXT *request = (IDSEXT *) cbData;
//
//			Json::FastWriter writer;
//			Json::Value resultJSON;
//
//			resultJSON["requestId"] = requestId;
//
//			std::string resultStr = writer.write(resultJSON);
//
//			request->NotifyEvent(request->getEventId(), resultStr.c_str());
//		}
//	}
//
//	void setPropertySuccessCB( ids_request_id_t requestId, void* cbData ) {
//		if( cbData ) {
//			IDSEXT *request = (IDSEXT *) cbData;
//
//			Json::FastWriter writer;
//			Json::Value resultJSON;
//
//			resultJSON["requestId"] = requestId;
//
//			std::string resultStr = writer.write(resultJSON);
//
//			request->NotifyEvent(request->getEventId(), resultStr.c_str());
//		}
//	}
//
//	void deletePropertySuccessCB( ids_request_id_t requestId, void* cbData ) {
//		if( cbData ) {
//			IDSEXT *request = (IDSEXT *) cbData;
//
//			Json::FastWriter writer;
//			Json::Value resultJSON;
//
//			resultJSON["requestId"] = requestId;
//
//			std::string resultStr = writer.write(resultJSON);
//
//			request->NotifyEvent(request->getEventId(), resultStr.c_str());
//		}
//	}

	void failureCB(ids_request_id_t requestId, ids_result_t result, const char *failureInfo, void *cbData) {
		if( cbData ) {
			IDSEXT *request = (IDSEXT *) cbData;

			Json::FastWriter writer;
			Json::Value resultJSON;

			resultJSON["requestId"] = requestId;
			resultJSON["result"] = result;
			resultJSON["failureInfo"] = ( failureInfo ? failureInfo : "" );
			std::string resultStr = writer.write(resultJSON);

			request->NotifyEvent(request->getEventId(), resultStr.c_str());
		}
	}
}


IDSEXT::IDSEXT(const std::string& id) : m_id(id)
{
	if( ids_initialize() != IDS_SUCCESS ) {
		fprintf(stderr, "Unable to initialize IDS library\n");
	}
	providers = NULL;

	connected = true;
	pthread_create(&m_thread, NULL, idsEventThread, this );
}

std::string IDSEXT::getEventId()
{
	return event_id;
}

ids_provider_mapping* IDSEXT::getProviders()
{
	return providers;
}

char* onGetObjList()
{
    // Return list of classes in the object
    static char name[] = "IDSEXT";
    return name;
}

JSExt* onCreateObject(const std::string& className, const std::string& id)
{
    // Make sure we are creating the right class
    if (className != "IDSEXT") {
        return 0;
    }

    return new IDSEXT(id);
}

ids_provider_mapping* IDSEXT::getProvider(const std::string& provider)
{
	ids_provider_mapping *current = providers;

	while( current != NULL ) {
		if( provider == current->providerName ) {
			return current;
		} else {
			current = providers->next;
		}
	}
	
	return NULL;
}

void IDSEXT::clearProviders(void)
{
	ids_provider_mapping *current = providers;
	while( current != NULL ) {
		providers = current->next;
		if( current->providerName ) free( (char *) current->providerName );
		if( current->next ) free( (void *) current->next );
		current = providers;
	}
}

void IDSEXT::removeProvider( int providerFd )
{
	ids_provider_mapping *current = providers;
	ids_provider_mapping *previous = NULL;

	while( current != NULL ) {
		if( current->providerFd == providerFd ) {
			if( previous == NULL ) {
				providers = current->next;
			} else {
				previous->next = current->next;
			}
			if( current->providerName ) free( (char *) current->providerName );
			if( current->next ) free( (void *) current->next );
		}
	}
}

IDSEXT::~IDSEXT()
{
	connected = false;
	ChannelDestroy(eventCHID);
	ids_shutdown();
	clearProviders();
}

std::string IDSEXT::InvokeMethod(const std::string& command)
{
    int index = command.find_first_of(" ");

    string strCommand = command.substr(0, index);
    string strParam = command.substr(index + 1, command.length());

    Json::Reader reader;
    Json::Value obj;

    if (strCommand == "getVersion") {
		return GetVersion();
    } else if (strCommand == "registerProvider") {
		return RegisterProvider(strParam);
    } else if (strCommand == "setOption") {
        // parse the JSON
        bool parse = reader.parse(strParam, obj);

        if (!parse) {
            //fprintf(stderr, "%s\n", "error parsing\n");
            return "unable to parse options";
        }

        int option = obj["option"].asInt();
        const std::string value = obj["value"].asString();

		return( SetOption(option, value) );
	} else if (strCommand == "getToken") {

        // parse the JSON
        bool parse = reader.parse(strParam, obj);

        if (!parse) {
            //fprintf(stderr, "%s", "error parsing\n");
            return "unable to parse options";
        }
		event_id = obj["_eventId"].asString();
		std::string provider = obj["provider"].asString();
        std::string tokenType = obj["tokenType"].asString();
        const std::string appliesTo = obj["appliesTo"].asString();

		GetToken(provider, tokenType, appliesTo);
	} else if (strCommand == "clearToken") {
	        // parse the JSON
        bool parse = reader.parse(strParam, obj);

        if (!parse) {
            //fprintf(stderr, "%s", "error parsing\n");
            return "unable to parse options";
        }
		event_id = obj["_eventId"].asString();
		std::string provider = obj["provider"].asString();
        std::string tokenType = obj["tokenType"].asString();
        const std::string appliesTo = obj["appliesTo"].asString();

		ClearToken(provider, tokenType, appliesTo);
	} else if (strCommand == "getProperties") {
        // parse the JSON
        bool parse = reader.parse(strParam, obj);
        if (!parse) {
            //fprintf(stderr, "%s", "error parsing\n");
            return "unable to parse options";
        }
		event_id = obj["_eventId"].asString();
		std::string provider = obj["provider"].asString();
		int propertyType = obj["propertyType"].asInt();
        int numProps = obj["numProps"].asInt();
        const std::string userProps = obj["userProperties"].asString();
		GetProperties(provider, propertyType, numProps, userProps.c_str());
	} // else if (strCommand == "createProperty") {
//        // parse the JSON
//        bool parse = reader.parse(strParam, obj);
//        if (!parse) {
//            //fprintf(stderr, "%s", "error parsing\n");
//            return "unable to parse options";
//        }
//		event_id = obj["_eventId"].asString();
//		std::string provider = obj["provider"].asString();
//		int propertyType = obj["propertyType"].asInt();
//        const std::string propertyName = obj["propertyName"].asString();
//        const std::string propertyValue = obj["propertyValue"].asString();
//		CreateProperty(provider, propertyType, propertyName.c_str(), propertyValue.c_str());
//
//	} else if (strCommand == "setProperty") {
//        // parse the JSON
//        bool parse = reader.parse(strParam, obj);
//        if (!parse) {
//            //fprintf(stderr, "%s", "error parsing\n");
//            return "unable to parse options";
//        }
//		event_id = obj["_eventId"].asString();
//		std::string provider = obj["provider"].asString();
//		int propertyType = obj["propertyType"].asInt();
//        const std::string propertyName = obj["propertyName"].asString();
//        const std::string propertyValue = obj["propertyValue"].asString();
//		SetProperty(provider, propertyType, propertyName.c_str(), propertyValue.c_str());
//	}  else if (strCommand == "deleteProperty") {
//        // parse the JSON
//        bool parse = reader.parse(strParam, obj);
//        if (!parse) {
//            //fprintf(stderr, "%s", "error parsing\n");
//            return "unable to parse options";
//        }
//		event_id = obj["_eventId"].asString();
//		std::string provider = obj["provider"].asString();
//		int propertyType = obj["propertyType"].asInt();
//        const std::string propertyName = obj["propertyName"].asString();
//		DeleteProperty(provider, propertyType, propertyName.c_str());
//	} else if (strCommand == "deleteLocalProperty") {
//        // parse the JSON
//        bool parse = reader.parse(strParam, obj);
//        if (!parse) {
//            //fprintf(stderr, "%s", "error parsing\n");
//            return "unable to parse options";
//        }
//		event_id = obj["_eventId"].asString();
//		std::string provider = obj["provider"].asString();
//		int propertyType = obj["propertyType"].asInt();
//        const std::string propertyName = obj["propertyName"].asString();
//		DeleteLocalProperty(provider, propertyType, propertyName.c_str());
//	}

    return "";
}

bool IDSEXT::CanDelete()
{
    return true;
}

// Notifies JavaScript of an event
void IDSEXT::NotifyEvent(const std::string& eventId, const std::string& event)
{
    std::string eventString = m_id + " ";
    eventString.append(eventId);
    eventString.append(" ");
    eventString.append(event);
    SendPluginEvent(eventString.c_str(), m_pContext);
}

std::string IDSEXT::GetVersion()
{
	ostringstream ver;
	ver << ids_get_version();
	return( ver.str() );
}

std::string IDSEXT::RegisterProvider(const std::string& providerName)
{
	Json::FastWriter writer;
	Json::Value resultJSON;

	ids_provider_mapping *registeredItem = (ids_provider_mapping *) malloc( sizeof( ids_provider_mapping ) );
	if( !registeredItem ) {
		fprintf(stderr, "Unable to register IDS provider - malloc error\n");
		return "";
	}

	registeredItem->providerName = strdup(providerName.c_str());
	resultJSON["result"] = ids_register_provider( registeredItem->providerName, &registeredItem->provider, &registeredItem->providerFd );
	if( (ids_result_t) resultJSON["result"].asInt() == IDS_SUCCESS ) {
		registeredItem->next = providers;
		providers = registeredItem;

		registeredItem->sigEvent = new sigevent;
		registeredItem->sigEvent->sigev_notify = SIGEV_PULSE;
		registeredItem->sigEvent->sigev_coid = ConnectAttach( ND_LOCAL_NODE, 0, eventCHID, _NTO_SIDE_CHANNEL, 0 );
		registeredItem->sigEvent->sigev_priority = getprio( 0 );
		registeredItem->sigEvent->sigev_code = registeredItem->providerFd;
		registeredItem->sigEvent->sigev_value.sival_int = registeredItem->providerFd;

		if( ionotify( registeredItem->providerFd, _NOTIFY_ACTION_POLLARM, _NOTIFY_COND_INPUT, registeredItem->sigEvent ) & _NOTIFY_COND_INPUT ) {
			MsgDeliverEvent( 0, registeredItem->sigEvent );
		}
	} else {
		resultJSON["errno"] = strerror(errno);
	}

	std::string resultStr = writer.write(resultJSON);
	return( resultStr.c_str() );
}

std::string IDSEXT::SetOption(int option, const std::string& value)
{
	Json::FastWriter writer;
	Json::Value resultJSON;

	resultJSON["result"] = ids_set_option( (ids_option_t) option, value.c_str() );
	if( (ids_result_t) resultJSON["result"].asInt() != IDS_SUCCESS ) {
		resultJSON["errno"] = strerror(errno);
	}

	std::string resultStr = writer.write(resultJSON);

	return( resultStr.c_str());
}

void* IDSEXT::idsEventThread(void *args)
{
	IDSEXT *idsExt = (IDSEXT *) args;

	struct _pulse msg;
	
	eventCHID = ChannelCreate( _NTO_CHF_COID_DISCONNECT );
	
	while( idsExt->connected ) {
		if( MsgReceive( eventCHID, &msg, sizeof(msg), NULL ) == 0 ) {
			// Find provider - process msg
			ids_provider_mapping* current = idsExt->providers;

			while( current != NULL ) {
				if( msg.code == current->providerFd ) {
					// Re-arm ionotify
					if( ids_process_msg( current->providerFd ) != IDS_SUCCESS ) {
						fprintf( stderr, "Failed to process IDS message\n" );
						idsExt->removeProvider( current->providerFd );
					} else {
						if( ionotify( current->providerFd, _NOTIFY_ACTION_POLLARM, _NOTIFY_COND_INPUT, current->sigEvent ) & _NOTIFY_COND_INPUT ) {
							MsgDeliverEvent( 0, current->sigEvent );
						}
					}
				}
				current = current->next;
			}
		}
	}

	pthread_detach( pthread_self() );
	return NULL;
}

std::string IDSEXT::GetToken(const std::string& provider, const std::string& tokenType, const std::string& appliesTo)
{
	ids_request_id_t *getTokenRequestId = NULL;
	ids_provider_mapping *requestProvider = getProvider( provider );

	ids_result_t getTokenResult;
	if( requestProvider ) {
		getTokenResult = ids_get_token( requestProvider->provider, tokenType.c_str(), appliesTo.c_str(), getTokenSuccessCB, failureCB, this, getTokenRequestId);
	} else {
		getTokenResult = ids_get_token( NULL, tokenType.c_str(), appliesTo.c_str(), getTokenSuccessCB, failureCB, this, getTokenRequestId);
	}

	if( getTokenResult != IDS_SUCCESS ) {
		failureCB( (ids_request_id_t)0, IDS_FAILURE, strerror(errno), this );
	}

	return "";
}

std::string IDSEXT::GetProperties(const std::string& provider, int propertyType, int numProps, const char* properties)
{
	const char *propList[numProps];
	char *delimited = strdup( properties );
	char *token;

	int i = 0;
	while( ( token = strsep( &delimited, "," ) ) ) {
         propList[i] = strdup( token );
         i++;
    }
	ids_request_id_t *getPropertiesRequestId = NULL;
	ids_provider_mapping *requestProvider = getProvider( provider );
	ids_result_t getPropertiesResult;

	if( requestProvider ) {
		getPropertiesResult = ids_get_properties( requestProvider->provider, propertyType, numProps, propList, getPropertiesSuccessCB, failureCB, this, getPropertiesRequestId);
	} else {
		getPropertiesResult = ids_get_properties( NULL, propertyType, numProps, propList, getPropertiesSuccessCB, failureCB, this, getPropertiesRequestId);
	}

	if( getPropertiesResult != IDS_SUCCESS ) {
		failureCB( (ids_request_id_t)0, IDS_FAILURE, strerror(errno), this );
	}


	return "";
}

//std::string IDSEXT::CreateProperty(const std::string& provider, int propertyType, const char *propertyName, const char* propertyValue)
//{
////	ids_request_id_t *createPropertyRequestId = NULL;
//	ids_provider_mapping *requestProvider = getProvider( provider );
////	ids_result_t createPropertyResult;
////	ids_property_t userProperty;
////	userProperty.name = propertyName;
////	userProperty.value = propertyValue;
//
//	if( requestProvider ) {
////		createPropertyResult = ids_create_property( requestProvider->provider, propertyType, &userProperty, createPropertySuccessCB, failureCB, this, createPropertyRequestId);
//	} else {
////		createPropertyResult = ids_create_property( NULL, propertyType, &userProperty, createPropertySuccessCB, failureCB, this, createPropertyRequestId);
//	}
//
////	if( createPropertyResult != IDS_SUCCESS ) {
////		failureCB( (ids_request_id_t)0, IDS_FAILURE, strerror(errno), this );
////	}
//
//	return "";
//}
//
//std::string IDSEXT::SetProperty(const std::string& provider, int propertyType, const char *propertyName, const char* propertyValue)
//{
////	ids_request_id_t *setPropertyRequestId = NULL;
//	ids_provider_mapping *requestProvider = getProvider( provider );
////	ids_result_t setPropertyResult;
////	ids_property_t userProperty;
////	userProperty.name = propertyName;
////	userProperty.value = propertyValue;
//
//	if( requestProvider ) {
////		setPropertyResult = ids_set_property( requestProvider->provider, propertyType, &userProperty, setPropertySuccessCB, failureCB, this, setPropertyRequestId);
//	} else {
////		setPropertyResult = ids_set_property( NULL, propertyType, &userProperty, setPropertySuccessCB, failureCB, this, setPropertyRequestId);
//	}
//
////	if( setPropertyResult != IDS_SUCCESS ) {
////		failureCB( (ids_request_id_t)0, IDS_FAILURE, strerror(errno), this );
////	}
//
//	return "";
//}
//
//std::string IDSEXT::DeleteProperty(const std::string& provider, int propertyType, const char *propertyName)
//{
////	ids_request_id_t *deletePropertyRequestId = NULL;
//	ids_provider_mapping *requestProvider = getProvider( provider );
////	ids_result_t deletePropertyResult;
//
//	if( requestProvider ) {
////		deletePropertyResult = ids_delete_property( requestProvider->provider, propertyType, propertyName, deletePropertySuccessCB, failureCB, this, deletePropertyRequestId);
//	} else {
////		deletePropertyResult = ids_delete_property( NULL, propertyType, propertyName, deletePropertySuccessCB, failureCB, this, deletePropertyRequestId);
//	}
//
////	if( deletePropertyResult != IDS_SUCCESS ) {
////		failureCB( (ids_request_id_t)0, IDS_FAILURE, strerror(errno), this );
////	}
//
//	return "";
//}

//std::string IDSEXT::DeleteLocalProperty(const std::string& provider, int propertyType, const char *propertyName)
//{
//	ids_request_id_t *deleteLocalPropertyRequestId = NULL;
//	ids_provider_mapping *requestProvider = getProvider( provider );
//	ids_result_t deleteLocalPropertyResult;
//
//	if( requestProvider ) {
//		deleteLocalPropertyResult = ids_delete_local_property( requestProvider->provider, propertyType, propertyName, deletePropertySuccessCB, failureCB, this, deleteLocalPropertyRequestId);
//	} else {
//		deleteLocalPropertyResult = ids_delete_local_property( NULL, propertyType, propertyName, deletePropertySuccessCB, failureCB, this, deleteLocalPropertyRequestId);
//	}
//
//	if( deleteLocalPropertyResult != IDS_SUCCESS ) {
//		failureCB( (ids_request_id_t)0, IDS_FAILURE, strerror(errno), this );
//	}
//
//	return "";
//}

std::string IDSEXT::ClearToken(const std::string& provider, const std::string& tokenType, const std::string& appliesTo)
{
	ids_request_id_t *clearTokenRequestId = NULL;
	ids_provider_mapping *requestProvider = getProvider( provider );

	ids_result_t clearTokenResult;
	if( requestProvider ) {
		clearTokenResult = ids_clear_token( requestProvider->provider, tokenType.c_str(), appliesTo.c_str(), clearTokenSuccessCB, failureCB, this, clearTokenRequestId);
	} else {
		clearTokenResult = ids_clear_token( NULL, tokenType.c_str(), appliesTo.c_str(), clearTokenSuccessCB, failureCB, this, clearTokenRequestId);
	}

	if( clearTokenResult != IDS_SUCCESS ) {
		failureCB( (ids_request_id_t)0, IDS_FAILURE, strerror(errno), this );
	}

	return "";
}
