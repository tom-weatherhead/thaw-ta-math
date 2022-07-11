// thaw-ta-math/src/constants.ts

// ADX - Average Directional Index (by Wilder)
// Indicates the strength of a trend
export const defaultAdxWindow = 14;
// An ADX that is < 20 indicates a weak trend or no trend
// An ADX that is > 25 indicates a strong trend
// The higher the ADX, the stronger the trend.
export const defaultAdxThreshold = 25;

// ATR - Average True Range - Useful for setting stop loss deltas
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
export const defaultMacdFastPeriod = 12;
export const defaultMacdSlowPeriod = 26;
export const defaultMacdSignalPeriod = 9;

// MFI - Money Flow Index
// (Not Bill Williams' Market Fecilitation Index)
export const defaultMfiWindow = 14;
// An MFI of < 20 indicates that the asset is 'oversold'
// -> We may wish to OPEN a LONG order
export const defaultMfiLowBand = 20;
// An MFI of > 80 indicates that the asset is 'overbought'
// -> We may wish to OPEN a SHORT order
export const defaultMfiHighBand = 100 - defaultMfiLowBand;

// RSI
export const defaultRsiWindow = 14;
// An RSI of < 30 indicates that the asset is 'oversold'
// -> We may wish to OPEN a LONG order
export const defaultRsiLowBand = 30;
// An RSI of > 70 indicates that the asset is 'overbought'
// -> We may wish to OPEN a SHORT order
export const defaultRsiHighBand = 100 - defaultRsiLowBand;
