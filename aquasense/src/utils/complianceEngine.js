// AquaSense AI - Compliance & Risk Engine
// Based on: AquaSense_Backend_Handoff_Document.pdf + Security Specifications

/**
 * pH Classification Logic (from Handoff Doc Section 2)
 */
function classifyPH(ph) {
  if (ph === undefined || ph === null) return null;
  if (ph < 6.5) return { value: ph, level: 'LOW', result: 'LOW, The water is acidic, treat with alkaline solution to neutralise it' };
  if (ph <= 8.5) return { value: ph, level: 'OPTIMUM', result: 'MEDIUM / OPTIMUM, The water is ideal and safe for use' };
  return { value: ph, level: 'HIGH', result: 'HIGH, The water is alkaline, treat with acidic solution to neutralize it' };
}

/**
 * Turbidity (NTU) Classification Logic (from Handoff Doc Section 3)
 */
function classifyTurbidity(turbidity) {
  if (turbidity === undefined || turbidity === null) return null;
  if (turbidity <= 5) return { value: turbidity, level: 'OPTIMUM', result: 'LOW / OPTIMUM, The water is safe and good for use' };
  if (turbidity <= 50) return { value: turbidity, level: 'MEDIUM', result: 'MEDIUM, The water is slightly turbid. Apply coagulation, sedimentation and filtration' };
  return { value: turbidity, level: 'HIGH', result: 'HIGH, The water is dangerous. Do not use without treatment' };
}

/**
 * Dissolved Oxygen (mg/L) Classification Logic (from Handoff Doc Section 4)
 */
function classifyDO(dissolved_oxygen) {
  if (dissolved_oxygen === undefined || dissolved_oxygen === null) return null;
  if (dissolved_oxygen < 5) return { value: dissolved_oxygen, level: 'LOW', result: 'LOW, Poor water quality. Improve aeration' };
  if (dissolved_oxygen <= 6.5) return { value: dissolved_oxygen, level: 'MEDIUM', result: 'MEDIUM, Acceptable but monitor freshness' };
  if (dissolved_oxygen <= 8) return { value: dissolved_oxygen, level: 'HIGH', result: 'HIGH, Water is fresh and fit for consumption' };
  return { value: dissolved_oxygen, level: 'VERY HIGH', result: 'VERY HIGH, May increase corrosion risk. Degasify' };
}

/**
 * Temperature advisory
 */
function classifyTemperature(temperature) {
  if (temperature === undefined || temperature === null) return null;
  if (temperature > 30) return { value: temperature, level: 'HIGH', result: 'HIGH, Temperature promotes bacterial growth. Cool the water before use.' };
  if (temperature > 25) return { value: temperature, level: 'MEDIUM', result: 'MEDIUM, Slightly elevated. Monitor for bacterial growth.' };
  return { value: temperature, level: 'OPTIMUM', result: 'OPTIMUM, Temperature is within safe range.' };
}

/**
 * Overall Risk Scoring Engine
 * Returns risk_level: LOW | MEDIUM | HIGH | CRITICAL
 */
function calculateRiskLevel(ph, turbidity, dissolved_oxygen, temperature) {
  let score = 0;
  const reasons = [];

  if (ph !== null && ph !== undefined) {
    if (ph < 5.5 || ph > 9.5) { score += 4; reasons.push(`Extreme pH: ${ph}`); }
    else if (ph < 6.5 || ph > 8.5) { score += 2; reasons.push(`pH out of safe range: ${ph}`); }
  }

  if (turbidity !== null && turbidity !== undefined) {
    if (turbidity > 50) { score += 4; reasons.push(`Dangerous turbidity: ${turbidity} NTU`); }
    else if (turbidity > 5) { score += 1; reasons.push(`Elevated turbidity: ${turbidity} NTU`); }
  }

  if (dissolved_oxygen !== null && dissolved_oxygen !== undefined) {
    if (dissolved_oxygen < 3) { score += 3; reasons.push(`Critically low dissolved oxygen: ${dissolved_oxygen} mg/L`); }
    else if (dissolved_oxygen < 5) { score += 2; reasons.push(`Low dissolved oxygen: ${dissolved_oxygen} mg/L`); }
  }

  if (temperature !== null && temperature !== undefined) {
    if (temperature > 30) { score += 1; reasons.push(`High temperature: ${temperature}°C`); }
  }

  let risk_level;
  if (score >= 7) risk_level = 'CRITICAL';
  else if (score >= 4) risk_level = 'HIGH';
  else if (score >= 2) risk_level = 'MEDIUM';
  else risk_level = 'LOW';

  return { risk_level, score, reasons };
}

/**
 * Generate plain-language AI explanation (Problem Statement: "translate readings into understandable insights")
 */
function generateExplanation(ph, turbidity, dissolved_oxygen, risk_level, organization_type) {
  const orgContext = organization_type === 'pharmaceutical' || organization_type === 'food'
    ? 'For your regulated industry, this is especially important for compliance.'
    : organization_type === 'residential' || organization_type === 'school'
    ? 'Ensuring water safety is critical for the people using this water daily.'
    : 'Monitoring this ensures operational safety.';

  if (risk_level === 'CRITICAL') {
    return `CRITICAL ALERT: Multiple water quality parameters are severely out of safe range. This water should NOT be used until treated. ${orgContext} Immediate action is required.`;
  }
  if (risk_level === 'HIGH') {
    return `WARNING: Your water quality readings indicate elevated risk. pH at ${ph ?? 'N/A'} and turbidity at ${turbidity ?? 'N/A'} NTU suggest treatment is needed before use. ${orgContext}`;
  }
  if (risk_level === 'MEDIUM') {
    return `CAUTION: Some parameters are outside optimal range. Water may be acceptable for some uses but monitor closely. ${orgContext} Consider reviewing your filtration process.`;
  }
  return `Water quality looks acceptable. All measured parameters are within safe operational ranges. ${orgContext} Continue regular monitoring.`;
}

/**
 * Determine if an alert should be triggered
 */
function shouldTriggerAlert(ph, turbidity, dissolved_oxygen) {
  return (
    (ph !== undefined && ph !== null && (ph < 6.5 || ph > 8.5)) ||
    (turbidity !== undefined && turbidity !== null && turbidity > 5) ||
    (dissolved_oxygen !== undefined && dissolved_oxygen !== null && dissolved_oxygen < 5)
  );
}

module.exports = {
  classifyPH,
  classifyTurbidity,
  classifyDO,
  classifyTemperature,
  calculateRiskLevel,
  generateExplanation,
  shouldTriggerAlert
};
