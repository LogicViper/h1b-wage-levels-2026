/**
 * H1B Wage Levels 2026 - Main Application
 * Interactive US county map with wage level visualization
 */

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        colors: {
            belowLevel1: '#e8e8e8',
            level1: '#7eb0d5',
            level2: '#d9d4b8',
            level3: '#f25c5c'
        },
        topoJsonUrl: 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json',
        defaultSalary: 108000
    };

    // Application state
    const state = {
        salary: CONFIG.defaultSalary,
        occupation: '',
        selectedState: '',
        countyData: null,
        countyVariations: {}, // Store random variations for consistency
        svg: null,
        tooltip: null,
        projection: null,
        path: null
    };

    /**
     * Initialize the application
     */
    async function init() {
        console.log('Initializing H1B Wage Levels Dashboard...');

        // Cache DOM elements
        state.tooltip = document.getElementById('tooltip');

        // Initialize filters
        initFilters();

        // Load and render map
        await loadMap();

        // Set up event listeners
        setupEventListeners();

        console.log('Dashboard ready!');
    }

    /**
     * Initialize filter dropdowns with data
     */
    function initFilters() {
        // Populate occupation dropdown
        const occupationSelect = document.getElementById('occupation');
        WageData.occupations.forEach(occ => {
            const option = document.createElement('option');
            option.value = occ.code;
            option.textContent = occ.title;
            occupationSelect.appendChild(option);
        });
        // Set default to Business Intelligence Analysts
        occupationSelect.value = '15-1254';

        // Populate state dropdown
        const stateSelect = document.getElementById('state');
        WageData.states.forEach(s => {
            const option = document.createElement('option');
            option.value = s.code;
            option.textContent = s.name;
            stateSelect.appendChild(option);
        });
    }

    /**
     * Load TopoJSON data and render map
     */
    async function loadMap() {
        const mapContainer = document.getElementById('map');
        mapContainer.innerHTML = '<div class="loading">Loading map data</div>';

        try {
            const response = await fetch(CONFIG.topoJsonUrl);
            if (!response.ok) throw new Error('Failed to load map data');

            const us = await response.json();
            state.countyData = us;

            // Clear loading state
            mapContainer.innerHTML = '';

            // Render the map
            renderMap(us);
        } catch (error) {
            console.error('Error loading map:', error);
            mapContainer.innerHTML = `<div class="loading" style="color: #c41e3a;">
        Failed to load map. Please refresh the page.
      </div>`;
        }
    }

    /**
     * Render the US county map
     */
    function renderMap(us) {
        const mapContainer = document.getElementById('map');
        const width = mapContainer.clientWidth;
        const height = mapContainer.clientHeight || 500;

        // Create SVG
        state.svg = d3.select('#map')
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // Create projection
        state.projection = d3.geoAlbersUsa()
            .scale(width * 1.1)
            .translate([width / 2, height / 2]);

        state.path = d3.geoPath().projection(state.projection);

        // Get features
        const counties = topojson.feature(us, us.objects.counties);
        const states = topojson.feature(us, us.objects.states);

        // Generate consistent random variations for each county
        counties.features.forEach(county => {
            if (!state.countyVariations[county.id]) {
                state.countyVariations[county.id] = Math.random();
            }
        });

        // Draw counties
        state.svg.append('g')
            .attr('class', 'counties')
            .selectAll('path')
            .data(counties.features)
            .enter()
            .append('path')
            .attr('class', 'county')
            .attr('d', state.path)
            .attr('fill', d => getCountyColor(d))
            .attr('data-fips', d => d.id)
            .on('mouseover', handleMouseOver)
            .on('mousemove', handleMouseMove)
            .on('mouseout', handleMouseOut);

        // Draw state borders
        state.svg.append('path')
            .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
            .attr('class', 'state-border')
            .attr('d', state.path);
    }

    /**
     * Get color for a county based on wage level
     */
    function getCountyColor(county) {
        const stateCode = county.id.substring(0, 2);
        const variation = state.countyVariations[county.id] || 0.5;
        const level = WageData.calculateWageLevel(state.salary, stateCode, variation);

        switch (level) {
            case 0: return CONFIG.colors.belowLevel1;
            case 1: return CONFIG.colors.level1;
            case 2: return CONFIG.colors.level2;
            case 3: return CONFIG.colors.level3;
            default: return CONFIG.colors.belowLevel1;
        }
    }

    /**
     * Update all county colors
     */
    function updateCountyColors() {
        state.svg.selectAll('.county')
            .transition()
            .duration(300)
            .attr('fill', d => getCountyColor(d));
    }

    /**
     * Handle mouse over county
     */
    function handleMouseOver(event, d) {
        const tooltip = state.tooltip;
        const stateCode = d.id.substring(0, 2);
        const variation = state.countyVariations[d.id] || 0.5;
        const level = WageData.calculateWageLevel(state.salary, stateCode, variation);
        const thresholds = WageData.getThresholds(stateCode, variation);
        const stateAbbr = WageData.fipsToState[stateCode] || '';
        const stateName = WageData.stateNames[stateAbbr] || 'Unknown';

        // Get county name from properties if available
        const countyName = d.properties?.name || `County ${d.id}`;

        const levelLabels = ['Below Level 1', 'Level 1', 'Level 2', 'Level 3'];
        const levelColors = [
            CONFIG.colors.belowLevel1,
            CONFIG.colors.level1,
            CONFIG.colors.level2,
            CONFIG.colors.level3
        ];

        tooltip.innerHTML = `
      <div class="tooltip-title">${countyName}, ${stateName}</div>
      <div class="tooltip-content">
        <strong>Wage Thresholds:</strong><br>
        Level 1: $${thresholds.level1.toLocaleString()}<br>
        Level 2: $${thresholds.level2.toLocaleString()}<br>
        Level 3: $${thresholds.level3.toLocaleString()}
      </div>
      <div class="tooltip-level" style="background-color: ${levelColors[level]}; color: ${level === 0 ? '#333' : '#fff'};">
        Your salary: ${levelLabels[level]}
      </div>
    `;

        tooltip.classList.add('visible');
    }

    /**
     * Handle mouse move
     */
    function handleMouseMove(event) {
        const tooltip = state.tooltip;
        const mapContainer = document.getElementById('map');
        const rect = mapContainer.getBoundingClientRect();

        let x = event.clientX - rect.left + 15;
        let y = event.clientY - rect.top + 15;

        // Prevent tooltip from going outside container
        const tooltipRect = tooltip.getBoundingClientRect();
        if (x + tooltipRect.width > rect.width) {
            x = event.clientX - rect.left - tooltipRect.width - 15;
        }
        if (y + tooltipRect.height > rect.height) {
            y = event.clientY - rect.top - tooltipRect.height - 15;
        }

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    }

    /**
     * Handle mouse out
     */
    function handleMouseOut() {
        state.tooltip.classList.remove('visible');
    }

    /**
     * Set up event listeners for filters
     */
    function setupEventListeners() {
        // Salary input
        const salaryInput = document.getElementById('salary');
        salaryInput.addEventListener('input', debounce((e) => {
            const value = parseSalary(e.target.value);
            if (value > 0) {
                state.salary = value;
                updateCountyColors();
            }
        }, 300));

        salaryInput.addEventListener('blur', (e) => {
            // Format the value nicely
            const value = parseSalary(e.target.value);
            if (value > 0) {
                e.target.value = value.toLocaleString();
            }
        });

        // Occupation select
        document.getElementById('occupation').addEventListener('change', (e) => {
            state.occupation = e.target.value;
            // In a real app, this would adjust wage thresholds based on occupation
            updateCountyColors();
        });

        // State filter
        document.getElementById('state').addEventListener('change', (e) => {
            state.selectedState = e.target.value;
            // Could zoom to state or highlight it
        });

        // Handle window resize
        window.addEventListener('resize', debounce(() => {
            if (state.countyData) {
                document.getElementById('map').innerHTML = '';
                renderMap(state.countyData);
            }
        }, 250));
    }

    /**
     * Parse salary string to number
     */
    function parseSalary(str) {
        if (!str) return 0;
        // Remove commas, dollar signs, spaces
        const cleaned = str.replace(/[$,\s]/g, '');
        return parseInt(cleaned, 10) || 0;
    }

    /**
     * Debounce function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
