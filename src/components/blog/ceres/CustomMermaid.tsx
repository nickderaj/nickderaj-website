// @ts-nocheck -- ported from the Ceres blog; kept as-is rather than rewritten for this repo's stricter tsconfig.
import Dagre from '@dagrejs/dagre';
import { useId, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlowNode {
  id: string;
  label: string; // raw lines joined by \n
  subgraphId?: string;
  style?: NodeStyle;
}

interface FlowEdge {
  source: string;
  target: string;
  label?: string;
  dashed: boolean;
}

interface FlowSubgraph {
  id: string;
  label: string;
  nodeIds: string[];
}

interface NodeStyle {
  fill: string;
  stroke: string;
  color: string;
}

interface ParsedGraph {
  nodes: Map<string, FlowNode>;
  edges: FlowEdge[];
  subgraphs: FlowSubgraph[];
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseMermaid(chart: string): ParsedGraph {
  const nodes = new Map<string, FlowNode>();
  const edges: FlowEdge[] = [];
  const subgraphs: FlowSubgraph[] = [];
  const classDefs = new Map<string, NodeStyle>();
  const classAssignments = new Map<string, string>();

  let currentSubgraph: FlowSubgraph | null = null;

  for (const rawLine of chart.trim().split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('%%')) continue;
    if (line.startsWith('flowchart') || line.startsWith('graph')) continue;

    // subgraph ID["Label"]
    const sgMatch = line.match(/^subgraph\s+(\w+)\["([^"]+)"\]/);
    if (sgMatch) {
      currentSubgraph = { id: sgMatch[1], label: sgMatch[2], nodeIds: [] };
      subgraphs.push(currentSubgraph);
      continue;
    }
    if (line === 'end') {
      currentSubgraph = null;
      continue;
    }

    // classDef name fill:#x,stroke:#x,stroke-width:2px,color:#x;
    const cdMatch = line.match(/^classDef\s+(\w+)\s+(.+)/);
    if (cdMatch) {
      const style: NodeStyle = { fill: '#313244', stroke: '#585b70', color: '#cdd6f4' };
      for (const part of cdMatch[2].split(',')) {
        const sep = part.indexOf(':');
        if (sep < 0) continue;
        const k = part.slice(0, sep).trim();
        const v = part
          .slice(sep + 1)
          .trim()
          .replace(/;$/, '');
        if (k === 'fill') style.fill = v;
        else if (k === 'stroke') style.stroke = v;
        else if (k === 'color') style.color = v;
      }
      classDefs.set(cdMatch[1], style);
      continue;
    }

    // class A,B className;
    const clMatch = line.match(/^class\s+([\w,\s]+)\s+(\w+);?$/);
    if (clMatch) {
      for (const id of clMatch[1].split(',').map((s) => s.trim())) {
        classAssignments.set(id, clMatch[2]);
      }
      continue;
    }

    // Solid edge with label:  A -->|label| B
    const solidLbl = line.match(/^(\w+)\s*-->\|([^|]*)\|\s*(\w+)/);
    if (solidLbl) {
      edges.push({ source: solidLbl[1], target: solidLbl[3], label: solidLbl[2], dashed: false });
      continue;
    }
    // Dashed edge with label:  A -.->|label| B
    const dashLbl = line.match(/^(\w+)\s*-\.->\|([^|]*)\|\s*(\w+)/);
    if (dashLbl) {
      edges.push({ source: dashLbl[1], target: dashLbl[3], label: dashLbl[2], dashed: true });
      continue;
    }
    // Solid edge no label:  A --> B
    const solidOnly = line.match(/^(\w+)\s*-->\s*(\w+)$/);
    if (solidOnly) {
      edges.push({ source: solidOnly[1], target: solidOnly[2], dashed: false });
      continue;
    }

    // Node:  A["label with \n newlines"]
    const nodeMatch = line.match(/^(\w+)\["([^"]+)"\]/);
    if (nodeMatch) {
      const id = nodeMatch[1];
      const label = nodeMatch[2].replace(/\\n/g, '\n');
      nodes.set(id, { id, label, subgraphId: currentSubgraph?.id });
      currentSubgraph?.nodeIds.push(id);
    }
  }

  // Attach styles
  for (const [id, cls] of classAssignments) {
    const node = nodes.get(id);
    const style = classDefs.get(cls);
    if (node && style) node.style = style;
  }

  return { nodes, edges, subgraphs };
}

// ─── Node sizing ──────────────────────────────────────────────────────────────

const CHAR_W = 7.5;
const LINE_H = 19;
const PAD_X = 20;
const PAD_Y = 14;
const MIN_W = 170;

function nodeSize(label: string) {
  const lines = label.split('\n');
  const maxLen = Math.max(...lines.map((l) => l.length));
  return {
    width: Math.max(MIN_W, Math.ceil(maxLen * CHAR_W) + PAD_X * 2),
    height: lines.length * LINE_H + PAD_Y * 2,
  };
}

// ─── Layout ───────────────────────────────────────────────────────────────────

interface LayoutNode extends FlowNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutEdge extends FlowEdge {
  points: Array<{ x: number; y: number }>;
  labelX: number;
  labelY: number;
  color: string;
}

interface SubgraphBox extends FlowSubgraph {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Layout {
  nodes: Map<string, LayoutNode>;
  edges: LayoutEdge[];
  subgraphs: SubgraphBox[];
  width: number;
  height: number;
}

function edgeColor(label?: string): string {
  if (!label) return '#89b4fa';
  const t = label.toLowerCase();
  if (t.includes('high')) return '#a6e3a1';
  if (t.includes('medium')) return '#fab387';
  if (t.includes('low')) return '#f38ba8';
  return '#89b4fa';
}

function computeLayout(parsed: ParsedGraph): Layout {
  const g = new Dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 30, marginx: 50, marginy: 50 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const [id, node] of parsed.nodes) {
    g.setNode(id, nodeSize(node.label));
  }
  for (const edge of parsed.edges) {
    g.setEdge(edge.source, edge.target);
  }

  Dagre.layout(g);

  // Layout nodes
  const layoutNodes = new Map<string, LayoutNode>();
  for (const [id, node] of parsed.nodes) {
    const dn = g.node(id);
    layoutNodes.set(id, { ...node, x: dn.x, y: dn.y, width: dn.width, height: dn.height });
  }

  // Layout edges — attach points + color
  const layoutEdges: LayoutEdge[] = parsed.edges.map((edge) => {
    const src = layoutNodes.get(edge.source)!;
    const tgt = layoutNodes.get(edge.target)!;
    const de = g.edge({ v: edge.source, w: edge.target });
    const midPts: Array<{ x: number; y: number }> = de?.points ?? [];

    // Always explicitly anchor to node boundaries
    const allPts = [
      { x: src.x, y: src.y + src.height / 2 },
      ...midPts,
      { x: tgt.x, y: tgt.y - tgt.height / 2 },
    ];

    const mid = allPts[Math.floor(allPts.length / 2)];
    return {
      ...edge,
      points: allPts,
      labelX: mid.x,
      labelY: mid.y,
      color: edgeColor(edge.label),
    };
  });

  // Subgraph bounding boxes
  const SG_PAD = 20;
  const SG_HEADER = 30;
  const subgraphs: SubgraphBox[] = parsed.subgraphs.map((sg) => {
    const ns = sg.nodeIds.map((id) => layoutNodes.get(id)).filter(Boolean) as LayoutNode[];
    if (!ns.length) return { ...sg, x: 0, y: 0, width: 0, height: 0 };
    const l = Math.min(...ns.map((n) => n.x - n.width / 2));
    const r = Math.max(...ns.map((n) => n.x + n.width / 2));
    const t = Math.min(...ns.map((n) => n.y - n.height / 2));
    const b = Math.max(...ns.map((n) => n.y + n.height / 2));
    return {
      ...sg,
      x: l - SG_PAD,
      y: t - SG_PAD - SG_HEADER,
      width: r - l + SG_PAD * 2,
      height: b - t + SG_PAD * 2 + SG_HEADER,
    };
  });

  const graph = g.graph();
  return {
    nodes: layoutNodes,
    edges: layoutEdges,
    subgraphs,
    width: (graph.width ?? 800) + 100,
    height: (graph.height ?? 600) + 100,
  };
}

// ─── SVG path ─────────────────────────────────────────────────────────────────

function toSmoothPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) {
    return `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)} L ${pts[1].x.toFixed(1)},${pts[1].y.toFixed(1)}`;
  }
  // Smooth polyline: move to first, then quadratic bezier through midpoints
  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const cur = pts[i];
    const nxt = pts[i + 1];
    const mx = ((cur.x + nxt.x) / 2).toFixed(1);
    const my = ((cur.y + nxt.y) / 2).toFixed(1);
    d += ` Q ${cur.x.toFixed(1)},${cur.y.toFixed(1)} ${mx},${my}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  return d;
}

// ─── Component ────────────────────────────────────────────────────────────────

const EDGE_COLORS = ['#a6e3a1', '#fab387', '#f38ba8', '#89b4fa'] as const;

export function CustomMermaid({ chart }: { chart: string }) {
  const uid = useId().replace(/:/g, '');
  const layout = useMemo(() => computeLayout(parseMermaid(chart)), [chart]);

  return (
    <div
      className="my-6 rounded-lg border p-4 sm:p-6"
      style={{
        backgroundColor: '#1e1e2e',
        borderColor: '#313244',
        overflowX: 'auto',
        overflowY: 'visible',
      }}
    >
      <div style={{ position: 'relative', width: layout.width, height: layout.height }}>
        {/* Subgraph borders */}
        {layout.subgraphs.map((sg) =>
          sg.width === 0 ? null : (
            <div
              key={sg.id}
              style={{
                position: 'absolute',
                left: sg.x,
                top: sg.y,
                width: sg.width,
                height: sg.height,
                border: '1px solid #45475a',
                borderRadius: 8,
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 7,
                  left: 12,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#6c7086',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  userSelect: 'none',
                }}
              >
                {sg.label}
              </span>
            </div>
          ),
        )}

        {/* SVG layer for edges */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          <defs>
            {EDGE_COLORS.map((c) => (
              <marker
                key={c}
                id={`${uid}-arr-${c.slice(1)}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill={c} />
              </marker>
            ))}
          </defs>

          {layout.edges.map((edge, i) => (
            <path
              key={i}
              d={toSmoothPath(edge.points)}
              stroke={edge.color}
              strokeWidth={1.6}
              fill="none"
              strokeDasharray={edge.dashed ? '6,4' : undefined}
              markerEnd={`url(#${uid}-arr-${edge.color.slice(1)})`}
            />
          ))}
        </svg>

        {/* Edge labels */}
        {layout.edges
          .filter((e) => e.label)
          .map((edge, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: edge.labelX,
                top: edge.labelY,
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#181825',
                color: edge.color,
                fontSize: 11,
                fontWeight: 500,
                padding: '2px 7px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                border: `1px solid ${edge.color}55`,
                lineHeight: 1.4,
              }}
            >
              {edge.label}
            </div>
          ))}

        {/* Nodes */}
        {Array.from(layout.nodes.values()).map((node) => (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: node.x - node.width / 2,
              top: node.y - node.height / 2,
              width: node.width,
              height: node.height,
              backgroundColor: node.style?.fill ?? '#313244',
              border: `2px solid ${node.style?.stroke ?? '#585b70'}`,
              borderRadius: 6,
              color: node.style?.color ?? '#cdd6f4',
              fontSize: 12,
              lineHeight: String(LINE_H / 12),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: `${PAD_Y}px ${PAD_X}px`,
              boxSizing: 'border-box',
              userSelect: 'none',
            }}
          >
            {node.label.split('\n').map((line, j) => (
              <span key={j} style={{ display: 'block', whiteSpace: 'nowrap' }}>
                {line}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
