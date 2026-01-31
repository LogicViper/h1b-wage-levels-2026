# H1B Wage Levels 2026

An interactive visualization tool to understand your position under the H1B wage-weighted selection framework for 2026.

![H1B Wage Levels Dashboard](https://raw.githubusercontent.com/sriksven/h1b-wage-levels-2026/main/.github/preview.png)

## Live Demo

**[View Live Dashboard](https://sriksven.github.io/h1b-wage-levels-2026)**

## Features

- **Interactive US County Map** - Visualize wage levels across all US counties
- **Real-time Calculations** - Enter your salary to see your wage level across different regions
- **Occupation Selection** - Filter by common H1B occupation types
- **Hover Tooltips** - View detailed wage thresholds for any county
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## Wage Levels

| Level | Color | Description |
|-------|-------|-------------|
| Below Level 1 | Gray | Entry level, below prevailing wage |
| Level 1 | Blue | Entry level, meets minimum threshold |
| Level 2 | Beige | Experienced, above average wage |
| Level 3 | Red/Coral | Senior/Expert, top tier wages |

## Technology Stack

- **HTML5** - Semantic structure
- **CSS3** - Custom properties, Flexbox, Grid, responsive design
- **JavaScript** - Vanilla JS, ES6+
- **D3.js v7** - SVG-based map visualization
- **TopoJSON** - Efficient geographic data format

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/sriksven/h1b-wage-levels-2026.git
   cd h1b-wage-levels-2026
   ```

2. Start a local server:
   ```bash
   npx http-server -p 3000
   ```

3. Open http://localhost:3000 in your browser

## License

MIT License - feel free to use and modify for your own projects.

## Credits

- Map data from [US Atlas TopoJSON](https://github.com/topojson/us-atlas)
- Inspired by official H1B wage data from the U.S. Department of Labor