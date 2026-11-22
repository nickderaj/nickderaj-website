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
import type { AltChartKind } from './AltCorrelationChart.tsx';

const CommodityRatioChart = lazy(() =>
  import('./CommodityRatioChart.tsx').then((m) => ({ default: m.CommodityRatioChart })),
);
const AltCorrelationChart = lazy(() =>
  import('./AltCorrelationChart.tsx').then((m) => ({ default: m.AltCorrelationChart })),
);
const GoldRealYieldChart = lazy(() =>
  import('./GoldRealYieldChart.tsx').then((m) => ({ default: m.GoldRealYieldChart })),
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
      <div className="callout-label">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {title ?? `${v.charAt(0).toUpperCase()}${v.slice(1)}`}
      </div>
      <div className="callout-body">{children}</div>
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
    'table-of-contents': ({ children }: { children?: ReactNode }) => (
      <nav aria-label="Table of contents" className="toc not-prose">
        <ul>{children}</ul>
      </nav>
    ),
    callout: Callout,
    'commodity-chart': ({ kind, group }: { kind?: string; group?: string }) => (
      <Suspense fallback={Fallback}>
        <CommodityRatioChart
          kind={
            kind === 'precious' || kind === 'alternatives' || kind === 'breakouts'
              ? kind
              : 'multiples'
          }
          {...(group ? { group } : {})}
        />
      </Suspense>
    ),
    'alt-chart': ({ kind }: { kind?: string }) => (
      <Suspense fallback={Fallback}>
        <AltCorrelationChart kind={(kind ?? 'stats') as AltChartKind} />
      </Suspense>
    ),
    'gold-chart': ({ kind }: { kind?: string }) => (
      <Suspense fallback={Fallback}>
        <GoldRealYieldChart kind={kind === 'ratio' || kind === 'overlay' ? kind : 'scatter'} />
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
