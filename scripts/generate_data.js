const fs = require('fs');
const path = require('path');
const readline = require('readline');

const OES_SOC_OCCS_PATH = path.join(__dirname, '../data/OFLC_Wages_2025-26_Updated/oes_soc_occs.csv');
const ALC_EXPORT_PATH = path.join(__dirname, '../data/OFLC_Wages_2025-26_Updated/ALC_Export.csv');
const OCCUPATIONS_OUT_PATH = path.join(__dirname, '../data/occupations.json');
const WAGES_OUT_PATH = path.join(__dirname, '../data/wages.json');

// Helper to parse CSV line respecting quotes
function parseCSVLine(line) {
    const result = [];
    let start = 0;
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
            let field = line.substring(start, i);
            // Remove surrounding quotes
            if (field.startsWith('"') && field.endsWith('"')) {
                field = field.substring(1, field.length - 1);
            }
            result.push(field);
            start = i + 1;
        }
    }
    let lastField = line.substring(start);
    if (lastField.startsWith('"') && lastField.endsWith('"')) {
        lastField = lastField.substring(1, lastField.length - 1);
    }
    result.push(lastField);
    return result;
}

async function generateData() {
    console.log('Starting data generation...');

    // 1. Load all valid occupations from oes_soc_occs.csv
    console.log(`Reading occupations from ${OES_SOC_OCCS_PATH}...`);
    const occupationsMap = new Map(); // code -> title

    const occStream = fs.createReadStream(OES_SOC_OCCS_PATH);
    const occRl = readline.createInterface({
        input: occStream,
        crlfDelay: Infinity
    });

    let occHeaderSkipped = false;
    for await (const line of occRl) {
        if (!occHeaderSkipped) {
            occHeaderSkipped = true;
            continue;
        }
        // Format: "soccode","Title","Description"
        const parts = parseCSVLine(line);
        if (parts.length >= 2) {
            const code = parts[0].trim();
            const title = parts[1].trim();
            if (code && title) {
                occupationsMap.set(code, title);
            }
        }
    }
    console.log(`Loaded ${occupationsMap.size} occupations.`);

    // 2. Parse ALC_Export.csv to build wage data and filter relevant occupations
    console.log(`Reading wage data from ${ALC_EXPORT_PATH}...`);
    const wagesData = {}; // Area -> SocCode -> [WageLevel1, WageLevel2, WageLevel3, WageLevel4]
    const occupationsWithWages = new Set();

    const wageStream = fs.createReadStream(ALC_EXPORT_PATH);
    const wageRl = readline.createInterface({
        input: wageStream,
        crlfDelay: Infinity
    });

    let wageHeaderSkipped = false;
    let lineCount = 0;

    for await (const line of wageRl) {
        if (!wageHeaderSkipped) {
            wageHeaderSkipped = true;
            continue;
        }
        lineCount++;
        if (lineCount % 50000 === 0) process.stdout.write(`Processed ${lineCount} lines...\r`);

        // Format: "Area","SocCode","GeoLvl","Level1","Level2","Level3","Level4","Average","Label"
        const parts = parseCSVLine(line);
        if (parts.length >= 7) {
            const area = parts[0].trim();
            const socCode = parts[1].trim();
            // We strip quotes and convert to number, assuming formatting like "47.73" or similar. 
            // NOTE: The example file viewed previously showed wages as "47.73". 
            // In the original wages.json, they seem to be annual integers e.g. 41413.
            // Let's verify if the input is hourly or annual. 
            // The previous viewer showed: "10180","11-1011",1,"47.73","74.99","102.25","129.51"
            // Wait, 47.73/hr is ~99k/yr. 
            // However, looking at the previous wages.json viewer output:
            // "10180":{"11-1021":[41413,70138,98842,127566]
            // Let's check `11-1021` in ALC_Export:
            // "10180","11-1021",1,"19.91","33.72","47.52","61.33"
            // 19.91 * 2080 = 41412.8. So it matches annual wages.
            // We need to converting hourly to annual: wage * 2080.

            const l1 = parseFloat(parts[3]);
            const l2 = parseFloat(parts[4]);
            const l3 = parseFloat(parts[5]);
            const l4 = parseFloat(parts[6]);

            if (!isNaN(l1) && !isNaN(l2) && !isNaN(l3) && !isNaN(l4)) {
                // Convert to annual integer
                const w1 = Math.round(l1 * 2080);
                const w2 = Math.round(l2 * 2080);
                const w3 = Math.round(l3 * 2080);
                const w4 = Math.round(l4 * 2080);

                if (!wagesData[area]) {
                    wagesData[area] = {};
                }
                wagesData[area][socCode] = [w1, w2, w3, w4];
                occupationsWithWages.add(socCode);
            }
        }
    }
    console.log('\nFinished processing wage data.');

    // 3. Filter occupations
    console.log('Filtering and formatting occupations...');
    const finalOccupations = [];
    for (const [code, title] of occupationsMap.entries()) {
        if (occupationsWithWages.has(code)) {
            finalOccupations.push({ code, title });
        }
    }
    // Sort logic from original: looks like it might strictly be by code or title. 
    // Let's sort by code to be consistent.
    finalOccupations.sort((a, b) => a.code.localeCompare(b.code));

    console.log(`Total occupations with wages: ${finalOccupations.length}`);

    // 4. Write occupations.json
    console.log(`Writing ${OCCUPATIONS_OUT_PATH}...`);
    fs.writeFileSync(OCCUPATIONS_OUT_PATH, JSON.stringify(finalOccupations, null, 2));

    // 5. Write wages.json
    // Note: wages.json is compact not pretty printed usually to save space, but 2 space indent is fine if not too huge.
    // The original file was invalid JSON in the grep output because it was truncated, but usually these are minified. 
    // We'll minify it to be safe for size.
    console.log(`Writing ${WAGES_OUT_PATH}...`);
    fs.writeFileSync(WAGES_OUT_PATH, JSON.stringify(wagesData));

    console.log('Data generation complete.');
}

generateData().catch(err => {
    console.error('Error generating data:', err);
    process.exit(1);
});
