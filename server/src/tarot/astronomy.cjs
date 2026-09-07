// Select Astronomy Engine's declared CommonJS entry. Its ESM .js entry has no
// package type declaration and fails when Lambda disables syntax detection.
const astronomy = require('astronomy-engine');
exports.Body = astronomy.Body;
exports.GeoVector = astronomy.GeoVector;
exports.Ecliptic = astronomy.Ecliptic;
exports.SiderealTime = astronomy.SiderealTime;
exports.Rotation_ECT_EQD = astronomy.Rotation_ECT_EQD;
