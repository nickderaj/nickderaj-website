// @ts-nocheck -- ported from the Ceres blog; kept as-is rather than rewritten for this repo's stricter tsconfig.
import { scaleLinear } from 'd3-scale';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Layer, LeafletMouseEvent } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CountryProperties {
  NAME: string;
  reserves_barrels: number;
  reserves_billions: number;
  api_gravity: number | null;
  sulfur_percent: number | null;
  crude_sweetness: 'sweet' | 'sour' | null;
  crude_weight: 'light' | 'medium' | 'heavy' | null;
  color: string;
}

type ReservesFeature = Feature<Geometry, CountryProperties>;
type ReservesCollection = FeatureCollection<Geometry, CountryProperties>;

interface MetadataPayload {
  years: number[];
}

type ColorMode = 'sweetness' | 'quantity' | 'gravity';

interface OilReservesMapProps {
  dataDir?: string;
}

// ---------------------------------------------------------------------------
// Theme constants (Catppuccin Mocha)
// ---------------------------------------------------------------------------

const COLORS = {
  base: '#0a0a0a',
  surface: '#1e1e2e',
  postBg: '#1a1a1a',
  border: '#313244',
  textPrimary: '#f5f5f0',
  textBody: '#cdd6f4',
  textMuted: '#a6adc8',
  blue: '#89b4fa',
  green: '#a6e3a1',
  red: '#f38ba8',
  yellow: '#f9e2af',
  peach: '#fab387',
  purple: '#cba6f7',
} as const;

// ---------------------------------------------------------------------------
// Color scale helpers
// ---------------------------------------------------------------------------

const sulfurColorScale = scaleLinear<string>()
  .domain([0, 0.5, 1.0, 1.5, 2.5])
  .range([COLORS.green, '#b5e8a1', COLORS.yellow, COLORS.peach, COLORS.red])
  .clamp(true);

const quantityColorScale = scaleLinear<string>()
  .domain([0, 5, 25, 100, 300])
  .range([COLORS.border, COLORS.blue, COLORS.purple, COLORS.peach, COLORS.red])
  .clamp(true);

const gravityColorScale = scaleLinear<string>()
  .domain([10, 22, 31, 45])
  .range([COLORS.peach, COLORS.yellow, COLORS.blue, COLORS.green])
  .clamp(true);

function getFeatureColor(props: CountryProperties, mode: ColorMode): string {
  if (props.reserves_billions === 0) return COLORS.border;
  if (mode === 'quantity') return quantityColorScale(props.reserves_billions);
  if (mode === 'gravity') {
    if (props.api_gravity == null) return COLORS.border;
    return gravityColorScale(props.api_gravity);
  }
  return props.color;
}

function brightenHex(hex: string, factor: number): string {
  const r = Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * factor));
  const g = Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * factor));
  const b = Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * factor));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function capitalize(s: string | null): string {
  if (!s) return 'N/A';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatNum(v: number | null, decimals: number): string {
  if (v == null) return 'N/A';
  return v.toFixed(decimals);
}

// ---------------------------------------------------------------------------
// Sub-component: keyboard handler that lives inside MapContainer
// ---------------------------------------------------------------------------

function KeyboardYearController({
  years,
  currentYear,
  onYearChange,
}: {
  years: number[];
  currentYear: number;
  onYearChange: (y: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || years.length === 0) return;

    const container = map.getContainer();

    const handler = (e: KeyboardEvent) => {
      const idx = years.indexOf(currentYear);
      if (idx === -1) return;

      if (e.key === 'ArrowLeft' && idx > 0) {
        e.preventDefault();
        onYearChange(years[idx - 1]);
      } else if (e.key === 'ArrowRight' && idx < years.length - 1) {
        e.preventDefault();
        onYearChange(years[idx + 1]);
      }
    };

    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', handler);
    return () => {
      container.removeEventListener('keydown', handler);
    };
  }, [map, years, currentYear, onYearChange]);

  return null;
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 16,
        padding: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div
        className="animate-pulse"
        style={{
          backgroundColor: COLORS.border,
          borderRadius: 8,
          height: 300,
          width: '100%',
        }}
      />
      <div style={{ display: 'flex', gap: 12 }}>
        <div
          className="animate-pulse"
          style={{
            backgroundColor: COLORS.border,
            borderRadius: 4,
            height: 20,
            width: '60%',
          }}
        />
        <div
          className="animate-pulse"
          style={{
            backgroundColor: COLORS.border,
            borderRadius: 4,
            height: 20,
            width: '30%',
          }}
        />
      </div>
      <div
        className="animate-pulse"
        style={{
          backgroundColor: COLORS.border,
          borderRadius: 4,
          height: 14,
          width: '40%',
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Color mode toggle
// ---------------------------------------------------------------------------

function ColorModeToggle({
  mode,
  onChange,
}: {
  mode: ColorMode;
  onChange: (mode: ColorMode) => void;
}) {
  return (
    <div
      style={{
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: 12,
      }}
    >
      <div
        style={{
          color: COLORS.textBody,
          fontSize: 12,
          fontWeight: 500,
          marginBottom: 8,
        }}
      >
        Color By
      </div>
      <div
        style={{
          display: 'flex',
          borderRadius: 6,
          overflow: 'hidden',
          border: `1px solid ${COLORS.border}`,
        }}
      >
        {(
          [
            { key: 'sweetness', label: 'Sulfur' },
            { key: 'quantity', label: 'Reserves' },
            { key: 'gravity', label: 'Gravity' },
          ] as const
        ).map((m) => (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            style={{
              flex: 1,
              padding: '6px 0',
              fontSize: 12,
              fontWeight: mode === m.key ? 600 : 400,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: mode === m.key ? COLORS.blue : COLORS.surface,
              color: mode === m.key ? COLORS.base : COLORS.textMuted,
              transition: 'background-color 0.15s, color 0.15s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legend panel
// ---------------------------------------------------------------------------

function LegendPanel({ colorMode }: { colorMode: ColorMode }) {
  const benchmarks: { name: string; sweetness: string; weight: string; color: string }[] = [
    { name: 'Brent', sweetness: 'Sweet', weight: 'Light', color: COLORS.green },
    { name: 'WTI', sweetness: 'Sweet', weight: 'Light', color: COLORS.green },
    { name: 'Dubai', sweetness: 'Sour', weight: 'Medium', color: COLORS.yellow },
    { name: 'Orinoco', sweetness: 'Sour', weight: 'Heavy', color: COLORS.red },
  ];

  return (
    <div
      style={{
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <h3
        style={{
          color: COLORS.textPrimary,
          fontSize: 14,
          fontWeight: 600,
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Legend
      </h3>

      {colorMode === 'sweetness' && (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              color: COLORS.textBody,
              fontSize: 12,
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            Sulfur Content (%)
          </div>
          <div
            style={{
              height: 12,
              borderRadius: 4,
              background: `linear-gradient(to right, ${[0, 0.5, 1.0, 1.5, 2.5].map((s) => sulfurColorScale(s)).join(', ')})`,
              marginBottom: 4,
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10,
              color: COLORS.textMuted,
            }}
          >
            <span>0% (Sweet)</span>
            <span>0.5%</span>
            <span>1.0%</span>
            <span>1.5%</span>
            <span>2.5%+ (Sour)</span>
          </div>
        </div>
      )}

      {colorMode === 'quantity' && (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              color: COLORS.textBody,
              fontSize: 12,
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            Proved Reserves (billion bbl)
          </div>
          <div
            style={{
              height: 12,
              borderRadius: 4,
              background: `linear-gradient(to right, ${[0, 5, 25, 100, 300].map((v) => quantityColorScale(v)).join(', ')})`,
              marginBottom: 4,
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10,
              color: COLORS.textMuted,
            }}
          >
            <span>0</span>
            <span>5</span>
            <span>25</span>
            <span>100</span>
            <span>300+</span>
          </div>
        </div>
      )}

      {colorMode === 'gravity' && (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              color: COLORS.textBody,
              fontSize: 12,
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            API Gravity ({'\u00b0'})
          </div>
          <div
            style={{
              height: 12,
              borderRadius: 4,
              background: `linear-gradient(to right, ${[10, 22, 31, 45].map((v) => gravityColorScale(v)).join(', ')})`,
              marginBottom: 4,
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10,
              color: COLORS.textMuted,
            }}
          >
            <span>10{'\u00b0'} (Heavy)</span>
            <span>22{'\u00b0'}</span>
            <span>31{'\u00b0'}</span>
            <span>45{'\u00b0'}+ (Light)</span>
          </div>
        </div>
      )}

      {/* API gravity categories */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            color: COLORS.textBody,
            fontSize: 12,
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          API Gravity Categories
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { label: 'Light', range: '> 31\u00b0', color: COLORS.blue },
            { label: 'Medium', range: '22\u201331\u00b0', color: COLORS.yellow },
            { label: 'Heavy', range: '< 22\u00b0', color: COLORS.peach },
          ].map((cat) => (
            <div
              key={cat.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: cat.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: COLORS.textBody }}>
                {cat.label} <span style={{ color: COLORS.textMuted }}>({cat.range})</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark crudes */}
      <div>
        <div
          style={{
            color: COLORS.textBody,
            fontSize: 12,
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          Benchmark Crudes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {benchmarks.map((bm) => (
            <div
              key={bm.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: bm.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: COLORS.textBody }}>
                {bm.name}{' '}
                <span style={{ color: COLORS.textMuted }}>
                  ({bm.sweetness} / {bm.weight})
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Info panel
// ---------------------------------------------------------------------------

function InfoPanel({ country }: { country: CountryProperties | null }) {
  if (!country) {
    return (
      <div
        style={{
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          padding: 16,
          color: COLORS.textMuted,
          fontSize: 13,
          textAlign: 'center',
        }}
      >
        Click a country on the map to view details.
      </div>
    );
  }

  const hasData = country.reserves_billions > 0;

  const rows: { label: string; value: string }[] = [
    { label: 'Reserves', value: `${country.reserves_billions.toFixed(1)} billion bbl` },
    ...(hasData
      ? [
          { label: 'API Gravity', value: `${formatNum(country.api_gravity, 1)}\u00b0` },
          { label: 'Sulfur', value: `${formatNum(country.sulfur_percent, 2)}%` },
          { label: 'Type', value: capitalize(country.crude_sweetness) },
          { label: 'Weight', value: capitalize(country.crude_weight) },
        ]
      : []),
  ];

  return (
    <div
      style={{
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <h3
        style={{
          color: COLORS.textPrimary,
          fontSize: 14,
          fontWeight: 600,
          margin: '0 0 12px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 12,
            height: 12,
            borderRadius: 2,
            backgroundColor: country.color,
            flexShrink: 0,
          }}
        />
        {country.NAME}
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td
                style={{
                  color: COLORS.textMuted,
                  fontSize: 12,
                  padding: '4px 8px 4px 0',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.label}
              </td>
              <td
                style={{
                  color: COLORS.textBody,
                  fontSize: 12,
                  padding: '4px 0',
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {row.value}
              </td>
            </tr>
          ))}
          {!hasData && (
            <tr>
              <td
                colSpan={2}
                style={{
                  color: COLORS.textMuted,
                  fontSize: 11,
                  paddingTop: 4,
                  fontStyle: 'italic',
                }}
              >
                No significant proved reserves
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Year slider
// ---------------------------------------------------------------------------

function YearSlider({
  years,
  currentYear,
  onChange,
}: {
  years: number[];
  currentYear: number;
  onChange: (year: number) => void;
}) {
  if (years.length === 0) return null;

  const min = years[0];
  const max = years[years.length - 1];

  const marks: Record<number, ReactNode> = {
    [min]: <span style={{ color: COLORS.textMuted, fontSize: 11 }}>{min}</span>,
    [max]: <span style={{ color: COLORS.textMuted, fontSize: 11 }}>{max}</span>,
  };

  return (
    <div
      style={{
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: '16px 20px 28px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span
          style={{
            color: COLORS.textBody,
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Year
        </span>
        <span
          style={{
            color: COLORS.blue,
            fontSize: 18,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {currentYear}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        marks={marks}
        value={currentYear}
        onChange={(val) => {
          const v = typeof val === 'number' ? val : val[0];
          onChange(v);
        }}
        styles={{
          track: { backgroundColor: COLORS.blue, height: 6, borderRadius: 3 },
          rail: { backgroundColor: COLORS.border, height: 6, borderRadius: 3 },
          handle: {
            backgroundColor: COLORS.blue,
            borderColor: COLORS.blue,
            borderRadius: '50%',
            width: 18,
            height: 18,
            marginTop: -6,
            opacity: 1,
            boxShadow: `0 0 0 2px ${COLORS.surface}`,
          },
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function OilReservesMap({ dataDir = '/data' }: OilReservesMapProps) {
  // State
  const [years, setYears] = useState<number[]>([]);
  const [currentYear, setCurrentYear] = useState<number>(0);
  const [geoData, setGeoData] = useState<ReservesCollection | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryProperties | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>('sweetness');

  // Cache
  const geoCache = useRef<Map<number, ReservesCollection>>(new Map());
  const mapRef = useRef<L.Map | null>(null);
  const tooltipRef = useRef<L.Tooltip | null>(null);
  const colorModeRef = useRef<ColorMode>(colorMode);

  useEffect(() => {
    colorModeRef.current = colorMode;
  }, [colorMode]);

  // -------------------------------------------------------------------------
  // Fetch metadata on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    fetch(`${dataDir}/metadata.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load metadata: ${res.status}`);
        return res.json() as Promise<MetadataPayload>;
      })
      .then((meta) => {
        if (cancelled) return;
        const sorted = [...meta.years].sort((a, b) => a - b);
        setYears(sorted);
        setCurrentYear(sorted[sorted.length - 1]);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load metadata');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dataDir]);

  // -------------------------------------------------------------------------
  // Fetch GeoJSON when year changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (currentYear === 0) return;
    let cancelled = false;

    const cached = geoCache.current.get(currentYear);
    if (cached) {
      Promise.resolve(cached).then((data) => {
        if (cancelled) return;
        setGeoData(data);
        setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });

    fetch(`${dataDir}/reserves_${currentYear}.geojson`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load data for ${currentYear}: ${res.status}`);
        return res.json() as Promise<ReservesCollection>;
      })
      .then((data) => {
        if (cancelled) return;
        geoCache.current.set(currentYear, data);
        setGeoData(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : `Failed to load data for ${currentYear}`);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentYear, dataDir]);

  // -------------------------------------------------------------------------
  // Year change handler
  // -------------------------------------------------------------------------
  const handleYearChange = useCallback((year: number) => {
    setCurrentYear(year);
  }, []);

  // -------------------------------------------------------------------------
  // GeoJSON style callback -- reads colorMode from ref so it stays stable
  // -------------------------------------------------------------------------
  const geoStyle = useCallback(
    (feature: Feature<Geometry, CountryProperties> | undefined) => {
      if (!feature?.properties) {
        return {
          fillColor: COLORS.border,
          fillOpacity: 0.7,
          color: COLORS.border,
          weight: 1,
          opacity: 0.8,
        };
      }
      const fillColor = getFeatureColor(feature.properties, colorMode);
      return {
        fillColor,
        fillOpacity: 0.7,
        color: COLORS.border,
        weight: 1,
        opacity: 0.8,
      };
    },
    [colorMode],
  );

  // -------------------------------------------------------------------------
  // Feature event handlers -- null-safe for countries without reserves
  // -------------------------------------------------------------------------
  const onEachFeature = useCallback((feature: ReservesFeature, layer: Layer) => {
    const props = feature.properties;
    const hasData = props.reserves_billions > 0;

    // Click → popup + info panel
    layer.on('click', () => {
      setSelectedCountry(props);

      const detailRows = hasData
        ? `
              <tr>
                <td style="padding: 2px 8px 2px 0; color: ${COLORS.textMuted};">Reserves</td>
                <td style="text-align: right;">${props.reserves_billions.toFixed(1)} B bbl</td>
              </tr>
              <tr>
                <td style="padding: 2px 8px 2px 0; color: ${COLORS.textMuted};">API Gravity</td>
                <td style="text-align: right;">${formatNum(props.api_gravity, 1)}\u00b0</td>
              </tr>
              <tr>
                <td style="padding: 2px 8px 2px 0; color: ${COLORS.textMuted};">Sulfur</td>
                <td style="text-align: right;">${formatNum(props.sulfur_percent, 2)}%</td>
              </tr>
              <tr>
                <td style="padding: 2px 8px 2px 0; color: ${COLORS.textMuted};">Type</td>
                <td style="text-align: right;">${capitalize(props.crude_sweetness)}</td>
              </tr>
              <tr>
                <td style="padding: 2px 8px 2px 0; color: ${COLORS.textMuted};">Weight</td>
                <td style="text-align: right;">${capitalize(props.crude_weight)}</td>
              </tr>`
        : `<tr>
              <td colspan="2" style="color: ${COLORS.textMuted}; font-style: italic; font-size: 11px;">
                No significant proved reserves
              </td>
            </tr>`;

      const popupContent = `
          <div style="font-family: system-ui, sans-serif; color: ${COLORS.textBody}; min-width: 180px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: ${COLORS.textPrimary};">
              ${props.NAME}
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              ${detailRows}
            </table>
          </div>
        `;

      if ('bindPopup' in layer && typeof layer.bindPopup === 'function') {
        (layer as L.Path)
          .bindPopup(popupContent, {
            className: 'oil-reserves-popup',
            maxWidth: 260,
          })
          .openPopup();
      }
    });

    // Hover → highlight + tooltip
    layer.on('mouseover', (e: LeafletMouseEvent) => {
      const currentColor = getFeatureColor(props, colorModeRef.current);
      const target = e.target as L.Path;
      target.setStyle({
        fillOpacity: 0.9,
        fillColor: brightenHex(currentColor, 1.3),
        weight: 2,
        color: COLORS.textBody,
      });
      target.bringToFront();

      const reservesText = hasData ? `${props.reserves_billions.toFixed(1)} B bbl` : 'No data';

      const tooltip = L.tooltip({
        direction: 'top',
        offset: L.point(0, -10),
        className: 'oil-reserves-tooltip',
      })
        .setLatLng(e.latlng)
        .setContent(
          `<span style="font-family: system-ui, sans-serif; font-size: 12px; color: ${COLORS.textPrimary};">` +
            `<strong>${props.NAME}</strong>` +
            `<br/><span style="color: ${COLORS.textMuted};">${reservesText}</span>` +
            `</span>`,
        );

      if (mapRef.current) {
        tooltip.addTo(mapRef.current);
        tooltipRef.current = tooltip;
      }
    });

    layer.on('mousemove', (e: LeafletMouseEvent) => {
      if (tooltipRef.current) {
        tooltipRef.current.setLatLng(e.latlng);
      }
    });

    layer.on('mouseout', (e: LeafletMouseEvent) => {
      const currentColor = getFeatureColor(props, colorModeRef.current);
      const target = e.target as L.Path;
      target.setStyle({
        fillColor: currentColor,
        fillOpacity: 0.7,
        weight: 1,
        color: COLORS.border,
      });

      if (tooltipRef.current && mapRef.current) {
        mapRef.current.removeLayer(tooltipRef.current);
        tooltipRef.current = null;
      }
    });
  }, []);

  // -------------------------------------------------------------------------
  // Error state
  // -------------------------------------------------------------------------
  if (error) {
    return (
      <div
        style={{
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.red}`,
          borderRadius: 8,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div style={{ color: COLORS.red, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          Error Loading Map
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 13 }}>{error}</div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Loading state (initial)
  // -------------------------------------------------------------------------
  if (loading && !geoData) {
    return <LoadingSkeleton />;
  }

  // Use colorMode in the GeoJSON key so it remounts when the mode changes
  const geoKey = `${currentYear}-${colorMode}`;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div style={{ width: '100%' }}>
      {/* Inject popup / tooltip / slider styles */}
      <style>{`
        .oil-reserves-popup .leaflet-popup-content-wrapper {
          background-color: ${COLORS.surface};
          border: 1px solid ${COLORS.border};
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .oil-reserves-popup .leaflet-popup-tip {
          background-color: ${COLORS.surface};
          border: 1px solid ${COLORS.border};
        }
        .oil-reserves-popup .leaflet-popup-close-button {
          color: ${COLORS.textMuted} !important;
        }
        .oil-reserves-popup .leaflet-popup-close-button:hover {
          color: ${COLORS.textPrimary} !important;
        }
        .oil-reserves-tooltip {
          background-color: ${COLORS.surface} !important;
          border: 1px solid ${COLORS.border} !important;
          border-radius: 6px !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4) !important;
          padding: 6px 10px !important;
        }
        .oil-reserves-tooltip::before {
          border-top-color: ${COLORS.surface} !important;
        }
        .oil-reserves-map-container .leaflet-control-attribution {
          display: none !important;
        }
        @media (max-width: 768px) {
          .oil-reserves-grid {
            grid-template-columns: 1fr !important;
          }
          .oil-reserves-map-container {
            min-height: 300px !important;
          }
        }
      `}</style>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '7fr 3fr',
          gap: 16,
        }}
        className="oil-reserves-grid"
      >
        {/* Left: Map */}
        <div
          style={{
            position: 'relative',
            borderRadius: 8,
            overflow: 'hidden',
            border: `1px solid ${COLORS.border}`,
            minHeight: 400,
          }}
          className="oil-reserves-map-container"
        >
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 1000,
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 12,
                color: COLORS.textMuted,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                className="animate-pulse"
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: COLORS.blue,
                }}
              />
              Loading...
            </div>
          )}

          <MapContainer
            center={[20, 0]}
            zoom={1}
            minZoom={1}
            maxZoom={7}
            scrollWheelZoom={true}
            maxBounds={[
              [-90, -180],
              [90, 180],
            ]}
            maxBoundsViscosity={1.0}
            style={{
              width: '100%',
              height: '100%',
              minHeight: 400,
              backgroundColor: COLORS.base,
            }}
            ref={mapRef}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
              noWrap={true}
            />

            {geoData && (
              <GeoJSON key={geoKey} data={geoData} style={geoStyle} onEachFeature={onEachFeature} />
            )}

            <KeyboardYearController
              years={years}
              currentYear={currentYear}
              onYearChange={handleYearChange}
            />
          </MapContainer>
        </div>

        {/* Right: Controls */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Year slider */}
          <YearSlider years={years} currentYear={currentYear} onChange={handleYearChange} />

          {/* Color mode toggle */}
          <ColorModeToggle mode={colorMode} onChange={setColorMode} />

          {/* Info panel */}
          <InfoPanel country={selectedCountry} />

          {/* Legend */}
          <LegendPanel colorMode={colorMode} />
        </div>
      </div>

      {/* Footer attribution */}
      <div
        style={{
          marginTop: 12,
          textAlign: 'center',
          color: COLORS.textMuted,
          fontSize: 11,
          opacity: 0.7,
        }}
      >
        Data: EIA, OPEC, BP Statistical Review. Map tiles by Esri. Natural Earth boundaries.
      </div>
    </div>
  );
}

export default OilReservesMap;
