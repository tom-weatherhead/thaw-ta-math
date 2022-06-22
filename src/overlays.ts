// thaw-ta-math/src/overlays.ts

import {
	add,
	createNaNArray,
	fnMultiplication,
	fnSafeDivision,
	pointwise,
	rolling,
	subtract,
	sum // , unspreadArrayParameter
} from 'thaw-common-utilities.ts';

import { sma, ema, stdev, expdev, atr, typicalPrice } from './core';

export interface IVbpResult {
	bottom: number;
	top: number;
	volumes: number[];
}

/* Overlays */

// Bollinger himself recommends the defaults window = 20 and mult = 2
export function bb(
	$close: number[],
	window = 20,
	mult = 2
): {
	lower: number[];
	middle: number[];
	upper: number[];
} {
	const ma = sma($close, window);
	const dev = stdev($close, window); // Standard deviation
	const upper = pointwise((a: number, b: number) => a + b * mult, ma, dev);
	const lower = pointwise((a: number, b: number) => a - b * mult, ma, dev);

	return { lower, middle: ma, upper };
}

export function dema($close: number[], window = 10): number[] {
	const ema1 = ema($close, window);

	return pointwise(
		(a: number, b: number) => 2 * a - b,
		ema1,
		ema(ema1, window)
	);
}

// The Formula for Donchian Channels Is:
//
// UC = Highest High in Last N Periods
// Middle Channel=((UC+LC)/2)
// LC = Lowest Low in Last N periods
//
// where:
//
// UC=Upper channel
// N=Number of minutes, hours, days, weeks, months
// Period=Minutes, hours, days, weeks, months
// LC=Lower channel

export function donchian(
	$high: number[],
	$low: number[],
	// $close: number[],
	window: number
): {
	lower: number[];
	middle: number[];
	upper: number[];
} {
	const lower = rolling(Math.min, $low, window);
	const upper = rolling(Math.max, $high, window);
	const middle = pointwise(
		(a: number, b: number) => (a + b) / 2,
		lower,
		upper
	);

	return { lower, middle, upper };
}

export function ebb(
	$close: number[],
	window = 10,
	mult = 2
): {
	lower: number[];
	middle: number[];
	upper: number[];
} {
	const ma = ema($close, window);
	const dev = expdev($close, window);
	const upper = pointwise((a: number, b: number) => a + b * mult, ma, dev);
	const lower = pointwise((a: number, b: number) => a - b * mult, ma, dev);

	return { lower, middle: ma, upper };
}

export function keltner(
	$high: number[],
	$low: number[],
	$close: number[],
	window = 14,
	mult = 2
): {
	lower: number[];
	middle: number[];
	upper: number[];
} {
	const middle = ema($close, window);
	const atrValues = atr($high, $low, $close, window);
	const scaledAtrValues = atrValues.map((n) => mult * n);
	// const upper = pointwise(
	// 	(a: number, b: number) => a + mult * b,
	// 	middle,
	// 	atrValues
	// );
	// const lower = pointwise(
	// 	(a: number, b: number) => a - mult * b,
	// 	middle,
	// 	atrValues
	// );
	const upper = pointwise(add, middle, scaledAtrValues);
	const lower = pointwise(subtract, middle, scaledAtrValues);

	return { lower, middle, upper };
}

// Parabolic SAR (Stop And Reversal) ?
// See e.g. https://tradingstrategyguides.com/parabolic-sar-moving-average-trade-strategy/

export function psar(
	$high: number[],
	$low: number[],
	stepfactor = 0.02,
	maxfactor = 0.2
): number[] {
	let isUp = true;
	let factor = stepfactor;
	let extreme = Math.max($high[0], $high[1]);
	const psar = [$low[0], Math.min($low[0], $low[1])];
	let cursar = psar[1];

	for (let i = 2, len = $high.length; i < len; i++) {
		cursar = cursar + factor * (extreme - cursar);

		if ((isUp && $high[i] > extreme) || (!isUp && $low[i] < extreme)) {
			factor = factor <= maxfactor ? factor + stepfactor : maxfactor;
			extreme = isUp ? $high[i] : $low[i];
		}

		if ((isUp && $low[i] < cursar) || (!isUp && cursar > $high[i])) {
			isUp = !isUp;
			factor = stepfactor;
			cursar = isUp
				? Math.min(...$low.slice(i - 2, i + 1))
				: Math.max(...$high.slice(i - 2, i + 1));
		}

		//console.log(`isUp=${isUp}, c=${$low[i]}, extreme=${extreme.toFixed(2)}, factor=${factor}, sar=${cursar.toFixed(2)}`);
		psar.push(cursar);
	}

	return psar;

	// ThAW:

	// TODO: First use rolling() to calculate the min and max of the 4-value slices:
	// const lowMin = rolling(Math.min, $low.concat([$low[$low.length - 1]]), 4).slice(3);
	// const highMax = rolling(Math.max, $high.concat([$high[$high.length - 1]]), 4).slice(3);

	// return [$low[0], Math.min($low[0], $low[1])].concat(pointwise(
	// 	(l: number, h: number, lm: number, hm: number): number => {
	// 		cursar = cursar + factor * (extreme - cursar);

	// 		if ((isUp && h > extreme) || (!isUp && l < extreme)) {
	// 			factor = factor <= maxfactor ? factor + stepfactor : maxfactor;
	// 			extreme = isUp ? h: l;
	// 		}

	// 		if ((isUp && l < cursar) || (!isUp && cursar > h)) {
	// 			isUp = !isUp;
	// 			factor = stepfactor;
	// 			cursar = isUp ? lm : hm;
	// 		}

	// 		return cursar;
	// 	},
	// 	$low.slice(2),
	// 	$high.slice(2),
	// 	lowMin,
	// 	highMax
	// ));
}

export function tema($close: number[], window = 10): number[] {
	const ema1 = ema($close, window);
	const ema2 = ema(ema1, window);

	return pointwise(
		(a: number, b: number, c: number) => 3 * a - 3 * b + c,
		ema1,
		ema2,
		ema(ema2, window)
	);
}

// Volume by Price

export function vbp(
	$close: number[],
	$volume: number[],
	zones = 12,
	left = 0,
	right = NaN
): IVbpResult {
	const vbp = new Array(zones).fill(0);

	right = !isNaN(right) ? right : $close.length;

	const closeSlice = $close.slice(left, right);
	const volumeSlice = $volume.slice(left, right);
	const bottom = Math.min(Infinity, ...closeSlice);
	const top = Math.max(-Infinity, ...closeSlice);
	const total = sum(...$volume);
	const indices = closeSlice.map((c) =>
		Math.floor(((c - bottom) / (top - bottom)) * (zones - 1))
	);

	pointwise((i: number, v: number) => (vbp[i] += v), indices, volumeSlice);

	return {
		bottom, // number
		top, // number
		volumes: vbp.map((x) => x / total) // number[]
	};
}

// Volume Weighted Average Price

export function vwap(
	$high: number[],
	$low: number[],
	$close: number[],
	$volume: number[]
): number[] {
	const tp = typicalPrice($high, $low, $close);
	const cumulVTP = [$volume[0] * tp[0]];
	const cumulV = [$volume[0]];

	for (let i = 1, len = $close.length; i < len; i++) {
		cumulVTP[i] = cumulVTP[i - 1] + $volume[i] * tp[i];
		cumulV[i] = cumulV[i - 1] + $volume[i];
	}

	return pointwise((a: number, b: number) => a / b, cumulVTP, cumulV);
}

// Volume-Weighted Moving Average
// See https://www.tradingsetupsreview.com/volume-weighted-moving-average-vwma/

export function vwma(
	$close: number[],
	$volume: number[],
	window = 14
): number[] {
	// Note: This works with operator fnMultiplication because
	// exactly two arrays are passed to pointwise(); it would not work
	// with some other number of arrays.
	const vwprices = pointwise(fnMultiplication, $close, $volume);

	return pointwise(
		fnSafeDivision,
		rolling(sum, vwprices, window),
		rolling(sum, $volume, window)
	);
}

export function zigzag(
	$time: number[],
	$high: number[],
	$low: number[],
	percent = 15
): {
	time: number[];
	price: number[];
} {
	let lowest = $low[0];
	let thattime = $time[0];
	let isUp = false;
	let highest = $high[0];
	const time = [];
	const zigzag = [];

	for (let i = 1, len = $time.length; i < len; i++) {
		if (isUp) {
			if ($high[i] > highest) {
				thattime = $time[i];
				highest = $high[i];
			} else if (
				$low[i] <
				lowest + ((highest - lowest) * (100 - percent)) / 100
			) {
				isUp = false;
				time.push(thattime);
				zigzag.push(highest);
				lowest = $low[i];
			}
		} else {
			if ($low[i] < lowest) {
				thattime = $time[i];
				lowest = $low[i];
			} else if (
				$high[i] >
				lowest + ((highest - lowest) * percent) / 100
			) {
				isUp = true;
				time.push(thattime);
				zigzag.push(lowest);
				highest = $high[i];
			}
		}
	}
	return { time, price: zigzag };
}

// ****

// ThAW's own algorithm: 2020-05-13 (in Beijing)

export function generatePriceFilterOverlay(
	filterThreshold: number,
	prices: number[]
): number[] {
	if (Number.isNaN(filterThreshold) || filterThreshold <= 0) {
		throw new Error(
			`generatePriceFilterOverlay() : Bad filterThreshold: ${filterThreshold}`
		);
	}

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

// **** Support and Resistance Levels ****

export interface ISupportResistanceLevels {
	R5?: number[];
	R4?: number[];
	R3?: number[];
	R2?: number[];
	R1?: number[];
	PP?: number[];
	S1?: number[];
	S2?: number[];
	S3?: number[];
	S4?: number[];
	S5?: number[];
}

// Stolen from from https://github.com/Raghav-Dhir/Support-and-Resistance :

// 1) Classic Method

export function srClassic(
	$high: number[],
	$low: number[],
	$close: number[]
): ISupportResistanceLevels {
	const fnAvg3 = (a: number, b: number, c: number) => (a + b + c) / 3;
	const fnSR1 = (a: number, b: number) => 2 * a - b;
	const fnSR2 = (a: number, b: number, c: number) => a + b - c;
	const fnSR3 = (a: number, b: number, c: number) => a + 2 * (b - c);

	const pivotPoints = pointwise(fnAvg3, $high, $low, $close);

	return {
		PP: pivotPoints,
		R1: pointwise(fnSR1, pivotPoints, $low),
		S1: pointwise(fnSR1, pivotPoints, $high),
		R2: pointwise(fnSR2, pivotPoints, $high, $low),
		S2: pointwise(fnSR2, pivotPoints, $low, $high),
		R3: pointwise(fnSR3, $high, pivotPoints, $low),
		S3: pointwise(fnSR3, $low, pivotPoints, $high)
	};
}

// 2) Fibonacci Retracement Method

export function srFibonacciRetracement(
	$high: number[],
	$low: number[],
	$close: number[]
): ISupportResistanceLevels {
	// The Golden Ratio is (1 + sqrt(5)) / 2, or approximately 1.618
	// 1 / 1.618 = 1.618 - 1 = 0.618
	const fibRetracement = [0.236, 0.382, 0.5, 0.618, 0.786];
	const diff = pointwise(subtract, $high, $low);

	const fnAvg3 = (a: number, b: number, c: number) => (a + b + c) / 3;
	const pivotPoints = pointwise(fnAvg3, $high, $low, $close);

	const diffN = (n: number) =>
		diff.map((d: number) => d * fibRetracement[n - 1]);

	const diff1 = diffN(1);
	const diff2 = diffN(2);
	const diff3 = diffN(3);
	const diff4 = diffN(4);
	const diff5 = diffN(5);

	return {
		PP: pivotPoints,
		R1: pointwise(subtract, pivotPoints, diff1),
		S1: pointwise(add, pivotPoints, diff1),
		R2: pointwise(subtract, pivotPoints, diff2),
		S2: pointwise(add, pivotPoints, diff2),
		R3: pointwise(subtract, pivotPoints, diff3),
		S3: pointwise(add, pivotPoints, diff3),
		R4: pointwise(subtract, pivotPoints, diff4),
		S4: pointwise(add, pivotPoints, diff4),
		R5: pointwise(subtract, pivotPoints, diff5),
		S5: pointwise(add, pivotPoints, diff5)
	};
}

// Calculate PivotPoints (Classic, Woodie, Camarilla and DeMark) and Fibonacci Retracements
// Stolen from https://github.com/KiranJPatel/PivotPointsFibonacciCalculator
