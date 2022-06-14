// thaw-ta-math/src/indicators.ts

// TODO:
// - Accelerator Oscillator (Bill Williams)
// - Alligator (Bill Williams)
// - Average Directional Movement Index (trend)
// - (Average True Range)
// - Awesome Oscillator (Bill Williams)
// X Parabolic SAR (trend) -> See psar
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
	isNegative,
	isNonNegative,
	multiply,
	negate,
	pointwise,
	rolling,
	safeDivide,
	subtract
} from 'thaw-common-utilities.ts';

import {
	absSubtract,
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

// Money Flow Volume (Marc Chaikin) : Used in adl and cmf.

function mfv(h: number, l: number, c: number, v: number): number {
	// return v * safeDivide((c - l) - (h - c), (h - l));

	return safeDivide(v * (2 * c - l - h), h - l);
}

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
	return cascade(
		(seed: number, h: number, l: number, c: number, v: number) =>
			// seed + safeDivide(v * (2 * c - l - h), h - l),
			seed + mfv(h, l, c, v),
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

// Chaikin Money Flow - Created by Marc Chaikin
// See https://school.stockcharts.com/doku.php?id=technical_indicators:chaikin_money_flow_cmf

// 1. Money Flow Multiplier = [(Close  -  Low) - (High - Close)] /(High - Low)

// 2. Money Flow Volume = Money Flow Multiplier x Volume for the Period

// 3. 20-period CMF = 20-period Sum of Money Flow Volume / 20 period Sum of Volume

// CMF values are in the range [-1, 1].

// ****

// From https://www.tradingview.com/ideas/chaikinmoneyflow/ :

// Chaikin's Money Flow's value fluctuates between 1 and -1. The basic interpretation is:

// 	When CMF is closer to 1, buying pressure is higher.
// 	When CMF is closer to -1, selling pressure is higher.

// What to look for
// Trend Confirmation

// Buying and Selling Pressure can be a good way to confirm an ongoing trend. This can give the trader an added level of confidence that the current trend is likely to continue.

// During a Bullish Trend, continuous Buying Pressure (Chaikin Money Flow values above 0) can indicate that prices will continue to rise.

// During a Bearish Trend, continuous Selling Pressure (Chaikin Money Flow values below 0) can indicate that prices will continue to fall.

// Crosses

// When Chaikin Money Flow crosses the Zero Line, this can be an indication that there is an impending trend reversal.

// Bullish Crosses occur when Chaikin Money Flow crosses from below the Zero Line to above the Zero Line. Price then rises.

// Bearish Crosses occur when Chaikin Money Flow crosses from above the Zero Line to below the Zero Line. Price then falls.

// It should be noted that brief crosses can occur resulting in false signals.
// The best way to avoid these false signals is by examining past performance
// for the particular security that is being analyzed and even adjusting the
// thresholds accordingly. For example, instead of a Zero Line Cross,
// a technical analyst may use two separate lines such as .05 and -.05.

// Unreliability

// Chaikin Money Flow does have a shortfall in its calculation. The shortfall
// is that the Money Flow Multiplier, which plays into determining Money Flow
// Volume and therefore Chaikin Money Flow values, does not take into account
// the change in trading range between periods. This means that if there is any
// type of gap in price, it won’t be picked up on and therefore Chaikin Money
// Flow and price will become out of sync.

// Summary

// Chaikin Money flow is a nice indictor that gives the technical analyst
// another view of Chaikin's theories about buying and selling pressure. It
// should not necessarily be used by itself as a stand-alone signal generating
// indicator. CMF works well when in conjunction with additional indicators,
// especially those indicators that were also generated by Chaikin;
// Accumulation/Distribution (ADL) and The Chaikin Oscillator.

export function cmf(
	$high: number[],
	$low: number[],
	$close: number[],
	$volume: number[],
	window = 20
): number[] {
	// This mfv (money flow volume) formula is also used in
	// Chaikin's Accumulation / Distribution Line indicator.
	const mfvValues = pointwise(
		mfv, // (h, l, c, v) => v * safeDivide((c - l) - (h - c), (h - l)),
		$high,
		$low,
		$close,
		$volume
	);

	return pointwise(
		safeDivide,
		sma(mfvValues, window),
		sma($volume, window)
	);
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
): {
	line: number[];
	signal: number[];
	hist: number[];
} {
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
	// const gains = [0];
	// const loss = [1e-14];

	// for (let i = 1, len = $close.length; i < len; i++) {
	// 	const diff = $close[i] - $close[i - 1];

	// 	gains.push(diff >= 0 ? diff : 0);
	// 	loss.push(diff < 0 ? -diff : 0);
	// }

	// ...

	// ThAW :

	const diffs = diffAdjacentElements(
		// ThAW: This could be improved
		[$close[0] + 1e-14].concat($close)
	).slice(1);
	const gains = pointwise((diff) => Math.max(diff, 0), diffs);
	const loss = pointwise((diff) => Math.max(-diff, 0), diffs);

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

// From https://www.tradingview.com/ideas/stochasticrsi/ :

// Overbought and Oversold conditions are traditionally different than the RSI.
// While RSI overbought and oversold conditions are traditionally set at 70
// for overbought and 30 for oversold, Stoch RSI are typically .80 and .20
// respectively. When using the Stoch RSI, overbought and oversold work best
// when trading along with the underlying trend.
// During an uptrend, look for oversold conditions for points of entry.
// During a downtrend, look for overbought conditions for points of entry.

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
	const element0 = ($high[0] - $low[0]) / 2;
	const pnv = (k: number): number[] =>
		[element0].concat(
			pointwise(
				absSubtract,
				$high.slice(1 - k, $high.length - k),
				$low.slice(k, $low.length + k - 1)
			)
		);
	const pv = pnv(0);
	const nv = pnv(1);

	//

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
): {
	line: number[];
	signal: number[];
	hist: number[];
} {
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

// > -20 implies overbought, and < -80 implies oversold
// See https://www.tradingview.com/ideas/williamsr/

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
