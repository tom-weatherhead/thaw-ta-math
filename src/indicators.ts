// thaw-ta-math/src/indicators.ts

// TODO:
// - Accelerator Oscillator (Bill Williams)
// - Alligator (Bill Williams)
// - Average Directional Movement Index (trend)
// - (Average True Range)
// - Awesome Oscillator (Bill Williams)
// - Parabolic SAR (trend)
// - Standard Deviation (trend)
// - Bears Power
// - Bulls Power
// - DeMarker
// - Force Index
// - Momentum
// - Relative Vigor Index
// - Volumes?
// - Fractals (Bill Williams)
// - Gator Oscillator (Bill Williams)
// - Market Fecilitation Index (Bill Williams)
// - Ichimoku
// - Heiken Ashi
// - iExposure
// - OsMA

import {
	add,
	cascade,
	createNaNArray,
	multiply,
	negate,
	pointwise,
	rolling,
	safeDivide,
	subtract
} from 'thaw-common-utilities.ts';

import {
	ema,
	madev,
	sma,
	trueRange,
	typicalPrice,
	wilderSmooth
} from './core';

import { bb } from './overlays';

export interface ILineAndSignal {
	line: number[];
	signal: number[];
}

export interface IAdxResult {
	dip: number[];
	dim: number[];
	adx: number[];
}

export interface IStochOptions {
	zeroKZero?: boolean;
}

export interface IViResult {
	plus: number[];
	minus: number[];
}

const isNegative = (n: number) => !Number.isNaN(n) && n < 0;
const isNonNegative = (n: number) => !Number.isNaN(n) && n >= 0;

/* Indicators */

// AD (or ADL) : Accumulation / Distribution Line
// - Created by Marc Chaikin

// AD is an (open) volume indicator
// See https://www.tradingview.com/support/solutions/43000501770-accumulation-distribution-adl/

// f(i) = (volume[i] * ((close[i] - low[i]) - (high[i] - close[i]))) / (high[i] - low[i])
// AD[] = f(0); AD[i] = AD[i - 1] + f(i)

// (ADL = Accumulation / Distribution Line)
// AD is an (open) volume indicator

export function adl(
	$high: number[],
	$low: number[],
	$close: number[],
	$volume: number[]
): number[] {
	// const fn = (h: number, l: number, c: number, v: number) =>
	// 	safeDivide(v * (2 * c - l - h), h - l);

	return cascade(
		(seed: number, h: number, l: number, c: number, v: number) =>
			seed + safeDivide(v * (2 * c - l - h), h - l),
		0,
		$high,
		$low,
		$close,
		$volume
	);
}

// Average Directional Index (by Wilder) - Indicates the strength of a trend

// Wilder: A strong trend is present when ADX > 25,
// and no trend is present when ADX < 20.

// Move this to core.ts :

// function delta(array: number[], n: number): number[] {
// 	return pointwise(
// 		subtract,
// 		array.slice(n),
// 		array.slice(0, array.length - n)
// 	);
// }

function diffAdjacentElements(array: number[]): number[] {
	return rolling((...a: number[]) => a[a.length - 1] - a[0], array, 2);
} // The first element of the returned array will be array[0] - array[0] === 0

export function adx(
	$high: number[],
	$low: number[],
	$close: number[],
	window = 14
): IAdxResult {
	const fn1 = (a: number, b: number) => (a > b ? Math.max(a, 0) : 0);
	const fn2 = (a: number[], b: number[]) => pointwise(fn1, a, b);
	const fn3 = (a: number, b: number) => (100 * a) / b;

	const str = wilderSmooth(trueRange($high, $low, $close), window);

	const fn4 = (a: number[], b: number[]) =>
		pointwise(fn3, wilderSmooth(fn2(a, b), window), str);

	const highDiffs = diffAdjacentElements($high);
	const lowDiffs = diffAdjacentElements($low).map(negate);

	const dip = fn4(highDiffs, lowDiffs);
	const dim = fn4(lowDiffs, highDiffs);

	const dx = pointwise(
		(a: number, b: number) => (100 * Math.abs(a - b)) / (a + b),
		dip,
		dim
	);
	const adx = createNaNArray(14).concat(ema(dx.slice(14), 2 * window - 1));

	return { dip, dim, adx };
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

// Commodity Channel Index - Created by Donald Lambert
// See https://www.investopedia.com/terms/c/commoditychannelindex.asp

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

// Chaikin Oscillator - Created by Marc Chaikin
// See https://docs.anychart.com/Stock_Charts/Technical_Indicators/Chaikin_Oscillator_(CHO)

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

// WTF is this FI? Force Index?

export function fi(
	$close: number[],
	$volume: number[],
	window = 13
): number[] {
	return ema(
		pointwise(multiply, diffAdjacentElements($close), $volume),
		window
	);
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

// Know Sure Thing Indicator - Created by Martin Pring

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
): ILineAndSignal {
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
	const signal = sma(line, sig);

	return { line, signal };
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
	const tp = typicalPrice($high, $low, $close);
	const tpv = pointwise(multiply, tp, $volume);
	const diffs = diffAdjacentElements(tp);

	tpv[0] = 0;

	const xmf = (pred: (a: number) => boolean) =>
		rolling(
			add,
			pointwise((a, val) => (pred(a) ? val : 0), diffs, tpv),
			window
		);

	// pmf = Positive Money Flow
	// nmf = Negative Money Flow
	const pmf = xmf(isNonNegative);
	const nmf = xmf(isNegative);

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
): ILineAndSignal {
	const array2 = [0].concat($close).slice(0, $close.length);
	const fn = (a: number, b: number, c: number) => Math.sign(a - b) * c;
	const array3 = pointwise(fn, $close, array2, $volume).slice(1);
	const result = [0].concat(cascade(add, 0, array3));

	return { line: result, signal: sma(result, signal) };
}

// Price Rate of Change
// See https://www.investopedia.com/terms/p/pricerateofchange.asp

export function roc($close: number[], window = 14): number[] {
	return createNaNArray(window).concat(
		pointwise(
			(a: number, b: number) => (100 * (a - b)) / b,
			$close.slice(window),
			$close.slice(0, $close.length - window)
		)
	);
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

// Stochastic oscillator - Created by Dr. George Lane in the late 1950s

export function stoch(
	$high: number[],
	$low: number[],
	$close: number[],
	window = 14,
	signal = 3, // %D ?
	smooth = 1, // %K ?
	options: IStochOptions = {}
): ILineAndSignal {
	const lowest = rolling(Math.min, $low, window);
	const highest = rolling(Math.max, $high, window);
	let k = pointwise(
		(h: number, l: number, c: number) => (100 * (c - l)) / (h - l),
		highest,
		lowest,
		$close
	);

	if (typeof options !== 'undefined' && options.zeroKZero) {
		k[0] = 0;
	}

	if (smooth > 1) {
		k = sma(k, smooth);
	}

	return {
		line: k, // %K Line ?
		signal: sma(k, signal) // %D Line ?
	};
}

// Stochastic RSI - Created by Tushar S. Chande and Stanley Kroll (1994)
// See https://www.investopedia.com/terms/s/stochrsi.asp

export function stochRsi(
	$close: number[],
	window = 14,
	signal = 3,
	smooth = 1
): ILineAndSignal {
	const _rsi = rsi($close, window);

	return stoch(_rsi, _rsi, _rsi, window, signal, smooth, {
		zeroKZero: true
	});
}

// Vortex Indicator
// Created by Etienne Botes and Douglas Siepman
// Colour the 'plus' line green and the 'minus' line red.

// An uptrend or buy signal occurs when VI+ is below VI- and then crosses
// above VI- to take the top position among the trendlines. A downtrend or
// sell signal occurs when VI- is below VI+ and crosses above VI+ to take
// the top position among the trendlines. Overall, the trendline in the top
// position generally dictates whether the security is in an uptrend
// or downtrend.

export function vi(
	$high: number[],
	$low: number[],
	$close: number[],
	window = 14
): IViResult {
	const pv = [($high[0] - $low[0]) / 2];
	const nv = [pv[0]];

	for (let i = 1, len = $high.length; i < len; i++) {
		pv.push(Math.abs($high[i] - $low[i - 1]));
		nv.push(Math.abs($high[i - 1] - $low[i]));
	}

	const apv = rolling(add, pv, window);
	const anv = rolling(add, nv, window);
	const atr = rolling(add, trueRange($high, $low, $close), window);

	return {
		plus: pointwise(safeDivide, apv, atr),
		minus: pointwise(safeDivide, anv, atr)
	};
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

// Williams %R (aka Williams Percent Range) - Created by Larry Williams
// See https://www.investopedia.com/terms/w/williamsr.asp

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
