/**
 * Copyright (c) Tom Weatherhead. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See e.g. github/facebook/jest/babel.config.js

'use strict';

const semver = require('semver');
const pkg = require('./package.json');

const supportedNodeVersion = semver.minVersion(pkg.engines.node).version;

module.exports = {
	"env": {
		"test": {
			"plugins": [
				["@babel/plugin-transform-modules-commonjs", {allowTopLevelThis: true}],
				'@babel/plugin-transform-strict-mode',
				'@babel/plugin-proposal-class-properties'
			]
		}
	},
	"presets": [
		[
			"@babel/preset-env",
			{
				exclude: ["@babel/plugin-proposal-dynamic-import"],
				shippedProposals: true,
				targets: {node: supportedNodeVersion}
			}
		],
		"@babel/preset-typescript"
	]
};
