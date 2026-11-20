---
title: 'World Oil Reserves Map'
date: '2026-02-09'
description: 'Interactive choropleth map of global proven oil reserves by country from 1980 to 2026, color-coded by crude oil sulfur content.'
tags: ['oil', 'commodities', 'geopolitics', 'data-visualization']
---

<table-of-contents>
  <li><a href="#usage">Usage</a></li>
  <li><a href="#map">Interactive Map</a></li>
  <li><a href="#reading-the-map">Reading the Map</a></li>
  <li><a href="#data-sources">Data Sources</a></li>
</table-of-contents>

## Usage

**Click** any highlighted country to see a popup with reserves, API gravity, sulfur content, and crude classification.

**Hover** over a country for a quick tooltip showing its name and reserves in billions of barrels.

**Drag the year slider** on the right panel to scrub through 47 years of data (1980--2026). Each year loads its own GeoJSON snapshot.

**Keyboard shortcuts**: focus the map and use the **left/right arrow keys** to step through years one at a time.

The **legend** explains the color coding (sulfur content), API gravity weight classes, and benchmark crude types. The **info panel** shows full details for the last country you clicked.

---

## Map

<oil-reserves-map></oil-reserves-map>

---

## Reading the Map

Countries are colored by **sulfur content** of their dominant crude grade:

- **Green** -- Sweet crude (&lt;0.5% sulfur). Easier to refine, commands a premium. Examples: Brent, WTI, Bonny Light.
- **Yellow/Peach** -- Medium sulfur (0.5--1.5%). Requires more processing. Examples: Dubai, Oman, Daqing.
- **Red** -- Sour crude (&gt;1.5% sulfur). Needs extensive desulfurization. Examples: Maya, Kuwait Export, Arab Heavy.
- **Gray** -- No significant proved reserves or data unavailable.

The **API gravity** classification in the info panel tells you whether the crude is light (&gt;31&deg;), medium (22--31&deg;), or heavy (&lt;22&deg;). Lighter crudes yield more gasoline and diesel per barrel.

---

## Data Sources

Reserve estimates sourced from the U.S. Energy Information Administration (EIA), OPEC Annual Statistical Bulletin, and the BP Statistical Review of World Energy. Crude quality data (API gravity, sulfur content) from assay databases and industry references. 2024--2026 figures are estimates based on the most recent available data. Country boundaries from Natural Earth. Map tiles by Esri.
