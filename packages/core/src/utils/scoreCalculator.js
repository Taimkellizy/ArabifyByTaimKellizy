/**
 * Calculates the weighted project score.
 * Main files (App.js, index.html, App.css) are given 2x weight.
 * 
 * @param {Array} resultsList - List of analysis results
 * @param {Object} config - Configuration object
 * @returns {number} Weighted average score (0-100)
 */
export const calculateProjectScore = (resultsList, config) => {
    if (!resultsList || resultsList.length === 0) return 0;

    let totalScore = 0;
    let totalWeight = 0;

    resultsList.forEach(file => {
        let weight = 1;

        // Check config-defined main files
        if (config) {
            if ((config.appFileName && file.fileName === config.appFileName) || 
                (config.htmlFileName && file.fileName === config.htmlFileName)) {
                weight = 2;
            }
        }

        // Check standard main files (heuristics)
        const lowerName = (file.fileName || "").toLowerCase();
        if (['app.css', 'index.css', 'index.html', 'app.js', 'app.jsx'].includes(lowerName)) {
            weight = 2;
        }

        totalScore += (file.score * weight);
        totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
};
