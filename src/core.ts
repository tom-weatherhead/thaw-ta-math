// thaw-ta-math/src/core.ts

/* Basic math */

import {
	add,
	cascade,
	correlationCoefficient,
	covariance,
	createNaNArray,
	mean,
	pointwise,
	rolling // ,
	// standardDeviation // ,
} from 'thaw-common-utilities.ts';

import { emaCore } from 'thaw-macd';

// ThAW: Is our standardDeviation() buggy? It's in common-utilities.ts
// export const sd = (...array: number[]): number => standardDeviation(array);
export function sd(series: Array<number>): number {
	const E = mean(series);
	const E2 = mean(pointwise((x: number) => x * x, series));

	return Math.sqrt(E2 - E * E);
}

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
	return rolling((...args: number[]) => mean(args), series, window);
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
	return emaCore(
		series.slice(1),
		window,
		start || mean(series.slice(0, window))
	);
}

// Rolling standard deviation?

export function stdev(series: number[], window: number): number[] {
	return rolling((...array: number[]) => sd(array), series, window);
}

export function madev(series: number[], window: number): number[] {
	return rolling((...args: number[]) => mad(args), series, window);
}

export function expdev(series: number[], window: number): number[] {
	return ema(
		sqrDiff(series, ema(series, window)),
		window
	).map((x: number) => Math.sqrt(x));
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
	const start = add(...series.slice(1, window + 1));

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
