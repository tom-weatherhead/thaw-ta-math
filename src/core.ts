/* Basic math */

import {
	arraySum,
	cascade,
	correlationCoefficient,
	covariance,
	createNaNArray,
	fnAddition,
	fnMultiplication,
	fnSafeDivision,
	fnSubtraction,
	mean,
	pointwise,
	rolling,
	standardDeviation
} from 'thaw-common-utilities.ts';

export const add = fnAddition;
export const subtract = fnSubtraction;
export const multiply = fnMultiplication;
export const safeDivide = fnSafeDivision;
export const sd = standardDeviation;
export const cov = covariance;
export const cor = correlationCoefficient;

export function mad(array: number[]): number {
	return mae(array, new Array(array.length).fill(mean(array)));
}

/* Scaled and percentage error */

export function mae(f: number[], g: number[]): number {
	const absDiff = pointwise(
		(a: number, b: number) => Math.abs(a - b),
		f,
		g
	);

	return f.length !== g.length ? Infinity : mean(absDiff);
}

export function sqrDiff(array1: number[], array2: number[]): number[] {
	return pointwise(
		// TODO: compose(subtract, square) // First subtract, then square
		(a: number, b: number) => (a - b) * (a - b),
		array1,
		array2
	);
}

export function rmse(f: number[], g: number[]): number {
	// const sqrDiff = pointwise(
	// 	// TODO: compose(subtract, square) // First subtract, then square
	// 	(a: number, b: number) => (a - b) * (a - b),
	// 	f,
	// 	g
	// );

	// return f.length !== g.length ? Infinity : Math.sqrt(mean(sqrDiff));

	return f.length !== g.length ? Infinity : Math.sqrt(mean(sqrDiff(f, g)));
}

export function nrmse(f: number[], g: number[]): number {
	return rmse(f, g) / (Math.max(...f) - Math.min(...f));
}

export function mape(f: number[], g: number[]): number {
	const frac = pointwise(
		(a: number, b: number) => Math.abs((a - b) / a),
		f,
		g
	);

	return f.length !== g.length ? Infinity : mean(frac) * 100;
}

/* Core indicators and overlays */

// Simple moving average

export function sma(series: number[], window: number): number[] {
	return rolling(mean, series, window);
}

// Exponential moving average

// Original implementation:
// If start is truthy, use it as the seed of the EMA calculation
// Else, use mean(series.slice(0, window)) as the seed. (But then series[i] ... series[window - 1] are use twice in the overall calculation)

export function ema(
	series: number[],
	window: number,
	start?: number
): number[] {
	const weight = 2 / (window + 1);
	// const result = [start ? start : mean(series.slice(0, window))];
	// TODO: const result = [start || mean(series.slice(0, window))];

	if (!start) {
		start = mean(series.slice(0, window));
	}

	// for (let i = 1, len = series.length; i < len; i++) {
	// 	if (Number.isNaN(result[i - 1])) {
	// 		result.push(series[i]);
	// 	} else {
	// 		result.push(weight * series[i] + (1 - weight) * result[i - 1]);
	// 	}
	// }

	// return result;

	return [start].concat(
		cascade(
			(seedValue: number, element: number): number =>
				Number.isNaN(seedValue)
					? element
					: weight * element + (1 - weight) * seedValue,
			start,
			series.slice(1)
		)
	);
}

// Rolling standard deviation?

export function stdev(series: number[], window: number): number[] {
	return rolling(sd, series, window);
}

export function madev(series: number[], window: number): number[] {
	return rolling(mad, series, window);
}

export function expdev(series: number[], window: number): number[] {
	// const sqrDiff = pointwise(
	// 	(a: number, b: number) => (a - b) * (a - b),
	// 	series,
	// 	ema(series, window)
	// );

	return pointwise(
		(x: number) => Math.sqrt(x),
		ema(sqrDiff(series, ema(series, window)), window)
	);
}

/* J. Welles Wilder Jr.'s functions */

// Average True Range

export function atr(
	$high: number[],
	$low: number[],
	$close: number[],
	window: number
): number[] {
	return ema(trueRange($high, $low, $close), 2 * window - 1);
}

export function wilderSmooth(series: number[], window: number): number[] {
	// console.log('wilderSmooth() series:', series);
	// console.log('wilderSmooth() window:', window);

	// ThAW 2020-09-20: Either this commented-out code of mine:
	// const result = new Array(window).fill(NaN);
	// const result = createNaNArray(window);

	// result.push(arraySum(series.slice(1, window + 1)));

	// for (let i = window + 1; i < series.length; i++) {
	// 	result.push((1 - 1 / window) * result[i - 1] + series[i]);
	// }

	// // console.log('wilderSmooth() result:', result);

	// return result;

	// ---

	const start = arraySum(series.slice(1, window + 1));

	return createNaNArray(window).concat(
		[start],
		cascade(
			(seedValue: number, element: number) =>
				(1 - 1 / window) * seedValue + element,
			start,
			series.slice(window + 1)
		)
	);
}

/* Price transformations */

export function typicalPrice(
	$high: number[],
	$low: number[],
	$close: number[]
): number[] {
	return pointwise(
		(a: number, b: number, c: number) => (a + b + c) / 3,
		$high,
		$low,
		$close
	);
}

export function trueRange(
	$high: number[],
	$low: number[],
	$close: number[]
): number[] {
	const tr = [$high[0] - $low[0]];

	for (let i = 1, len = $low.length; i < len; i++) {
		tr.push(
			Math.max(
				$high[i] - $low[i],
				Math.abs($high[i] - $close[i - 1]),
				Math.abs($low[i] - $close[i - 1])
			)
		);
	}

	return tr;
}
