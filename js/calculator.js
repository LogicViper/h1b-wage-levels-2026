/**
 * Salary Calculator Module
 * Handles salary gap calculations, cost of living adjustments, and tax calculations
 */

const SalaryCalculator = (function () {
    'use strict';

    let colData = {};

    // State tax rates (simplified - using marginal rates for typical H1B salaries)
    const STATE_TAX_RATES = {
        'AL': 0.05, 'AK': 0, 'AZ': 0.045, 'AR': 0.059, 'CA': 0.093,
        'CO': 0.0455, 'CT': 0.0699, 'DE': 0.066, 'FL': 0, 'GA': 0.0575,
        'HI': 0.11, 'ID': 0.06, 'IL': 0.0495, 'IN': 0.0323, 'IA': 0.0853,
        'KS': 0.057, 'KY': 0.05, 'LA': 0.0425, 'ME': 0.0715, 'MD': 0.0575,
        'MA': 0.05, 'MI': 0.0425, 'MN': 0.0985, 'MS': 0.05, 'MO': 0.054,
        'MT': 0.0675, 'NE': 0.0684, 'NV': 0, 'NH': 0, 'NJ': 0.1075,
        'NM': 0.059, 'NY': 0.0685, 'NC': 0.0499, 'ND': 0.029, 'OH': 0.0399,
        'OK': 0.05, 'OR': 0.099, 'PA': 0.0307, 'RI': 0.0599, 'SC': 0.07,
        'SD': 0, 'TN': 0, 'TX': 0, 'UT': 0.0495, 'VT': 0.0875,
        'VA': 0.0575, 'WA': 0, 'WV': 0.065, 'WI': 0.0765, 'WY': 0,
        'DC': 0.0895
    };

    // Federal tax brackets 2024 (single filer)
    const FEDERAL_BRACKETS = [
        { limit: 11600, rate: 0.10 },
        { limit: 47150, rate: 0.12 },
        { limit: 100525, rate: 0.22 },
        { limit: 191950, rate: 0.24 },
        { limit: 243725, rate: 0.32 },
        { limit: 609350, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
    ];

    const STANDARD_DEDUCTION = 14600;
    const FICA_RATE = 0.0765; // Social Security + Medicare

    /**
     * Load cost of living data
     */
    async function loadCOLData() {
        try {
            const response = await fetch('./data/cost_of_living.json');
            colData = await response.json();
            console.log('Cost of living data loaded:', Object.keys(colData).length, 'areas');
        } catch (error) {
            console.error('Failed to load COL data:', error);
        }
    }

    /**
     * Get COL index for an area
     */
    function getCOLIndex(areaCode) {
        return colData[areaCode]?.colIndex || 100; // Default to national average
    }

    /**
     * Calculate salary gaps to reach each wage level
     */
    function calculateSalaryGaps(currentSalary, wages) {
        if (!wages) return null;

        const gaps = {
            level1: Math.max(0, wages.l1 - currentSalary),
            level2: Math.max(0, wages.l2 - currentSalary),
            level3: Math.max(0, wages.l3 - currentSalary),
            level4: Math.max(0, wages.l4 - currentSalary)
        };

        // Determine current level
        let currentLevel = 0;
        if (currentSalary >= wages.l4) currentLevel = 4;
        else if (currentSalary >= wages.l3) currentLevel = 3;
        else if (currentSalary >= wages.l2) currentLevel = 2;
        else if (currentSalary >= wages.l1) currentLevel = 1;

        return { gaps, currentLevel, thresholds: wages };
    }

    /**
     * Adjust salary for cost of living between two areas
     */
    function adjustForCOL(salary, fromAreaCode, toAreaCode) {
        const fromCOL = getCOLIndex(fromAreaCode);
        const toCOL = getCOLIndex(toAreaCode);

        // Adjusted salary = original salary * (target COL / current COL)
        const adjustedSalary = salary * (toCOL / fromCOL);

        return {
            original: salary,
            adjusted: Math.round(adjustedSalary),
            fromCOL,
            toCOL,
            percentChange: ((toCOL - fromCOL) / fromCOL * 100).toFixed(1)
        };
    }

    /**
     * Calculate federal income tax
     */
    function calculateFederalTax(taxableIncome) {
        let tax = 0;
        let previousLimit = 0;

        for (const bracket of FEDERAL_BRACKETS) {
            if (taxableIncome <= previousLimit) break;

            const taxableInBracket = Math.min(taxableIncome, bracket.limit) - previousLimit;
            tax += taxableInBracket * bracket.rate;
            previousLimit = bracket.limit;
        }

        return tax;
    }

    /**
     * Calculate post-tax take-home pay
     */
    function calculateTakeHome(grossSalary, stateAbbr) {
        // Calculate taxable income
        const taxableIncome = Math.max(0, grossSalary - STANDARD_DEDUCTION);

        // Federal tax
        const federalTax = calculateFederalTax(taxableIncome);

        // State tax
        const stateTaxRate = STATE_TAX_RATES[stateAbbr] || 0;
        const stateTax = taxableIncome * stateTaxRate;

        // FICA (Social Security + Medicare)
        const ficaTax = grossSalary * FICA_RATE;

        // Total tax
        const totalTax = federalTax + stateTax + ficaTax;

        // Take-home
        const takeHome = grossSalary - totalTax;

        return {
            gross: grossSalary,
            taxableIncome,
            federalTax: Math.round(federalTax),
            stateTax: Math.round(stateTax),
            ficaTax: Math.round(ficaTax),
            totalTax: Math.round(totalTax),
            takeHome: Math.round(takeHome),
            effectiveRate: ((totalTax / grossSalary) * 100).toFixed(1)
        };
    }

    /**
     * Compare take-home pay between two locations
     */
    function compareTakeHome(salary, area1Code, area1State, area2Code, area2State) {
        const takeHome1 = calculateTakeHome(salary, area1State);
        const takeHome2 = calculateTakeHome(salary, area2State);

        // Adjust for COL
        const col1 = getCOLIndex(area1Code);
        const col2 = getCOLIndex(area2Code);

        const purchasingPower1 = takeHome1.takeHome / col1 * 100;
        const purchasingPower2 = takeHome2.takeHome / col2 * 100;

        return {
            location1: {
                ...takeHome1,
                colIndex: col1,
                purchasingPower: Math.round(purchasingPower1)
            },
            location2: {
                ...takeHome2,
                colIndex: col2,
                purchasingPower: Math.round(purchasingPower2)
            },
            difference: Math.round(purchasingPower2 - purchasingPower1),
            percentDifference: (((purchasingPower2 - purchasingPower1) / purchasingPower1) * 100).toFixed(1)
        };
    }

    // Public API
    return {
        loadCOLData,
        getCOLIndex,
        calculateSalaryGaps,
        adjustForCOL,
        calculateTakeHome,
        compareTakeHome
    };
})();
