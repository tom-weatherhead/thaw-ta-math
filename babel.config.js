/**
 * Copyright (c) Tom Weatherhead. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See e.g. github/facebook/jest/babel.config.js

'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const semver = require('semver');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('./package.json');

const supportedNodeVersion = semver.minVersion(pkg.engines.node).version;

module.exports = {
	"presets": [
		[
			"@babel/preset-env",
			{
				targets: {
					node: supportedNodeVersion
				}
			}
		],
		"@babel/preset-typescript"
	]
};
