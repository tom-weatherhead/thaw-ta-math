# thaw-ta-math
Financial technical analysis library in TypeScript. Calculates indicators and overlays from OHLCV data.

[![build status][build-status-badge-image]][build-status-url]
[![npm version][npm-version-badge-image]][npm-version-url]
[![latest tag][latest-tag-badge-image]][latest-tag-url]
[![npm total downloads][npm-total-downloads-badge-image]][npm-total-downloads-url]
[![watchers][watchers-badge-image]][watchers-url]
[![stars][stars-badge-image]][stars-url]
[![forks][forks-badge-image]][forks-url]
[![repo dependents][repo-dependents-badge-image]][repo-dependents-url]
[![pkg dependents][pkg-dependents-badge-image]][pkg-dependents-url]
[![commits][commits-badge-image]][commits-url]
[![last commit][last-commit-badge-image]][last-commit-url]
[![types][types-badge-image]][types-url]
[![install size][install-size-badge-image]][install-size-url]
[![known vulnerabilities][known-vulnerabilities-badge-image]][known-vulnerabilities-url]
[![lines of code][lines-of-code-badge-image]][lines-of-code-url]
[![technical debt][technical-debt-badge-image]][technical-debt-url]
[![maintainability][maintainability-badge-image]][maintainability-url]
[![test coverage][test-coverage-badge-image]][test-coverage-url]
[![tested with jest][jest-badge-image]][jest-url]
[![code style: prettier][prettier-badge-image]][prettier-url]
[![license][license-badge-image]][license-url]

## Indicators

- [adl](https://www.tradingview.com/support/solutions/43000501770-accumulation-distribution-adl/) : Accumulation Distribution Line (created by Marc Chaikin)
- adx : Average Directional Index (by J. Welles Wilder Jr.)
- bbp : Bollinger Bands Percentage (by John Bollinger)
- bbw : Bollinger BandWidth (by John Bollinger)
- cci : Commodity Channel Index (by Donald Lambert)
- cho : Chaikin Oscillator (by Marc Chaikin)
- cmf : Chaikin Money Flow (by Marc Chaikin)
- ii : Intraday Intensity (by David Bostian)
- kst : Know Sure Thing (by Martin Pring)
- macd : Moving Average Convergence Divergence (by Gerald Appel)
- mfi : Money Flow Index (by Gene Quong and Avram Soudek)
- obv : On-Balance Volume
- roc : Price Rate of Change
- rsi : Relative Strength Index (by J. Welles Wilder Jr.)
- stoch : Stochastic Oscillator (by Dr. George Lane)
- stochRsi : Stochastic RSI (by Tushar S. Chande and Stanley Kroll)
- vi : Vortex Indicator (by Etienne Botes and Douglas Siepman)
- vwmacd : Volume-Weighted MACD (by Buff Dormeier)
- williams : Williams %R (aka Williams Percent Range) (by Larry Williams)

## Overlays

- bb : Bollinger Bands (by John Bollinger)
- dema : Double Exponential Moving Average
- ebb
- keltner
- psar : Parabolic Stop and Reversal
- tema : Triple Exponential Moving Average
- vbp : Volume by Price
- vwap : Volume Weighted Average Price
- vwma : Volume-Weighted Moving Average
- zigzag

## License
[MIT](https://choosealicense.com/licenses/mit/)

[build-status-badge-image]: https://circleci.com/gh/tom-weatherhead/thaw-ta-math.svg?style=shield
[build-status-url]: https://circleci.com/gh/tom-weatherhead/thaw-ta-math
[npm-version-badge-image]: https://img.shields.io/npm/v/thaw-ta-math.svg
[npm-version-url]: https://www.npmjs.com/package/thaw-ta-math
[latest-tag-badge-image]: https://badgen.net/github/tag/tom-weatherhead/thaw-ta-math
[latest-tag-url]: https://github.com/tom-weatherhead/thaw-ta-math/tags
[npm-total-downloads-badge-image]: https://img.shields.io/npm/dt/thaw-ta-math.svg
[npm-total-downloads-url]: https://www.npmjs.com/package/thaw-ta-math
[watchers-badge-image]: https://badgen.net/github/watchers/tom-weatherhead/thaw-ta-math
[watchers-url]: https://github.com/tom-weatherhead/thaw-ta-math/watchers
[stars-badge-image]: https://badgen.net/github/stars/tom-weatherhead/thaw-ta-math
[stars-url]: https://github.com/tom-weatherhead/thaw-ta-math/stargazers
[forks-badge-image]: https://badgen.net/github/forks/tom-weatherhead/thaw-ta-math
[forks-url]: https://github.com/tom-weatherhead/thaw-ta-math/network/members
[repo-dependents-badge-image]: https://badgen.net/github/dependents-repo/tom-weatherhead/thaw-ta-math
[repo-dependents-url]: https://badgen.net/github/dependents-repo/tom-weatherhead/thaw-ta-math
[pkg-dependents-badge-image]: https://badgen.net/github/dependents-pkg/tom-weatherhead/thaw-ta-math
[pkg-dependents-url]: https://badgen.net/github/dependents-pkg/tom-weatherhead/thaw-ta-math
[commits-badge-image]: https://badgen.net/github/commits/tom-weatherhead/thaw-ta-math
[commits-url]: https://github.com/tom-weatherhead/thaw-ta-math/commits/master
[last-commit-badge-image]: https://badgen.net/github/last-commit/tom-weatherhead/thaw-ta-math
[last-commit-url]: https://badgen.net/github/last-commit/tom-weatherhead/thaw-ta-math
[types-badge-image]: https://badgen.net/npm/types/thaw-ta-math
[types-url]: https://badgen.net/npm/types/thaw-ta-math
[install-size-badge-image]: https://badgen.net/packagephobia/install/thaw-ta-math
[install-size-url]: https://badgen.net/packagephobia/install/thaw-ta-math
[known-vulnerabilities-badge-image]: https://snyk.io/test/github/tom-weatherhead/thaw-ta-math/badge.svg?targetFile=package.json&package-lock.json
[known-vulnerabilities-url]: https://snyk.io/test/github/tom-weatherhead/thaw-ta-math?targetFile=package.json&package-lock.json
[lines-of-code-badge-image]: https://badgen.net/codeclimate/loc/tom-weatherhead/thaw-ta-math
[lines-of-code-url]: https://badgen.net/codeclimate/loc/tom-weatherhead/thaw-ta-math
[technical-debt-badge-image]: https://badgen.net/codeclimate/tech-debt/tom-weatherhead/thaw-ta-math
[technical-debt-url]: https://badgen.net/codeclimate/tech-debt/tom-weatherhead/thaw-ta-math
[maintainability-badge-image]: https://api.codeclimate.com/v1/badges/c145f666856d62f767c9/maintainability
[maintainability-url]: https://codeclimate.com/github/tom-weatherhead/thaw-ta-math/maintainability
[test-coverage-badge-image]: https://api.codeclimate.com/v1/badges/c145f666856d62f767c9/test_coverage
[test-coverage-url]: https://codeclimate.com/github/tom-weatherhead/thaw-ta-math/test_coverage
[jest-badge-image]: https://img.shields.io/badge/tested_with-jest-99424f.svg
[jest-url]: https://github.com/facebook/jest
[prettier-badge-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[prettier-url]: https://github.com/prettier/prettier
[license-badge-image]: https://img.shields.io/github/license/mashape/apistatus.svg
[license-url]: https://github.com/tom-weatherhead/thaw-ta-math/blob/master/LICENSE
