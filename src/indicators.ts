// indicators.ts

import {
	cascade,
	createNaNArray,
	pointwise,
	rolling
} from 'thaw-common-utilities.ts';

import {
	add,
	// atr,
	ema,
	// expdev,
	madev,
	multiply,
	// pointwise,
	// rolling,
	safeDivide,
	sma,
	// stdev,
	subtract,
	sum,
	trueRange,
	typicalPrice,
	wilderSmooth
} from './core';

import { bb } from './overlays';

interface IExtrema {
	high: number;
	low: number;
}

/* Indicators */

// Accumulation / Distribution - Created by Larry Williams
// AD is an (open) volume indicator
// AD = (close - open) / (high - low) * volume

export function ad(
	$open: number[],
	$high: number[],
	$low: number[],
	$close: number[],
	$volume: number[]
): number[] {
	const fn = (
		open: number,
		high: number,
		low: number,
		close: number,
		volume: number
	): number =>
		high === low ? 0 : ((close - open) / (high - low)) * volume;

	// Or: (current ad) = (previous ad) + cmfv,
	// where cmfv = ((close - low) - (high - close)) * volume / (high - low)
	// See https://www.investopedia.com/terms/a/accumulationdistribution.asp

	return pointwise(fn, $open, $high, $low, $close, $volume);
}

export function adl(
	$high: number[],
	$low: number[],
	$close: number[],
	$volume: number[]
): number[] {
	const fn = (x: number) =>
		($volume[x] * (2 * $close[x] - $low[x] - $high[x])) /
		($high[x] - $low[x]);
	// const result = [$volume[0] * (2*$close[0] - $low[0] - $high[0]) / ($high[0] - $low[0])];
	const result = [fn(0)];

	for (let i = 1, len = $high.length; i < len; i++) {
		// result[i] = result[i - 1] + $volume[i] * (2*$close[i] - $low[i] - $high[i]) / ($high[i] - $low[i]);
		result[i] = result[i - 1] + fn(i);
	}

	return result;
}

// Average Directional Index (by Wilder)

// Wilder: A strong trend is present when ADX > 25,
// and no trend is present when ADX < 20.

export function adx(
	$high: number[],
	$low: number[],
	$close: number[],
	window = 14
): Record<string, number[]> {
	let dmp = [0];
	let dmm = [0];

	for (let i = 1, len = $low.length; i < len; i++) {
		const hd = $high[i] - $high[i - 1];
		const ld = $low[i - 1] - $low[i];

		dmp.push(hd > ld ? Math.max(hd, 0) : 0);
		dmm.push(ld > hd ? Math.max(ld, 0) : 0);
	}

	const str = wilderSmooth(trueRange($high, $low, $close), window);

	dmp = wilderSmooth(dmp, window);
	dmm = wilderSmooth(dmm, window);

	const fn = (a: number, b: number) => (100 * a) / b;
	const dip = pointwise(fn, dmp, str);
	const dim = pointwise(fn, dmm, str);

	const dx = pointwise(
		(a: number, b: number) => (100 * Math.abs(a - b)) / (a + b),
		dip,
		dim
	);

	return {
		dip,
		dim,
		dx,
		adx: createNaNArray(14).concat(ema(dx.slice(14), 2 * window - 1))
	};
}

// Bollinger Bands:
// - Page 60, Ch 8 (PDF page 89) : Indicator: %b := (price - lower BB) / (upper BB - lower BB)
// - Page 63, Ch 8 (PDF page 92) : Indicator: BandWidth := (upper BB - lower BB) / middle BB

// Bollinger Bands Percentage
export function bbp($close: number[], window = 20, mult = 2): number[] {
	const band = bb($close, window, mult);

	return pointwise(
		(p: number, u: number, l: number) => (p - l) / (u - l),
		$close,
		band.upper,
		band.lower
	);
}

// Bollinger BandWidth
// P. 130: bbw = 0.02 is a real Squeeze; bbw = 0.1 is still a Squeeze.
// A Squeeze occurs when the bbw reaches its 6-month (130-unit?) low.
export function bbw($close: number[], window = 20, mult = 2): number[] {
	const band = bb($close, window, mult);

	return pointwise(
		(u: number, m: number, l: number) => (u - l) / m,
		band.upper,
		band.middle,
		band.lower
	);
}

export function cci(
	$high: number[],
	$low: number[],
	$close: number[],
	window = 20,
	mult = 0.015
): number[] {
	const tp = typicalPrice($high, $low, $close);
	const tpsma = sma(tp, window);
	const tpmad = madev(tp, window);

	tpmad[0] = Infinity;

	return pointwise(
		(a: number, b: number, c: number) => (a - b) / (c * mult),
		tp,
		tpsma,
		tpmad
	);
}

export function cho(
	$high: number[],
	$low: number[],
	$close: number[],
	$volume: number[],
	winshort = 3,
	winlong = 10
): number[] {
	const adli = adl($high, $low, $close, $volume);

	return pointwise(subtract, ema(adli, winshort), ema(adli, winlong));
}

export function fi(
	$close: number[],
	$volume: number[],
	window = 13
): number[] {
	const delta = rolling((s: number[]) => s[s.length - 1] - s[0], $close, 2);

	return ema(pointwise(multiply, delta, $volume), window);
}

// Intraday Intensity - Created by David Bostian
// II is an (open) volume indicator
// II = (2 * close - high - low) / (high - low) * volume

export function ii(
	$high: number[],
	$low: number[],
	$close: number[],
	$volume: number[]
): number[] {
	const fn = (
		high: number,
		low: number,
		close: number,
		volume: number
	): number =>
		high === low ? 0 : ((2 * close - high - low) / (high - low)) * volume;

	return pointwise(fn, $high, $low, $close, $volume);
}

export function kst(
	$close: number[],
	w1 = 10,
	w2 = 15,
	w3 = 20,
	w4 = 30,
	s1 = 10,
	s2 = 10,
	s3 = 10,
	s4 = 15,
	sig = 9
): Record<string, number[]> {
	const rcma1 = sma(roc($close, w1), s1);
	const rcma2 = sma(roc($close, w2), s2);
	const rcma3 = sma(roc($close, w3), s3);
	const rcma4 = sma(roc($close, w4), s4);
	const line = pointwise(
		(a: number, b: number, c: number, d: number) =>
			a + b * 2 + c * 3 + d * 4,
		rcma1,
		rcma2,
		rcma3,
		rcma4
	);

	return {
		line,
		signal: sma(line, sig)
	};
}

// Moving Average Convergence Divergence - Created by Gerald Appel
// MACD = ema(close, winshort) - ema(close, winlong)
// Signal = ema(MACD, winsig)

export function macd(
	$close: number[],
	winshort = 12,
	winlong = 26,
	winsig = 9
): Record<string, number[]> {
	const line = pointwise(
		subtract,
		ema($close, winshort),
		ema($close, winlong)
	);
	const signal = ema(line, winsig);
	const hist = pointwise(subtract, line, signal);

	return {
		line,
		signal,
		hist
	};
}

// Money Flow Index	- Created by Gene Quong and Avram Soudek
// MFI is a (closed) volume indicator, with a range [0, 100]
// MFI = 100 - 100 / (1 + positive price * volume sum / negative price * volume sum)

// MFI > 80 => Overbought
// MFI < 20 => Oversold

// Divergence case 1: Price is increasing, but MFI is decreasing
// Divergence case 2: Price is decreasing, but MFI is increasing

export function mfi(
	$high: number[],
	$low: number[],
	$close: number[],
	$volume: number[],
	window = 14
): number[] {
	let pmf = [0];
	let nmf = [0];
	const tp = typicalPrice($high, $low, $close);

	for (let i = 1, len = $close.length; i < len; i++) {
		const diff = tp[i] - tp[i - 1];

		pmf.push(diff >= 0 ? tp[i] * $volume[i] : 0);
		nmf.push(diff < 0 ? tp[i] * $volume[i] : 0);
	}

	pmf = rolling(sum, pmf, window);
	nmf = rolling(sum, nmf, window);

	return pointwise(
		(a: number, b: number) => 100 - 100 / (1 + a / b),
		pmf,
		nmf
	);
}

// On-Balance Volume
// See https://www.investopedia.com/terms/o/onbalancevolume.asp

export function obv(
	$close: number[],
	$volume: number[],
	signal = 10
): Record<string, number[]> {
	// Original implementation:

	// const result = [0];

	// for (let i = 1, len = $close.length; i < len; i++) {
	// 	result.push(
	// 		result[i - 1] + Math.sign($close[i] - $close[i - 1]) * $volume[i]
	// 	);
	// }

	// return { line: result, signal: sma(result, signal) };

	// ----

	// ThAW's implementation:
	// const fn = (previous: number, current: number);
	// const pairDiffs = cascade(fn, $close[0], $close.slice(1));

	// const seed = 0;

	// return [seed].concat(cascade(fn, seed, $close.slice(1)));

	const array2 = [0].concat($close).slice(0, $close.length);
	const fn = (a: number, b: number, c: number) => Math.sign(a - b) * c;
	const array3 = pointwise(fn, $close, array2, $volume).slice(1);
	const result = [0].concat(cascade(add, 0, array3));

	return { line: result, signal: sma(result, signal) };
}

export function roc($close: number[], window = 14): number[] {
	const result = new Array(window).fill(NaN);

	for (let i = window, len = $close.length; i < len; i++) {
		result.push(
			(100 * ($close[i] - $close[i - window])) / $close[i - window]
		);
	}

	return result;
}

// Relative Strength Index - Created by J. Welles Wilder Jr.
// (see https://www.investopedia.com/trading/introduction-to-parabolic-sar/)

// The most stereotypical interpretation of RSI is:
// - Buy when RSI crosses above 30
// - Sell when RSI crosses below 70
// See Bollinger p. 169

export function rsi($close: number[], window = 14): number[] {
	const gains = [0];
	const loss = [1e-14];

	for (let i = 1, len = $close.length; i < len; i++) {
		const diff = $close[i] - $close[i - 1];

		gains.push(diff >= 0 ? diff : 0);
		loss.push(diff < 0 ? -diff : 0);
	}

	return pointwise(
		(a: number, b: number) => 100 - 100 / (1 + a / b),
		ema(gains, 2 * window - 1),
		ema(loss, 2 * window - 1)
	);
}

export function stoch(
	$high: number[],
	$low: number[],
	$close: number[],
	window = 14,
	signal = 3,
	smooth = 1
): Record<string, number[]> {
	const lowest = rolling((s: number[]) => Math.min(...s), $low, window);
	const highest = rolling((s: number[]) => Math.max(...s), $high, window);
	let k = pointwise(
		(h: number, l: number, c: number) => (100 * (c - l)) / (h - l),
		highest,
		lowest,
		$close
	);

	if (smooth > 1) {
		k = sma(k, smooth);
	}

	return {
		line: k,
		signal: sma(k, signal)
	};
}

export function stochRsi(
	$close: number[],
	window = 14,
	signal = 3,
	smooth = 1
): Record<string, number[]> {
	const _rsi = rsi($close, window);
	const extreme = rolling(
		(s: Array<number>) => {
			return { low: Math.min(...s), high: Math.max(...s) };
		},
		_rsi,
		window
	);
	let K = pointwise(
		(rsi: number, e: unknown) =>
			(rsi - (e as IExtrema).low) /
			((e as IExtrema).high - (e as IExtrema).low),
		_rsi,
		extreme
	);

	K[0] = 0;

	if (smooth > 1) {
		K = sma(K, smooth);
	}

	return {
		line: K,
		signal: sma(K, signal)
	};
}

export function vi(
	$high: number[],
	$low: number[],
	$close: number[],
	window = 14
): Record<string, number[]> {
	const pv = [($high[0] - $low[0]) / 2];
	const nv = [pv[0]];

	for (let i = 1, len = $high.length; i < len; i++) {
		pv.push(Math.abs($high[i] - $low[i - 1]));
		nv.push(Math.abs($high[i - 1] - $low[i]));
	}

	const apv = rolling(
		(s: Array<number>) =>
			s.reduce((sum: number, x: number) => {
				return sum + x;
			}, 0),
		pv,
		window
	);
	const anv = rolling(
		(s: Array<number>) =>
			s.reduce((sum: number, x: number) => {
				return sum + x;
			}, 0),
		nv,
		window
	);
	const atr = rolling(
		(s: Array<number>) =>
			s.reduce((sum: number, x: number) => {
				return sum + x;
			}, 0),
		trueRange($high, $low, $close),
		window
	);

	return {
		plus: pointwise((a: number, b: number) => a / b, apv, atr),
		minus: pointwise((a: number, b: number) => a / b, anv, atr)
	};
}

// Volume-Weighted Moving Average

export function vwma(
	$close: number[],
	$volume: number[],
	window: number
): number[] {
	const vwprices = pointwise(multiply, $close, $volume);

	return pointwise(
		safeDivide,
		rolling(add, vwprices, window),
		rolling(add, $volume, window)
	);
}

// Volume-Weighted MACD - Created by Buff Dormeier
// VWMACD is a (closed) volume indicator
// VWMACD - 12-period volume-weighted average of the last - 26-period volume-weighted average of the last
// VWMACD signal line - 9-period exponential average VWMACD

export function vwmacd(
	$close: number[],
	$volume: number[],
	winshort = 12,
	winlong = 26,
	winsig = 9
): Record<string, number[]> {
	const vwprice = pointwise(multiply, $close, $volume);
	const line = pointwise(
		subtract,
		ema(vwprice, winshort),
		ema(vwprice, winlong)
	);
	const signal = ema(line, winsig);
	const hist = pointwise(subtract, line, signal);

	return {
		line,
		signal,
		hist
	};
}

export function williams(
	$high: number[],
	$low: number[],
	$close: number[],
	window = 14
): number[] {
	return pointwise(
		(x: number) => x - 100,
		stoch($high, $low, $close, window, 1, 1).line
	);
}
