/* Basic math */

import {
	cascade,
	createArrayFromElement,
	createNaNArray,
	pointwise,
	rolling
} from 'thaw-common-utilities.ts';

export function add(a: number, b: number): number {
	return a + b;
}

export function subtract(a: number, b: number): number {
	return a - b;
}

export function multiply(a: number, b: number): number {
	return a * b;
}

export function safeDivide(a: number, b: number): number {
	return !b ? NaN : a / b;
}

function square(a: number): number {
	return a * a;
}

export function sum(series: number[]): number {
	return series.reduce(add, 0);
}

export function mean(series: number[]): number {
	return series.length ? sum(series) / series.length : NaN;
}

// Standard deviation?

export function sd(series: number[]): number {
	const E = mean(series);
	const E2 = mean(pointwise(square, series));

	return Math.sqrt(E2 - E * E);
}

// Covariance

export function cov(f: number[], g: number[]): number {
	const Ef = mean(f);
	const Eg = mean(g);
	const Efg = mean(pointwise(multiply, f, g));

	return Efg - Ef * Eg;
}

// Correlation coefficient

export function cor(f: number[], g: number[]): number {
	const Ef = mean(f);
	const Eg = mean(g);
	const Ef2 = mean(pointwise(square, f));
	const Eg2 = mean(pointwise(square, g));
	const Efg = mean(pointwise(multiply, f, g));

	// Note that the numerator is cov(f, g)

	return (Efg - Ef * Eg) / Math.sqrt((Ef2 - Ef * Ef) * (Eg2 - Eg * Eg));
}

export function mad(array: number[]): number {
	return mae(array, new Array(array.length).fill(mean(array)));
}

/* Functional programming */

// TODO: Use the version of 'pointwise' that is in thaw-common-utilities.ts

// export function pointwise(
// 	// The tslint:disable comment suppresses the given TSLint rule for the following line.
// 	/* tslint:disable:ban-types */
// 	operation: Function,
// 	...serieses: number[][]
// ): number[] {
// 	const result = [];

// 	for (let i = 0, len = serieses[0].length; i < len; i++) {
// 		const iseries = (j: number) => serieses.map(x => x[j]);

// 		// result[i] = operation(...iseries(i));
// 		result.push(operation(...iseries(i)));
// 	}

// 	return result;
// }

// TODO: Use the version of 'rolling' that is in thaw-common-utilities.ts

// export function rolling(
// 	operation: Function,
// 	series: number[],
// 	window: number
// ): number[] {
// 	const result = [];

// 	for (let i = 0, len = series.length; i < len; i++) {
// 		const j = i + 1 - window;

// 		result.push(operation(series.slice(j > 0 ? j : 0, i + 1)));
// 	}

// 	return result;
// }

/* Scaled and percentage error */

export function mae(f: number[], g: number[]): number {
	const absDiff = pointwise(
		(a: number, b: number) => Math.abs(a - b),
		f,
		g
	);

	return f.length !== g.length ? Infinity : mean(absDiff);
}

export function rmse(f: number[], g: number[]): number {
	const sqrDiff = pointwise(
		// TODO: compose(subtract, square) // First subtract, then square
		(a: number, b: number) => (a - b) * (a - b),
		f,
		g
	);

	return f.length !== g.length ? Infinity : Math.sqrt(mean(sqrDiff));
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

export function ema(
	array: number[],
	period: number,
	// start?: number
	seedLength = 1
): number[] {
	// Original implementation:

	// const weight = 2 / (window + 1);
	// const result = [start ? start : mean(series.slice(0, window))];
	// // TODO: const result = [start || mean(series.slice(0, window))];

	// for (let i = 1, len = series.length; i < len; i++) {
	// 	if (Number.isNaN(result[i - 1])) {
	// 		result.push(series[i]);
	// 	} else {
	// 		result.push(weight * series[i] + (1 - weight) * result[i - 1]);
	// 	}
	// }

	// return result;

	// ----

	// ThAW's implementation:

	const isNumber = (n: unknown): boolean =>
		typeof n === 'number' && !Number.isNaN(n) && Number.isFinite(n);
	const alpha = 2 / (period + 1); // The smoothing constant (Appel p. 134)
	let i = array.findIndex(isNumber);

	if (i < 0) {
		i = array.length;
	}

	const j = Math.min(i + seedLength - 1, array.length);

	i = Math.max(i, j);

	const resultArray = createArrayFromElement(NaN, i);
	// meanValue is the initial value which stabilizes the exponential average.
	// It is the simple average of the first seedLength values in the array,
	// after skipping any initial run of invalid values (e.g. NaN)
	// See the section 'Stabilizing the Exponential Average' (Appel p. 136)
	const meanValue = mean(
		array.slice(i + 1 - seedLength, i + 1).filter(isNumber)
	);

	return resultArray
		.concat(
			[meanValue],
			cascade(
				(seedValue: number, element: number) =>
					!isNumber(seedValue)
						? element
						: alpha * element + (1 - alpha) * seedValue,
				meanValue,
				array.slice(i + 1)
			)
		)
		.slice(0, array.length);
}

// Rolling standard deviation?

export function stdev(series: number[], window: number): number[] {
	return rolling(sd, series, window);
}

export function madev(series: number[], window: number): number[] {
	return rolling(mad, series, window);
}

export function expdev(series: number[], window: number): number[] {
	const sqrDiff = pointwise(
		(a: number, b: number) => (a - b) * (a - b),
		series,
		ema(series, window)
	);

	return pointwise((x: number) => Math.sqrt(x), ema(sqrDiff, window));
}

/* Wilder's functions */

// Average True Range

export function atr(
	$high: number[],
	$low: number[],
	$close: number[],
	window: number
): number[] {
	const tr = trueRange($high, $low, $close);

	return ema(tr, 2 * window - 1);
}

export function wilderSmooth(series: number[], window: number): number[] {
	// const result = new Array(window).fill(NaN);
	const result = createNaNArray(window);

	// result.push(
	// 	series.slice(1, window + 1).reduce((sum, item) => {
	// 		return (sum += item);
	// 	}, 0)
	// );
	result.push(sum(series.slice(1, window + 1)));

	for (let i = window + 1; i < series.length; i++) {
		result.push((1 - 1 / window) * result[i - 1] + series[i]);
	}

	return result;
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
