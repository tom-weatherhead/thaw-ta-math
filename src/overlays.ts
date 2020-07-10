// thaw-ta-math/src/overlays.ts

import { createNaNArray, pointwise } from 'thaw-common-utilities.ts';

import {
	sma,
	// ema,
	stdev // ,
	// expdev,
	// pointwise,
	// atr,
	// typicalPrice
} from './core';

/* Overlays */

// Bollinger himself recommends the defaults window = 20 and mult = 2
// export function bb($close: number[], window = 15, mult = 2) {
export function bb($close: number[], window = 20, mult = 2): any {
	const ma = sma($close, window);
	const dev = stdev($close, window); // Standard deviation
	const upper = pointwise((a: number, b: number) => a + b * mult, ma, dev);
	const lower = pointwise((a: number, b: number) => a - b * mult, ma, dev);

	return { lower, middle: ma, upper };
}

// export function dema($close: number[], window = 10) {
// 	;
// }

// export function ebb($close: number[], window = 10, mult = 2) {
// 	;
// }

// export function keltner($close: number[], window= 14, mult = 2) {
// 	;
// }

// export function psar($close: number[], factor = 0.02, maxfactor = 0.2) {
// 	;
// }

// export function tema($close: number[], window = 10) {
// 	;
// }

// export function vbp($close: number[], zones = 12, left = 0, right = NaN) {
// 	;
// }

// export function vwap($close: number[]) {
// 	;
// }

// export function zigzag($close: number[], percent = 15) {
// 	;
// }

// ThAW's own algorithm: 2020-05-13

export function generatePriceFilterOverlay(
	filterThreshold: number,
	prices: number[]
): number[] {
	if (Number.isNaN(filterThreshold) || filterThreshold <= 0) {
		throw new Error(
			`generatePriceFilterOverlay() : Bad filterThreshold: ${filterThreshold}`
		);
	}

	// const overlay = new Array(prices.length).fill(NaN);
	const overlay = createNaNArray(prices.length);

	// 1) Before entering the main loop:
	// Keep track of the min and max prices seen thus far
	// until they differ by at least filterThreshold.
	// This way, filteredIndices[0] does not have to be 0.

	let i: number;
	let minPriceIndex = 0;
	let maxPriceIndex = 0;

	for (
		i = 0;
		i < prices.length &&
		prices[maxPriceIndex] / prices[minPriceIndex] < 1 + filterThreshold;
		i++
	) {
		if (prices[i] > prices[maxPriceIndex]) {
			maxPriceIndex = i;
		} else if (prices[i] < prices[minPriceIndex]) {
			minPriceIndex = i;
		}
	}

	if (i === prices.length) {
		return overlay;
	}

	// 2) Then enter the main 'state machine' loop.

	let isUptrend = maxPriceIndex > minPriceIndex;
	const filteredIndices = [Math.min(minPriceIndex, maxPriceIndex)];
	let indexOfPointB = i;

	for (; i < prices.length; i++) {
		const price = prices[i];
		const priceAtB = prices[indexOfPointB];

		if (isUptrend) {
			if (price > priceAtB) {
				indexOfPointB = i;
			} else if (price / priceAtB <= 1 - filterThreshold) {
				filteredIndices.push(indexOfPointB);
				indexOfPointB = i;
				isUptrend = false;
			}
		} else {
			if (price < priceAtB) {
				indexOfPointB = i;
			} else if (price / priceAtB >= 1 + filterThreshold) {
				filteredIndices.push(indexOfPointB);
				indexOfPointB = i;
				isUptrend = true;
			}
		}
	}

	// Then: For each adjacent pair of elements in filteredIndices,
	// draw the filtered price data by interpolating between
	// (filteredIndices[i], prices[filteredIndices[i]]) and (filteredIndices[i + 1], prices[filteredIndices[i + 1]])
	// For each line, m = (prices[filteredIndices[i + 1]] - prices[filteredIndices[i]]) / (filteredIndices[i + 1] - filteredIndices[i])
	// y = m * x + b
	// Therefore prices[filteredIndices[i]] = m * filteredIndices[i] + b
	// b = prices[filteredIndices[i]] - m * filteredIndices[i]
	// Then calculate y for all filteredIndices[i] < x < filteredIndices[i + 1]

	// This price-filtered graph is an *overlay*.

	if (filteredIndices.length) {
		overlay[filteredIndices[0]] = prices[filteredIndices[0]];

		for (i = 1; i < filteredIndices.length; i++) {
			const fi1 = filteredIndices[i - 1];
			const fi0 = filteredIndices[i];
			const m = (prices[fi0] - prices[fi1]) / (fi0 - fi1);
			const b = prices[fi0] - m * fi0;

			for (let x = fi1 + 1; x <= fi0; x++) {
				overlay[x] = m * x + b;
			}
		}
	}

	return overlay;
}
