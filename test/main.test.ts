// thaw-ta-math/test/main.test.ts

'use strict';

// import * as macdKaelZhang from 'macd';
// import * as d3fc from '@d3fc/d3fc-technical-indicator';

// // import helloWorld from '../lib/index';

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
