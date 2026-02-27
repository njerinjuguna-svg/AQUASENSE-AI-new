const { classifyPH, classifyTurbidity, classifyDO, classifyTemperature, calculateRiskLevel, generateExplanation } = require('../utils/complianceEngine');

// POST /api/ai/analyze  (protected - quick analysis without saving to DB)
exports.analyzeWaterQuality = async (req, res) => {
  try {
    const { ph, turbidity, temperature, dissolved_oxygen, organization_type } = req.body;

    if (ph === undefined && turbidity === undefined && dissolved_oxygen === undefined) {
      return res.status(400).json({ message: 'Provide at least one parameter: ph, turbidity, or dissolved_oxygen.' });
    }

    const { risk_level, reasons } = calculateRiskLevel(ph, turbidity, dissolved_oxygen, temperature);
    const ai_explanation = generateExplanation(ph, turbidity, dissolved_oxygen, risk_level, organization_type || req.user?.organization_type);

    const result = {
      risk_level,
      ai_explanation,
      reasons,
      analysis: {}
    };

    const phResult   = classifyPH(ph);
    const turbResult = classifyTurbidity(turbidity);
    const doResult   = classifyDO(dissolved_oxygen);
    const tempResult = classifyTemperature(temperature);

    if (phResult)   result.analysis.pH               = phResult;
    if (turbResult) result.analysis.Turbidity        = turbResult;
    if (doResult)   result.analysis.Dissolved_Oxygen = doResult;
    if (tempResult) result.analysis.Temperature      = tempResult;

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Analysis failed.', error: error.message });
  }
};
