/**
 * H1B Wage Levels 2026 - Data Module
 * Contains occupations, states, and wage calculation data
 */

const WageData = {
  // Sample occupations commonly used in H1B applications
  occupations: [
    { code: '15-1252', title: 'Software Developers' },
    { code: '15-1211', title: 'Computer Systems Analysts' },
    { code: '15-1299', title: 'Computer Occupations, All Other' },
    { code: '15-2051', title: 'Data Scientists' },
    { code: '15-1244', title: 'Network and Computer Systems Administrators' },
    { code: '15-1243', title: 'Database Administrators and Architects' },
    { code: '15-1212', title: 'Information Security Analysts' },
    { code: '13-1111', title: 'Management Analysts' },
    { code: '13-2011', title: 'Accountants and Auditors' },
    { code: '11-3021', title: 'Computer and Information Systems Managers' },
    { code: '13-1161', title: 'Market Research Analysts and Marketing Specialists' },
    { code: '15-2031', title: 'Operations Research Analysts' },
    { code: '17-2141', title: 'Mechanical Engineers' },
    { code: '17-2071', title: 'Electrical Engineers' },
    { code: '17-2112', title: 'Industrial Engineers' },
    { code: '19-1042', title: 'Medical Scientists' },
    { code: '29-1141', title: 'Registered Nurses' },
    { code: '25-1011', title: 'Business Teachers, Postsecondary' },
    { code: '13-2041', title: 'Credit Analysts' },
    { code: '13-2051', title: 'Financial Analysts' },
    { code: '15-1231', title: 'Computer Network Support Specialists' },
    { code: '15-1232', title: 'Computer User Support Specialists' },
    { code: '15-1245', title: 'Database Administrators' },
    { code: '15-1256', title: 'Software Developers and Software Quality Assurance Analysts and Testers' },
    { code: '15-1257', title: 'Web Developers and Digital Interface Designers' },
    { code: '11-9041', title: 'Architectural and Engineering Managers' },
    { code: '15-2041', title: 'Statisticians' },
    { code: '19-2031', title: 'Chemists' },
    { code: '15-1221', title: 'Computer and Information Research Scientists' },
    { code: '15-1254', title: 'Business Intelligence Analysts | Clinical D...' }
  ],

  // US States
  states: [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' }
  ],

  // Base wage thresholds for typical software developer occupation
  // These are mock values representing typical wage level thresholds
  baseWageThresholds: {
    level1: 60000,  // Entry level
    level2: 85000,  // Experienced
    level3: 110000, // Senior
    level4: 140000  // Expert
  },

  // Regional multipliers for cost of living adjustment
  // Higher values = higher cost of living = higher wage thresholds
  regionalMultipliers: {
    // High cost areas
    'CA': 1.35, 'NY': 1.30, 'MA': 1.25, 'WA': 1.25, 'NJ': 1.20,
    'CT': 1.18, 'MD': 1.15, 'DC': 1.35, 'CO': 1.12, 'VA': 1.10,
    // Medium cost areas
    'IL': 1.05, 'PA': 1.02, 'FL': 1.00, 'TX': 0.98, 'AZ': 0.95,
    'OR': 1.08, 'MN': 1.00, 'GA': 0.95, 'NC': 0.93, 'MI': 0.92,
    // Lower cost areas  
    'OH': 0.88, 'IN': 0.85, 'WI': 0.88, 'MO': 0.85, 'TN': 0.85,
    'AL': 0.82, 'KY': 0.82, 'SC': 0.85, 'LA': 0.85, 'OK': 0.80,
    'AR': 0.78, 'MS': 0.75, 'WV': 0.78, 'KS': 0.82, 'NE': 0.82,
    'IA': 0.83, 'ND': 0.85, 'SD': 0.82, 'MT': 0.88, 'WY': 0.85,
    'ID': 0.88, 'UT': 0.92, 'NV': 0.98, 'NM': 0.85, 'AK': 1.15,
    'HI': 1.30, 'ME': 0.95, 'VT': 0.98, 'NH': 1.05, 'RI': 1.05,
    'DE': 1.02
  },

  /**
   * Calculate wage level for a given salary and county
   * @param {number} salary - Annual salary in USD
   * @param {string} stateCode - State FIPS code
   * @param {number} countyVariation - Random variation for county-level differences
   * @returns {number} Wage level (0 = below level 1, 1, 2, or 3)
   */
  calculateWageLevel(salary, stateCode, countyVariation = 0) {
    // Get state code from FIPS (first 2 digits)
    const stateAbbr = this.fipsToState[stateCode] || 'TX';
    const multiplier = this.regionalMultipliers[stateAbbr] || 1.0;
    
    // Add county-level variation (-10% to +10%)
    const countyMultiplier = 1 + (countyVariation - 0.5) * 0.2;
    const adjustedMultiplier = multiplier * countyMultiplier;
    
    // Calculate thresholds for this location
    const level1 = this.baseWageThresholds.level1 * adjustedMultiplier;
    const level2 = this.baseWageThresholds.level2 * adjustedMultiplier;
    const level3 = this.baseWageThresholds.level3 * adjustedMultiplier;
    
    // Determine level based on salary
    if (salary >= level3) return 3;
    if (salary >= level2) return 2;
    if (salary >= level1) return 1;
    return 0;
  },

  /**
   * Get wage thresholds for a specific location
   * @param {string} stateCode - State FIPS code
   * @param {number} countyVariation - Variation factor
   * @returns {object} Threshold values
   */
  getThresholds(stateCode, countyVariation = 0.5) {
    const stateAbbr = this.fipsToState[stateCode] || 'TX';
    const multiplier = this.regionalMultipliers[stateAbbr] || 1.0;
    const countyMultiplier = 1 + (countyVariation - 0.5) * 0.2;
    const adjustedMultiplier = multiplier * countyMultiplier;
    
    return {
      level1: Math.round(this.baseWageThresholds.level1 * adjustedMultiplier),
      level2: Math.round(this.baseWageThresholds.level2 * adjustedMultiplier),
      level3: Math.round(this.baseWageThresholds.level3 * adjustedMultiplier)
    };
  },

  // FIPS state codes to abbreviations
  fipsToState: {
    '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
    '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
    '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
    '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
    '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
    '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
    '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
    '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
    '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
    '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
    '56': 'WY'
  },

  // State abbreviations to names
  stateNames: {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'DC': 'District of Columbia', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii',
    'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine',
    'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota',
    'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska',
    'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico',
    'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island',
    'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas',
    'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington',
    'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
  }
};

// Export for use in app.js
window.WageData = WageData;
