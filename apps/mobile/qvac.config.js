// Only the two QVAC plugins Kagua uses go into the phone's worker bundle.
const { PLUGIN_LLM, PLUGIN_OCR } = require('@qvac/sdk');

module.exports = {
  plugins: [PLUGIN_LLM, PLUGIN_OCR],
};
