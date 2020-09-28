// thaw-ta-math/test/main.test.ts

'use strict';

import TA from 'ta-math';

// import * as macdKaelZhang from 'macd';
// import * as d3fc from '@d3fc/d3fc-technical-indicator';

import * as engine from '../lib/main';

const ohlcvTestData1 = [
	//EURUSD 1H bid data
	{
		datetime: 1059944400,
		open: 1.12773,
		high: 1.12851,
		low: 1.12746,
		close: 1.12769,
		volume: 30024
	},
	{
		datetime: 1059948000,
		open: 1.12781,
		high: 1.12827,
		low: 1.12696,
		close: 1.12791,
		volume: 26939
	},
	{
		datetime: 1059951600,
		open: 1.12773,
		high: 1.12793,
		low: 1.1263,
		close: 1.12678,
		volume: 28072
	},
	{
		datetime: 1059955200,
		open: 1.12672,
		high: 1.12761,
		low: 1.12608,
		close: 1.12645,
		volume: 29135
	},
	{
		datetime: 1059958800,
		open: 1.12643,
		high: 1.12675,
		low: 1.12572,
		close: 1.12623,
		volume: 31069
	},
	{
		datetime: 1059962400,
		open: 1.12624,
		high: 1.12733,
		low: 1.12602,
		close: 1.12607,
		volume: 27872
	},
	{
		datetime: 1059966000,
		open: 1.12616,
		high: 1.12684,
		low: 1.12564,
		close: 1.12636,
		volume: 27448
	},
	{
		datetime: 1059969600,
		open: 1.1266,
		high: 1.12762,
		low: 1.12629,
		close: 1.12708,
		volume: 28446
	},
	{
		datetime: 1059973200,
		open: 1.12712,
		high: 1.12764,
		low: 1.12665,
		close: 1.127,
		volume: 25244
	},
	{
		datetime: 1059976800,
		open: 1.12681,
		high: 1.12739,
		low: 1.12584,
		close: 1.12632,
		volume: 28058
	},
	{
		datetime: 1059980400,
		open: 1.12675,
		high: 1.13111,
		low: 1.12639,
		close: 1.13062,
		volume: 26928
	},
	{
		datetime: 1059984000,
		open: 1.13093,
		high: 1.13115,
		low: 1.12881,
		close: 1.1301,
		volume: 26659
	},
	{
		datetime: 1059987600,
		open: 1.13,
		high: 1.13039,
		low: 1.12903,
		close: 1.12981,
		volume: 26619
	},
	{
		datetime: 1059991200,
		open: 1.13015,
		high: 1.13081,
		low: 1.12962,
		close: 1.12962,
		volume: 26350
	},
	{
		datetime: 1059994800,
		open: 1.12973,
		high: 1.13175,
		low: 1.12965,
		close: 1.13091,
		volume: 28783
	},
	{
		datetime: 1059998400,
		open: 1.13093,
		high: 1.13146,
		low: 1.12935,
		close: 1.13007,
		volume: 28146
	},
	{
		datetime: 1060002000,
		open: 1.13025,
		high: 1.13168,
		low: 1.12962,
		close: 1.13115,
		volume: 25855
	},
	{
		datetime: 1060005600,
		open: 1.13142,
		high: 1.13428,
		low: 1.13062,
		close: 1.13363,
		volume: 28008
	},
	{
		datetime: 1060009200,
		open: 1.13398,
		high: 1.13421,
		low: 1.13265,
		close: 1.13334,
		volume: 26258
	},
	{
		datetime: 1060012800,
		open: 1.13361,
		high: 1.13734,
		low: 1.13337,
		close: 1.13638,
		volume: 294546
	},
	{
		datetime: 1060016400,
		open: 1.13633,
		high: 1.13649,
		low: 1.13471,
		close: 1.13546,
		volume: 135652
	},
	{
		datetime: 1060020000,
		open: 1.1354,
		high: 1.13622,
		low: 1.13385,
		close: 1.13516,
		volume: 147753
	},
	{
		datetime: 1060023600,
		open: 1.13529,
		high: 1.13623,
		low: 1.13494,
		close: 1.13538,
		volume: 106190
	},
	{
		datetime: 1060027200,
		open: 1.13552,
		high: 1.13627,
		low: 1.1352,
		close: 1.1354,
		volume: 62168
	},
	{
		datetime: 1060030800,
		open: 1.13543,
		high: 1.13633,
		low: 1.13492,
		close: 1.13528,
		volume: 28564
	},
	{
		datetime: 1060034400,
		open: 1.13527,
		high: 1.13563,
		low: 1.13443,
		close: 1.13478,
		volume: 25618
	},
	{
		datetime: 1060038000,
		open: 1.1347,
		high: 1.13536,
		low: 1.13391,
		close: 1.13523,
		volume: 27934
	},
	{
		datetime: 1060041600,
		open: 1.13518,
		high: 1.13573,
		low: 1.13416,
		close: 1.13416,
		volume: 29665
	},
	{
		datetime: 1060045200,
		open: 1.13422,
		high: 1.13532,
		low: 1.13422,
		close: 1.13521,
		volume: 31044
	},
	{
		datetime: 1060048800,
		open: 1.1352,
		high: 1.13574,
		low: 1.13487,
		close: 1.13505,
		volume: 28935
	},
	{
		datetime: 1060052400,
		open: 1.13503,
		high: 1.13544,
		low: 1.13454,
		close: 1.13498,
		volume: 27647
	},
	{
		datetime: 1060056000,
		open: 1.13518,
		high: 1.13606,
		low: 1.13482,
		close: 1.1354,
		volume: 29412
	}
];

// const test1Open = ohlcvTestData1.map((ohlcv) => ohlcv.open);
const test1High = ohlcvTestData1.map((ohlcv) => ohlcv.high);
const test1Low = ohlcvTestData1.map((ohlcv) => ohlcv.low);
const test1Close = ohlcvTestData1.map((ohlcv) => ohlcv.close);
const test1Volume = ohlcvTestData1.map((ohlcv) => ohlcv.volume);

// const array1 = [
// 	2,
// 	3,
// 	5,
// 	7,
// 	11,
// 	13,
// 	17,
// 	19,
// 	23,
// 	29,
// 	31,
// 	37,
// 	41,
// 	43,
// 	47,
// 	53,
// 	59,
// 	61,
// 	67,
// 	71,

// 	2,
// 	3,
// 	5,
// 	7,
// 	11,
// 	13,
// 	17,
// 	19,
// 	23,
// 	29,
// 	31,
// 	37,
// 	41,
// 	43,
// 	47,
// 	53,
// 	59,
// 	61,
// 	67,
// 	71
// ];

// const fast = 12,
// 	slow = 26,
// 	signal = 9;

test('Placeholder test', () => {
	// Arrange
	// Act
	// Assert
	expect(true).toBeTruthy();
});

// test('Hello World test', () => {
// 	// Arrange
// 	const expectedResult = 'Hello, world!';

// 	// Act
// 	const actualResult = helloWorld();

// 	// Assert
// 	expect(actualResult).toBe(expectedResult);
// });

// test('KaelZhang macd Test 1 Comprehensive', () => {
// 	for (let i = 0; i < array1.length; i++) {
// 		// Arrange
// 		const array = array1.slice(i);
// 		const expectedResult1 = macdKaelZhang.default(
// 			array,
// 			slow,
// 			fast,
// 			signal
// 		);

// 		// Act
// 		const actualResult1 = macd(array, fast, slow, signal, false);

// 		// Assert
// 		expect(actualResult1[0]).toStrictEqual(expectedResult1.MACD);
// 		expect(actualResult1[1]).toStrictEqual(expectedResult1.signal);
// 	}
// });

// test('@d3fc macd Test 1 Comprehensive', () => {
// 	const fnNaNToUndefined = (n: number) => (Number.isNaN(n) ? undefined : n);
// 	const fnD3fc = d3fc.indicatorMacd();
// 	// Note ema fn is d3fc.indicatorExponentialMovingAverage();

// 	console.log('fnD3fc is', typeof fnD3fc, fnD3fc);

// 	fnD3fc.fastPeriod(fast);
// 	fnD3fc.slowPeriod(slow);
// 	fnD3fc.signalPeriod(signal);

// 	for (let i = 0; i < array1.length; i++) {
// 		// Arrange
// 		const array = array1.slice(i);
// 		const resultD3fc1 = fnD3fc(array);
// 		const expectedResultMacd1 = resultD3fc1.map(
// 			(datum: any) => datum.macd
// 		);
// 		const expectedResultSignal1 = resultD3fc1.map(
// 			(datum: any) => datum.signal
// 		);

// 		// Act
// 		const actualResult1 = macd(array, fast, slow, signal, true);
// 		const actualResultMacd1 = actualResult1[0].map(fnNaNToUndefined);
// 		const actualResultSignal1 = actualResult1[1].map(fnNaNToUndefined);

// 		expect(actualResultMacd1).toStrictEqual(expectedResultMacd1);
// 		expect(actualResultSignal1).toStrictEqual(expectedResultSignal1);
// 	}
// });

// **** Tests of Indicators ****

test('ADL test 1', () => {
	// Arrange

	// Act
	const expectedResult = TA.adl(
		test1High,
		test1Low,
		test1Close,
		test1Volume
	);
	const actualResult = engine.adl(
		test1High,
		test1Low,
		test1Close,
		test1Volume
	);

	// Assert
	expect(actualResult).toStrictEqual(expectedResult);
});

test('ADX test 1', () => {
	// Arrange
	const window = 14;

	// Act
	const expectedResult = TA.adx(test1High, test1Low, test1Close, window);
	const actualResult = engine.adx(test1High, test1Low, test1Close, window);

	// Assert
	expect(actualResult).toStrictEqual(expectedResult);
});

test('BB test 1', () => {
	// Arrange
	const window = 20;
	const mult = 2;

	// Act
	const expectedResult = TA.bb(test1Close, window, mult);
	const actualResult = engine.bb(test1Close, window, mult);

	// Assert

	expect(actualResult.lower).toStrictEqual(expectedResult.lower);
	expect(actualResult.middle).toStrictEqual(expectedResult.middle);
	expect(actualResult.upper).toStrictEqual(expectedResult.upper);
});

test('BBP test 1', () => {
	// Arrange
	const window = 20;
	const mult = 2;

	// Act
	const expectedResult = TA.bbp(test1Close, window, mult);
	const actualResult = engine.bbp(test1Close, window, mult);

	// Assert
	expect(actualResult).toStrictEqual(expectedResult);
});

// ta-math does not implement bbw().

// test('BBW test 1', () => {
// 	// Arrange
// 	const window = 20;
// 	const mult = 2;

// 	// Act
// 	const expectedResult = TA.bbw(test1Close, window, mult);
// 	const actualResult = engine.bbw(test1Close, window, mult);

// 	// Assert
// 	expect(actualResult).toStrictEqual(expectedResult);
// });

// Next: cci()

test('MFI test 1', () => {
	// Arrange
	const window = 14;

	// Act
	const expectedResult = TA.mfi(
		test1High,
		test1Low,
		test1Close,
		test1Volume,
		window
	);
	const actualResult = engine.mfi(
		test1High,
		test1Low,
		test1Close,
		test1Volume,
		window
	);

	// Assert
	expect(actualResult).toStrictEqual(expectedResult);
});

test('RSI test 1', () => {
	// Arrange
	const window = 14;

	// Act
	const expectedResult = TA.rsi(test1Close, window);
	const actualResult = engine.rsi(test1Close, window);

	// Assert
	expect(actualResult).toStrictEqual(expectedResult);
});
