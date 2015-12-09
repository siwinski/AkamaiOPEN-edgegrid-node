// Copyright 2014 Akamai Technologies, Inc. All Rights Reserved
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var uuid = require('node-uuid'),
    _ = require('underscore'),
    helpers = require('./helpers'),
    logger = require('./logger');

function makeAuthHeader(request, clientToken, accessToken, clientSecret, timestamp, nonce, maxBody) {
  var keyValuePairs = {
      client_token: clientToken,
      access_token: accessToken,
      timestamp: timestamp,
      nonce: nonce
    },
    joinedPairs = '',
    authHeader,
    signedAuthHeader;

  _.each(keyValuePairs, function(value, key) {
    joinedPairs += key + '=' + value + ';';
  });

  authHeader = 'EG1-HMAC-SHA256 ' + joinedPairs;

  logger.info('Unsigned authorization header: ' + authHeader + '\n');

  signedAuthHeader = authHeader + 'signature=' + helpers.signRequest(request, timestamp, clientSecret, authHeader, maxBody);

  logger.info('Signed authorization header: ' + signedAuthHeader + '\n');

  return signedAuthHeader;
}

module.exports = {
  generateAuth: function(request, clientToken, clientSecret, accessToken, host, maxBody, guid, timestamp) {
    maxBody = maxBody || 2048;
    guid = guid || uuid.v4();
    timestamp = timestamp || helpers.createTimestamp();

    if (!request.hasOwnProperty('headers')) {
      request.headers = {};
    }

    request.url = host + request.path;
    request.headers.Authorization = makeAuthHeader(request, clientToken, accessToken, clientSecret, timestamp, guid, maxBody);

    return request;
  }
};
