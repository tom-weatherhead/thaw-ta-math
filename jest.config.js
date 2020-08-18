/**
 * Copyright (c) Tom Weatherhead. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

module.exports = {
	"collectCoverage": true,
	"coverageDirectory": "./coverage/",
	"moduleFileExtensions": ["ts", "js"],
	"testEnvironment": "node",
	"testRegex": "(/test/.+\\.test\\.ts$)",
	"transformIgnorePatterns": ["/node_modules/(?!thaw-common-utilities.ts)/"]
};
