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
#include <stdio.h>
#include <sstream>
#include <string>
#include <vector>

#include "filetransfer_curl.hpp"

// Set maximum chunk size to 1 MB
#define MAX_CHUNK_SIZE 1048576

namespace webworks {

static size_t UploadReadCallback(void *ptr, size_t size, size_t nmemb, void *userdata)
{
    char *read_data = static_cast<char *>(ptr);
    FILE *file = static_cast<FILE *>(userdata);
    size_t amount = 0;

    if (MAX_CHUNK_SIZE < (size * nmemb)) {
        amount = fread(ptr, 1, MAX_CHUNK_SIZE, file);
    } else {
        amount = fread(ptr, size, nmemb, file);
    }

    return amount;
}

static size_t UploadWriteCallback(void *ptr, size_t size, size_t nmemb, void *userdata)
{
    std::string *write_data = static_cast<std::string *>(userdata);

    size_t realsize = size * nmemb;
    write_data->append(static_cast<char *>(ptr), realsize);

    return realsize;
}

FileTransferCurl::FileTransferCurl()
{
    curl_global_init(CURL_GLOBAL_ALL);
}

FileTransferCurl::~FileTransferCurl()
{
    curl_global_cleanup();
}

std::string FileTransferCurl::Upload(FileUploadInfo *uploadInfo)
{
    CURL *curl;
    CURLcode result;
    std::string result_string;

    struct curl_httppost *formpost = NULL;
    struct curl_httppost *lastptr = NULL;
    struct curl_slist *headerlist = NULL;

    FILE *upload_file = NULL;

    // Initialize the easy interface for curl
    curl = curl_easy_init();
    if (!curl) {
        return buildUploadErrorString(CONNECTION_ERR, uploadInfo->sourceFile, uploadInfo->targetURL);
    }

    // Set up the form and fill in the file upload fields
    if (uploadInfo->chunkedMode) {
        upload_file = fopen(uploadInfo->sourceFile.c_str(), "r");

        if (!upload_file) {
            return buildUploadErrorString(FILE_NOT_FOUND_ERR, uploadInfo->sourceFile, uploadInfo->targetURL);
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
    curl_easy_setopt(curl, CURLOPT_POSTREDIR,  CURL_REDIR_POST_ALL);

    // Attach the different components
    curl_easy_setopt(curl, CURLOPT_HTTPPOST, formpost);
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headerlist);
    curl_easy_setopt(curl, CURLOPT_URL, uploadInfo->targetURL.c_str());

    // Perform file transfer (blocking)
    result = curl_easy_perform(curl);

    if (result == CURLE_OK) {
        int http_code;
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_code);

        if (http_code >= 200 && http_code < 300) {
            double bytes_sent;
            curl_easy_getinfo(curl, CURLINFO_CONTENT_LENGTH_UPLOAD, &bytes_sent);

            result_string = buildUploadSuccessString(bytes_sent, http_code, write_data);
        } else if (http_code == 404) {
            result_string = buildUploadErrorString(INVALID_URL_ERR, uploadInfo->sourceFile, uploadInfo->targetURL);
        } else {
            result_string = buildUploadErrorString(CONNECTION_ERR, uploadInfo->sourceFile, uploadInfo->targetURL);
        }
    } else {
        FileTransferErrorCodes error_code;
        switch (result)
        {
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

        result_string = buildUploadErrorString(error_code, uploadInfo->sourceFile, uploadInfo->targetURL);
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

std::string FileTransferCurl::buildUploadErrorString(const int errorCode, const std::string& sourceFile, const std::string& targetURL)
{
    std::stringstream ss;
    ss << "upload error ";
    ss << errorCode;
    ss << " ";
    ss << sourceFile;
    ss << " ";
    ss << targetURL;

    return ss.str();
}

} // namespace webworks


