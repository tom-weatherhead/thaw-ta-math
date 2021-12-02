// rollup.config.js

/**
 * Copyright (c) Tom Weatherhead. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in
 * the LICENSE file in the root directory of this source tree.
 */

'use strict';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
	input: './dist/types/main.js',
	output: [
		{
			file: 'dist/thaw-ta-math.cjs.js',
			format: 'cjs',
			exports: 'named'
		},
		{
			file: 'dist/thaw-ta-math.esm.js',
			format: 'es',
			esModule: true,
			compact: true,
			plugins: [terser()]
		},
		{
			file: 'dist/thaw-ta-math.js',
			name: 'thaw-ta-math',
			format: 'umd',
			compact: true,
			plugins: [terser()]
		}
	],
	context: 'this',
	// external: ['uuid'],
	plugins: [nodeResolve()]
};
