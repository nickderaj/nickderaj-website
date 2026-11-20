import type { Element } from 'hast';
import { AlertTriangle, Check, Copy, Info, Lightbulb, Star } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';
import { lazy, Suspense, useState, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { CircleDiagram } from './ceres/CircleDiagram.tsx';
import { PostChart } from './PostChart.tsx';
import { PythonTable } from './PythonTable.tsx';

const CustomMermaid = lazy(() =>
  import('./ceres/CustomMermaid.tsx').then((m) => ({ default: m.CustomMermaid })),
);
const CommoditySelector = lazy(() =>
  import('./ceres/CommodityAnalysis.tsx').then((m) => ({ default: m.CommoditySelector })),
);
const CommodityCharts = lazy(() =>
  import('./ceres/CommodityAnalysis.tsx').then((m) => ({ default: m.CommodityCharts })),
);
const PatternSelector = lazy(() =>
  import('./ceres/PatternAnalysis.tsx').then((m) => ({ default: m.PatternSelector })),
);
const PatternDisplay = lazy(() =>
  import('./ceres/PatternAnalysis.tsx').then((m) => ({ default: m.PatternDisplay })),
);
const PatternResultsTable = lazy(() =>
  import('./ceres/PatternAnalysis.tsx').then((m) => ({ default: m.PatternResultsTable })),
);
const OilReservesMap = lazy(() =>
  import('./ceres/OilReservesMap.tsx').then((m) => ({ default: m.OilReservesMap })),
);
const PreciousMetalsMap = lazy(() =>
  import('./ceres/PreciousMetalsMap.tsx').then((m) => ({ default: m.PreciousMetalsMap })),
);

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="not-prose border-border my-6 overflow-hidden rounded-lg border bg-[var(--code-bg)]">
      <div className="border-border text-muted-foreground flex items-center justify-between border-b px-4 py-2 font-mono text-xs">
        <span>{lang || 'text'}</span>
        <button
          type="button"
          aria-label="Copy code"
          className="hover:text-foreground flex items-center gap-1 transition-colors"
          onClick={() => {
            void navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 1500);
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <Highlight code={code} language={lang || 'text'} theme={themes.vsDark}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre
            className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed"
            style={{ background: 'transparent' }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, k) => (
                  <span key={k} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

const calloutIcons = { note: Info, tip: Lightbulb, warning: AlertTriangle, important: Star };
type CalloutVariant = keyof typeof calloutIcons;

function Callout({
  variant,
  title,
  children,
}: {
  variant?: string;
  title?: string;
  children?: ReactNode;
}) {
  const v: CalloutVariant =
    variant && variant in calloutIcons ? (variant as CalloutVariant) : 'note';
  const Icon = calloutIcons[v];
  return (
    <div className={`callout callout-${v} not-prose`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title ? <div className="callout-title">{title}</div> : null}
        {children}
      </div>
    </div>
  );
}

const Fallback = <div className="text-muted-foreground my-6 font-mono text-xs">Loading…</div>;

export function Markdown({ content, postSlug = '' }: { content: string; postSlug?: string }) {
  // Custom elements (from rehype-raw) aren't in react-markdown's typed component map.
  const components = {
    pre: ({ children }: { children?: ReactNode }) => <>{children}</>,
    code({ className, children }: { className?: string; children?: ReactNode }) {
      const lang = /language-([\w-]+)/.exec(className ?? '')?.[1];
      const text = (Array.isArray(children) ? children.join('') : (children as string)).replace(
        /\n$/,
        '',
      );
      if (!lang && !text.includes('\n')) {
        return <code>{children}</code>;
      }
      if (lang === 'mermaid') {
        return (
          <Suspense fallback={Fallback}>
            <CustomMermaid chart={text} />
          </Suspense>
        );
      }
      if (lang && lang in calloutIcons) {
        return (
          <Callout variant={lang}>
            <Markdown content={text} postSlug={postSlug} />
          </Callout>
        );
      }
      return <CodeBlock code={text} lang={lang ?? ''} />;
    },
    // Block-level custom elements (tables, figures, maps) can't live inside a <p>.
    p: ({ node, children }: { node?: Element; children?: ReactNode }) =>
      node?.children.some(
        (c) => c.type === 'element' && (c.tagName.includes('-') || c.tagName === 'callout'),
      ) ? (
        <div>{children}</div>
      ) : (
        <p>{children}</p>
      ),
    table: ({ children }: { children?: ReactNode }) => (
      <div className="border-border my-6 overflow-x-auto rounded-lg border">
        <table>{children}</table>
      </div>
    ),
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <img
        src={src}
        alt={alt ?? ''}
        className="border-border my-8 rounded-lg border"
        loading="lazy"
      />
    ),
    'python-table': ({ src }: { src?: string }) =>
      src ? <PythonTable src={src} postSlug={postSlug} /> : null,
    'python-figure': ({ src, caption }: { src?: string; caption?: string }) =>
      src ? <PostChart src={src} postSlug={postSlug} {...(caption ? { caption } : {})} /> : null,
    'table-of-contents': ({ children }: { children?: ReactNode }) => (
      <nav aria-label="Table of contents" className="toc not-prose">
        <ul>{children}</ul>
      </nav>
    ),
    callout: Callout,
    'circle-diagram': () => <CircleDiagram />,
    'commodity-selector': () => (
      <Suspense fallback={Fallback}>
        <CommoditySelector />
      </Suspense>
    ),
    'commodity-charts': () => (
      <Suspense fallback={Fallback}>
        <CommodityCharts />
      </Suspense>
    ),
    'pattern-selector': () => (
      <Suspense fallback={Fallback}>
        <PatternSelector />
      </Suspense>
    ),
    'pattern-display': () => (
      <Suspense fallback={Fallback}>
        <PatternDisplay />
      </Suspense>
    ),
    'pattern-results-table': () => (
      <Suspense fallback={Fallback}>
        <PatternResultsTable />
      </Suspense>
    ),
    'oil-reserves-map': ({ datadir }: { datadir?: string }) => (
      <Suspense fallback={Fallback}>
        <OilReservesMap {...(datadir ? { dataDir: datadir } : {})} />
      </Suspense>
    ),
    'precious-metals-map': ({ datadir }: { datadir?: string }) => (
      <Suspense fallback={Fallback}>
        <PreciousMetalsMap {...(datadir ? { dataDir: datadir } : {})} />
      </Suspense>
    ),
  } as unknown as Components;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeSlug, rehypeKatex]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
