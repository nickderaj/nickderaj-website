// @ts-nocheck -- ported from the Ceres blog; kept as-is rather than rewritten for this repo's stricter tsconfig.
import { scaleLinear } from 'd3-scale';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Layer, LeafletMouseEvent } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleMarker, GeoJSON, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MetalSymbol = 'Au' | 'Ag' | 'Pd' | 'Pt' | 'Ru' | 'Ir';

interface CountryProperties {
  NAME: string;
  name: string;
  reserves: number;
  reserves_pct: number;
}

type MetalFeature = Feature<Geometry, CountryProperties>;
type MetalCollection = FeatureCollection<Geometry, CountryProperties>;

interface MineLocation {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

interface MetalInfo {
  name: string;
  unit: string;
  total_reserves: number;
}

interface MetadataPayload {
  metals: MetalSymbol[];
  metals_info: Record<MetalSymbol, MetalInfo>;
}

interface PreciousMetalsMapProps {
  dataDir?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const METALS: { symbol: MetalSymbol; name: string }[] = [
  { symbol: 'Au', name: 'Gold' },
  { symbol: 'Ag', name: 'Silver' },
  { symbol: 'Pd', name: 'Palladium' },
  { symbol: 'Pt', name: 'Platinum' },
  { symbol: 'Ru', name: 'Ruthenium' },
  { symbol: 'Ir', name: 'Iridium' },
];

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

// Per-metal accent colors for the map
const METAL_COLORS: Record<MetalSymbol, string> = {
  Au: '#ffd700',
  Ag: '#c0c0c0',
  Pd: '#b8c4d0',
  Pt: '#e5e4e2',
  Ru: '#7a8b99',
  Ir: '#a3b1bf',
};

// Per-metal mine marker colors (more saturated)
const MINE_MARKER_COLORS: Record<MetalSymbol, string> = {
  Au: '#ffd700',
  Ag: '#e8e8e8',
  Pd: '#89b4fa',
  Pt: '#cba6f7',
  Ru: '#a6e3a1',
  Ir: '#fab387',
};

// ---------------------------------------------------------------------------
// Color scale helper — builds a scale per metal
// ---------------------------------------------------------------------------

function buildColorScale(metal: MetalSymbol) {
  // Each metal gets a scale from border (no reserves) to its accent color
  const accent = METAL_COLORS[metal];
  return scaleLinear<string>().domain([0, 100]).range([COLORS.border, accent]).clamp(true);
}

function brightenHex(hex: string, factor: number): string {
  const r = Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * factor));
  const g = Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * factor));
  const b = Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * factor));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function formatReserves(tonnes: number): string {
  if (tonnes >= 1000) return `${(tonnes / 1000).toFixed(1)}k t`;
  return `${tonnes.toLocaleString()} t`;
}

// ---------------------------------------------------------------------------
// Sub-component: fit bounds on mount
// ---------------------------------------------------------------------------

function FitWorld() {
  const map = useMap();
  useEffect(() => {
    map.setView([20, 0], 1);
  }, [map]);
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
        style={{ backgroundColor: COLORS.border, borderRadius: 8, height: 300, width: '100%' }}
      />
      <div style={{ display: 'flex', gap: 12 }}>
        <div
          className="animate-pulse"
          style={{ backgroundColor: COLORS.border, borderRadius: 4, height: 20, width: '60%' }}
        />
        <div
          className="animate-pulse"
          style={{ backgroundColor: COLORS.border, borderRadius: 4, height: 20, width: '30%' }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metal selector
// ---------------------------------------------------------------------------

function MetalSelector({
  selected,
  onChange,
}: {
  selected: MetalSymbol;
  onChange: (s: MetalSymbol) => void;
}) {
  const current = METALS.find((m) => m.symbol === selected);

  return (
    <div
      style={{
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: 12,
      }}
    >
      <div style={{ color: COLORS.textBody, fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
        Metal
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          borderRadius: 6,
          overflow: 'hidden',
          border: `1px solid ${COLORS.border}`,
        }}
      >
        {METALS.map((m) => (
          <button
            key={m.symbol}
            onClick={() => onChange(m.symbol)}
            style={{
              padding: '8px 0',
              fontSize: 13,
              fontWeight: selected === m.symbol ? 700 : 400,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: selected === m.symbol ? METAL_COLORS[m.symbol] : COLORS.surface,
              color: selected === m.symbol ? COLORS.base : COLORS.textMuted,
              transition: 'background-color 0.15s, color 0.15s',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {m.symbol}
          </button>
        ))}
      </div>
      {current && (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: COLORS.textMuted,
            textAlign: 'center',
          }}
        >
          {current.symbol} = {current.name}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legend panel
// ---------------------------------------------------------------------------

function LegendPanel({ metal, metalInfo }: { metal: MetalSymbol; metalInfo: MetalInfo | null }) {
  const scale = buildColorScale(metal);
  const stops = [0, 25, 50, 75, 100];

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

      {/* Color scale */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: COLORS.textBody, fontSize: 12, marginBottom: 6, fontWeight: 500 }}>
          Reserves (% of largest)
        </div>
        <div
          style={{
            height: 12,
            borderRadius: 4,
            background: `linear-gradient(to right, ${stops.map((s) => scale(s)).join(', ')})`,
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
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Mine marker */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: COLORS.textBody, fontSize: 12, marginBottom: 6, fontWeight: 500 }}>
          Mine Markers
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: MINE_MARKER_COLORS[metal],
              border: `1px solid ${COLORS.textBody}`,
              flexShrink: 0,
            }}
          />
          <span style={{ color: COLORS.textBody }}>Active mine</span>
        </div>
      </div>

      {/* Total reserves */}
      {metalInfo && (
        <div
          style={{
            borderTop: `1px solid ${COLORS.border}`,
            paddingTop: 10,
            fontSize: 11,
            color: COLORS.textMuted,
          }}
        >
          Global reserves: {metalInfo.total_reserves.toLocaleString()} {metalInfo.unit}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Info panel
// ---------------------------------------------------------------------------

function InfoPanel({
  country,
  metal,
  metalInfo,
}: {
  country: CountryProperties | null;
  metal: MetalSymbol;
  metalInfo: MetalInfo | null;
}) {
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

  const hasData = country.reserves > 0;
  const metalName = metalInfo?.name ?? metal;
  const unit = metalInfo?.unit ?? 'tonnes';

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
            backgroundColor: hasData ? METAL_COLORS[metal] : COLORS.border,
            flexShrink: 0,
          }}
        />
        {country.NAME}
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td
              style={{
                color: COLORS.textMuted,
                fontSize: 12,
                padding: '4px 8px 4px 0',
                whiteSpace: 'nowrap',
              }}
            >
              {metalName} Reserves
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
              {hasData ? `${country.reserves.toLocaleString()} ${unit}` : 'None'}
            </td>
          </tr>
          {hasData && (
            <tr>
              <td
                style={{
                  color: COLORS.textMuted,
                  fontSize: 12,
                  padding: '4px 8px 4px 0',
                  whiteSpace: 'nowrap',
                }}
              >
                Share of Top
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
                {country.reserves_pct.toFixed(1)}%
              </td>
            </tr>
          )}
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
                No significant known reserves
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mine markers layer
// ---------------------------------------------------------------------------

function MineMarkers({ mines, metal }: { mines: MineLocation[]; metal: MetalSymbol }) {
  const color = MINE_MARKER_COLORS[metal];
  return (
    <>
      {mines.map((mine) => (
        <CircleMarker
          key={`${mine.name}-${mine.lat}-${mine.lng}`}
          center={[mine.lat, mine.lng]}
          radius={6}
          pathOptions={{
            fillColor: color,
            fillOpacity: 0.85,
            color: COLORS.textBody,
            weight: 1,
            opacity: 0.9,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]} className="metals-map-tooltip">
            <span
              style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: 12,
                color: COLORS.textPrimary,
              }}
            >
              <strong>{mine.name}</strong>
              <br />
              <span style={{ color: COLORS.textMuted }}>{mine.country}</span>
            </span>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PreciousMetalsMap({ dataDir = '/data/metals' }: PreciousMetalsMapProps) {
  const [selectedMetal, setSelectedMetal] = useState<MetalSymbol>('Au');
  const [geoData, setGeoData] = useState<MetalCollection | null>(null);
  const [geoDataMetal, setGeoDataMetal] = useState<MetalSymbol | null>(null);
  const [mines, setMines] = useState<Record<MetalSymbol, MineLocation[]> | null>(null);
  const [metaInfo, setMetaInfo] = useState<Record<MetalSymbol, MetalInfo> | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryProperties | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const geoCache = useRef<Map<MetalSymbol, MetalCollection>>(new Map());
  const mapRef = useRef<L.Map | null>(null);
  const tooltipRef = useRef<L.Tooltip | null>(null);
  const selectedMetalRef = useRef<MetalSymbol>(selectedMetal);

  useEffect(() => {
    selectedMetalRef.current = selectedMetal;
  }, [selectedMetal]);

  // Switch metal — apply cached data synchronously so selectedMetal and
  // geoData are always updated in the same React batch.
  const handleMetalChange = useCallback((metal: MetalSymbol) => {
    setSelectedMetal(metal);
    const cached = geoCache.current.get(metal);
    if (cached) {
      setGeoData(cached);
      setGeoDataMetal(metal);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Fetch metadata + mines on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch(`${dataDir}/metadata.json`).then((r) => {
        if (!r.ok) throw new Error(`Failed to load metadata: ${r.status}`);
        return r.json() as Promise<MetadataPayload>;
      }),
      fetch(`${dataDir}/mines.json`).then((r) => {
        if (!r.ok) throw new Error(`Failed to load mines: ${r.status}`);
        return r.json() as Promise<Record<MetalSymbol, MineLocation[]>>;
      }),
    ])
      .then(([meta, minesData]) => {
        if (cancelled) return;
        setMetaInfo(meta.metals_info);
        setMines(minesData);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dataDir]);

  // -------------------------------------------------------------------------
  // Fetch GeoJSON when metal changes (only if not already cached)
  // -------------------------------------------------------------------------
  useEffect(() => {
    // If the cache already has data for this metal, handleMetalChange
    // applied it synchronously — nothing to do here.
    if (geoCache.current.has(selectedMetal)) return;

    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });

    fetch(`${dataDir}/${selectedMetal}.geojson`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${selectedMetal} data: ${res.status}`);
        return res.json() as Promise<MetalCollection>;
      })
      .then((data) => {
        if (cancelled) return;
        geoCache.current.set(selectedMetal, data);
        setGeoData(data);
        setGeoDataMetal(selectedMetal);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : `Failed to load ${selectedMetal} data`);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedMetal, dataDir]);

  // -------------------------------------------------------------------------
  // GeoJSON style
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
      const scale = buildColorScale(selectedMetal);
      const fillColor =
        feature.properties.reserves === 0 ? COLORS.border : scale(feature.properties.reserves_pct);
      return {
        fillColor,
        fillOpacity: 0.7,
        color: COLORS.border,
        weight: 1,
        opacity: 0.8,
      };
    },
    [selectedMetal],
  );

  // -------------------------------------------------------------------------
  // Feature event handlers
  // -------------------------------------------------------------------------
  const onEachFeature = useCallback((feature: MetalFeature, layer: Layer) => {
    const props = feature.properties;
    const hasData = props.reserves > 0;

    layer.on('click', () => {
      setSelectedCountry(props);

      const metal = selectedMetalRef.current;
      const metalName = METALS.find((m) => m.symbol === metal)?.name ?? metal;

      const detailRows = hasData
        ? `<tr>
              <td style="padding: 2px 8px 2px 0; color: ${COLORS.textMuted};">${metalName} Reserves</td>
              <td style="text-align: right;">${props.reserves.toLocaleString()} t</td>
            </tr>
            <tr>
              <td style="padding: 2px 8px 2px 0; color: ${COLORS.textMuted};">Share of Top</td>
              <td style="text-align: right;">${props.reserves_pct.toFixed(1)}%</td>
            </tr>`
        : `<tr>
              <td colspan="2" style="color: ${COLORS.textMuted}; font-style: italic; font-size: 11px;">
                No significant known reserves
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
          .bindPopup(popupContent, { className: 'metals-map-popup', maxWidth: 260 })
          .openPopup();
      }
    });

    layer.on('mouseover', (e: LeafletMouseEvent) => {
      const metal = selectedMetalRef.current;
      const scale = buildColorScale(metal);
      const currentColor = props.reserves === 0 ? COLORS.border : scale(props.reserves_pct);
      const target = e.target as L.Path;
      target.setStyle({
        fillOpacity: 0.9,
        fillColor: brightenHex(currentColor, 1.3),
        weight: 2,
        color: COLORS.textBody,
      });
      target.bringToFront();

      const reservesText = hasData ? formatReserves(props.reserves) : 'No data';

      const tooltip = L.tooltip({
        direction: 'top',
        offset: L.point(0, -10),
        className: 'metals-map-tooltip',
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
      const metal = selectedMetalRef.current;
      const scale = buildColorScale(metal);
      const currentColor = props.reserves === 0 ? COLORS.border : scale(props.reserves_pct);
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

  if (loading && !geoData) {
    return <LoadingSkeleton />;
  }

  const geoKey = selectedMetal;
  const currentMines = mines?.[selectedMetal] ?? [];
  const currentMetalInfo = metaInfo?.[selectedMetal] ?? null;

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .metals-map-popup .leaflet-popup-content-wrapper {
          background-color: ${COLORS.surface};
          border: 1px solid ${COLORS.border};
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .metals-map-popup .leaflet-popup-tip {
          background-color: ${COLORS.surface};
          border: 1px solid ${COLORS.border};
        }
        .metals-map-popup .leaflet-popup-close-button {
          color: ${COLORS.textMuted} !important;
        }
        .metals-map-popup .leaflet-popup-close-button:hover {
          color: ${COLORS.textPrimary} !important;
        }
        .metals-map-tooltip {
          background-color: ${COLORS.surface} !important;
          border: 1px solid ${COLORS.border} !important;
          border-radius: 6px !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4) !important;
          padding: 6px 10px !important;
        }
        .metals-map-tooltip::before {
          border-top-color: ${COLORS.surface} !important;
        }
        .metals-map-container .leaflet-control-attribution {
          display: none !important;
        }
        @media (max-width: 768px) {
          .metals-map-grid {
            grid-template-columns: 1fr !important;
          }
          .metals-map-container {
            min-height: 300px !important;
          }
        }
      `}</style>

      <div
        style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 16 }}
        className="metals-map-grid"
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
          className="metals-map-container"
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
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
              noWrap={true}
            />

            {geoData && geoDataMetal === selectedMetal && (
              <GeoJSON key={geoKey} data={geoData} style={geoStyle} onEachFeature={onEachFeature} />
            )}

            <MineMarkers mines={currentMines} metal={selectedMetal} />

            <FitWorld />
          </MapContainer>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MetalSelector selected={selectedMetal} onChange={handleMetalChange} />
          <InfoPanel country={selectedCountry} metal={selectedMetal} metalInfo={currentMetalInfo} />
          <LegendPanel metal={selectedMetal} metalInfo={currentMetalInfo} />
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          textAlign: 'center',
          color: COLORS.textMuted,
          fontSize: 11,
          opacity: 0.7,
        }}
      >
        Data: USGS Mineral Commodity Summaries 2025, USGS Minerals Yearbook, Johnson Matthey PGM
        Market Report 2025, BGS World Mineral Production. Mine locations: S&P Global Market
        Intelligence. Boundaries: Natural Earth. Tiles: CARTO / OpenStreetMap.
      </div>
    </div>
  );
}

export default PreciousMetalsMap;
