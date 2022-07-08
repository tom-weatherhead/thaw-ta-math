// thaw-ta-math/src/constants.ts

// ADX
export const defaultAdxWindow = 14;
export const defaultAdxThreshold = 25;

// ATR
export const defaultAtrWindow = 14;

// Bollinger bands
// Oxford: Range for Bollinger maWindow = [10, 200], Step = 5;
// the lower frequency of trading is preferred (i.e. maWindow > 60)
export const defaultBollingerMovingAverageWindow = 20;
export const defaultBollingerNumberOfStandardDeviations = 2;

// Donchian channels
export const defaultDonchianWindow = 20; // ???

// Keltner channels
export const defaultKeltnerWindow = 14; // ???
export const defaultKeltnerMult = 2;

// MACD
// export const defaultMacdEmaShort = 12;
// export const defaultMacdEmaLong = 26;
// export const defaultMacdSignal = 9;
// MACD
export const defaultMacdFastPeriod = 12;
export const defaultMacdSlowPeriod = 26;
export const defaultMacdSignalPeriod = 9;

// MFI
export const defaultMfiWindow = 14;
export const defaultMfiLowBand = 20;
export const defaultMfiHighBand = 100 - defaultMfiLowBand;

// RSI
export const defaultRsiWindow = 14;
export const defaultRsiLowBand = 30;
export const defaultRsiHighBand = 100 - defaultRsiLowBand;
