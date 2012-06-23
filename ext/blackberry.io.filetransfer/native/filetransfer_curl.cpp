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

#include <curl/curl.h>
#include <dialog_bps.hpp>
#include <stdio.h>
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>

#include "filetransfer_curl.hpp"

namespace webworks {

int max_chunk_size = 1048576;

FileTransferCurl::FileTransferCurl()
{
    m_pVerifyMap = new DomainVerifyMap();

    curl_global_init(CURL_GLOBAL_ALL);
    loadVerifyList();
}

FileTransferCurl::~FileTransferCurl()
{
    curl_global_cleanup();

    if (m_pVerifyMap) {
        delete m_pVerifyMap;
    }
}

std::string FileTransferCurl::Upload(FileUploadInfo *uploadInfo)
{
    CURL *curl;
    CURLcode result;
    std::string result_string;

    max_chunk_size = uploadInfo->chunkSize;

    struct curl_httppost *formpost = NULL;
    struct curl_httppost *lastptr = NULL;
    struct curl_slist *headerlist = NULL;

    FILE *upload_file = NULL;

    std::string source_escaped(curl_easy_escape(curl, curl_easy_escape(curl, uploadInfo->sourceFile.c_str(), 0), 0));
    std::string target_escaped(curl_easy_escape(curl, curl_easy_escape(curl, uploadInfo->targetURL.c_str(), 0), 0));

    int http_status = -1;

    // Initialize the easy interface for curl
    curl = curl_easy_init();
    if (!curl) {
        return buildUploadErrorString(CONNECTION_ERR, source_escaped, target_escaped, http_status);
    }

    // Set up the form and fill in the file upload fields
    if (uploadInfo->chunkedMode) {
        upload_file = fopen(uploadInfo->sourceFile.c_str(), "r");

        if (!upload_file) {
            return buildUploadErrorString(FILE_NOT_FOUND_ERR, source_escaped, target_escaped, http_status);
        }

        // Find the file size
        fseek(upload_file, 0L, SEEK_END);
        int file_size = ftell(upload_file);
        rewind(upload_file);

        curl_formadd(&formpost,
                     &lastptr,
                     CURLFORM_STREAM, upload_file,
                     CURLFORM_CONTENTSLENGTH, file_size,
                     CURLFORM_COPYNAME, uploadInfo->fileKey.c_str(),
                     CURLFORM_FILENAME, uploadInfo->fileName.c_str(),
                     CURLFORM_CONTENTTYPE, uploadInfo->mimeType.c_str(),
                     CURLFORM_END);
    } else {
        curl_formadd(&formpost,
                     &lastptr,
                     CURLFORM_FILE, uploadInfo->sourceFile.c_str(),
                     CURLFORM_COPYNAME, uploadInfo->fileKey.c_str(),
                     CURLFORM_FILENAME, uploadInfo->fileName.c_str(),
                     CURLFORM_CONTENTTYPE, uploadInfo->mimeType.c_str(),
                     CURLFORM_END);
    }

    if (uploadInfo->params.size() > 0) {
        std::vector<std::string>::const_iterator it;

        for (it = uploadInfo->params.begin(); it < uploadInfo->params.end(); it++) {
            const char *key = it->c_str();
            it++;
            const char *value = it->c_str();

            curl_formadd(&formpost,
                         &lastptr,
                         CURLFORM_COPYNAME, key,
                         CURLFORM_COPYCONTENTS, value,
                         CURLFORM_END);
        }
    }

    // Set up the headers
    headerlist = curl_slist_append(headerlist, "Expect:");

    if (uploadInfo->chunkedMode) {
        headerlist = curl_slist_append(headerlist, "Transfer-Encoding: chunked");
    }

    // Set up the callbacks
    std::string write_data;
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, static_cast<void *>(&write_data));
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, UploadWriteCallback);

    if (uploadInfo->chunkedMode) {
        curl_easy_setopt(curl, CURLOPT_READFUNCTION, UploadReadCallback);
    }

    // Allow redirects
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1);
    curl_easy_setopt(curl, CURLOPT_POSTREDIR, CURL_REDIR_POST_ALL);

    // Attach the different components
    curl_easy_setopt(curl, CURLOPT_HTTPPOST, formpost);
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headerlist);
    curl_easy_setopt(curl, CURLOPT_URL, uploadInfo->targetURL.c_str());

    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 1);

    bool blockedDomain = false;
    const std::string parsedDomain(parseDomain(uploadInfo->targetURL.c_str()));
    const DomainVerifyMap::iterator findDomain = m_pVerifyMap->find(parsedDomain);

    if (findDomain != m_pVerifyMap->end()) {
        if (findDomain->second) {
            curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
        } else {
            blockedDomain = true;
        }
    }

    // Perform file transfer (blocking)
    result = curl_easy_perform(curl);

    if (result == CURLE_SSL_CACERT)
    {
        if (!blockedDomain) {
            DialogConfig *dialogConfig = new DialogConfig();
            DialogBPS *dialog = new DialogBPS();
            dialogConfig->size = "large";
            dialogConfig->windowGroup = uploadInfo->windowGroup;
            dialogConfig->message = "The certificate for the domain " + parsedDomain + " could not be verified.\n\nDo you want to continue connecting to this server?";
            dialogConfig->buttons.push_back("Allow");
            dialogConfig->buttons.push_back("Allow Always");
            dialogConfig->buttons.push_back("Deny");
            dialogConfig->buttons.push_back("Deny Always");

            int button = dialog->Show(dialogConfig);

            if (dialogConfig) {
                delete dialogConfig;
            }

            if (dialog) {
                delete dialog;
            }

            switch (button) {
                case 0:
                case 1:
                    // restart transfer
                    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
                    result = curl_easy_perform(curl);
                    if (button == 0)
                        break;
                    m_pVerifyMap->insert(DomainVerifyMap::value_type(parsedDomain, true));
                    break;
                case 2:
                    break;
                case 3:
                    m_pVerifyMap->insert(DomainVerifyMap::value_type(parsedDomain, false));
                    break;
                default:
                    break;
            }
            saveVerifyList();
        }
    }

    if (result == CURLE_OK) {
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_status);

        if (http_status >= 200 && http_status < 300) {
            double bytes_sent;
            curl_easy_getinfo(curl, CURLINFO_CONTENT_LENGTH_UPLOAD, &bytes_sent);

            result_string = buildUploadSuccessString(bytes_sent, http_status, write_data);
        } else if (http_status == 404) {
            result_string = buildUploadErrorString(INVALID_URL_ERR, source_escaped, target_escaped, http_status);
        } else {
            result_string = buildUploadErrorString(CONNECTION_ERR, source_escaped, target_escaped, http_status);
        }
    } else {
        FileTransferErrorCodes error_code;
        switch (result) {
            case CURLE_READ_ERROR:
            case CURLE_FILE_COULDNT_READ_FILE:
                error_code = FILE_NOT_FOUND_ERR;
                break;
            case CURLE_URL_MALFORMAT:
                error_code = INVALID_URL_ERR;
                break;
            default:
                error_code = CONNECTION_ERR;
                break;
        }

        result_string = buildUploadErrorString(error_code, source_escaped, target_escaped, http_status);
    }

    // Clean up
    if (uploadInfo->chunkedMode) {
        fclose(upload_file);
    }

    curl_easy_cleanup(curl);
    curl_formfree(formpost);
    curl_slist_free_all(headerlist);

    return result_string;
}

std::string FileTransferCurl::parseDomain(const std::string &url)
{
    int index = std::string("https://").length();
    return url.substr(index, url.substr(index, url.length()).find_first_of("/"));
}

void FileTransferCurl::loadVerifyList()
{
    std::string fname = std::getenv("HOME");
    fname.append("/../app/native/verifiedDomainList");

    std::string line;
    std::ifstream domainList(fname.c_str());

    if (domainList.is_open()) {
        while (domainList.good()) {
            std::string strDomain;
            std::string strAllowed;

            std::getline(domainList, strDomain, ',');
            std::getline(domainList, strAllowed, ',');
            m_pVerifyMap->insert(DomainVerifyMap::value_type(strDomain, static_cast<bool>(std::atoi(strAllowed.c_str()))));
        }

        domainList.close();
    }
}

void FileTransferCurl::saveVerifyList()
{
    DomainVerifyMap::iterator it;
    std::string fname = std::getenv("HOME");
    fname.append("/../app/native/verifiedDomainList");

    if (m_pVerifyMap->size() > 0)
    {
        std::ofstream domainList(fname.c_str());

        if (domainList.is_open()) {
            for (it = m_pVerifyMap->begin(); it != m_pVerifyMap->end(); it++) {
                domainList << it->first << "," << it->second;
            }

            domainList.close();
        }
    }
}

std::string FileTransferCurl::buildUploadSuccessString(const int bytesSent, const int responseCode, const std::string& response)
{
    std::stringstream ss;
    ss << "upload success ";
    ss << bytesSent;
    ss << " ";
    ss << responseCode;
    ss << " ";
    ss << response;

    return ss.str();
}

std::string FileTransferCurl::buildUploadErrorString(const int errorCode, const std::string& sourceFile, const std::string& targetURL, const int httpStatus)
{
    std::stringstream ss;
    ss << "upload error ";
    ss << errorCode;
    ss << " ";
    ss << sourceFile;
    ss << " ";
    ss << targetURL;
    ss << " ";
    ss << httpStatus;

    return ss.str();
}

size_t UploadReadCallback(void *ptr, size_t size, size_t nmemb, void *userdata)
{
    char *read_data = static_cast<char *>(ptr);
    FILE *file = static_cast<FILE *>(userdata);
    size_t amount = 0;

    if (max_chunk_size < (size * nmemb)) {
        amount = fread(ptr, 1, max_chunk_size, file);
    } else {
        amount = fread(ptr, size, nmemb, file);
    }

    return amount;
}

size_t UploadWriteCallback(void *ptr, size_t size, size_t nmemb, void *userdata)
{
    std::string *write_data = static_cast<std::string *>(userdata);

    size_t realsize = size * nmemb;
    write_data->append(static_cast<char *>(ptr), realsize);

    return realsize;
}


} // namespace webworks
