// safetyConfig.js — All safety thresholds in one place
// Easy to tune without touching logic

const SAFETY = {
  gas: {
    H2S_MAX_PPM: parseFloat(process.env.GAS_H2S_THRESHOLD_PPM) || 10,   // Hydrogen Sulphide
    CO_MAX_PPM: parseFloat(process.env.GAS_CO_THRESHOLD_PPM) || 35,      // Carbon Monoxide
    CH4_MAX_PERCENT: parseFloat(process.env.GAS_CH4_THRESHOLD_PERCENT) || 1, // Methane
    O2_MIN_PERCENT: parseFloat(process.env.O2_MIN_PERCENT) || 19.5,      // Oxygen
  },
  shift: {
    MAX_HOURS: parseFloat(process.env.MAX_SHIFT_HOURS) || 8,
    FATIGUE_WARNING_HOURS: 6,
  },
};

module.exports = SAFETY;
