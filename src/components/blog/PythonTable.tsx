import { useEffect, useState } from 'react';

type TableData = { columns: string[]; data: string[][] };

const tableLoaders = import.meta.glob<TableData>('/src/content/posts/*/tables/*.json', {
  import: 'default',
});

export function PythonTable({ src, postSlug }: { src: string; postSlug: string }) {
  const path = `/src/content/posts/${postSlug}/tables/${src}.json`;
  const [loaded, setLoaded] = useState<{ path: string; table: TableData | null } | null>(null);
  useEffect(() => {
    const load = tableLoaders[path];
    let cancelled = false;
    void (load ? load() : Promise.resolve(null)).then((table) => {
      if (!cancelled) {
        setLoaded({ path, table });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [path]);
  const table = loaded?.path === path ? loaded.table : undefined;
  if (table === undefined) {
    return <div className="border-border my-6 h-32 rounded-lg border" aria-busy="true" />;
  }
  if (table === null) {
    return <p className="text-destructive text-sm">Table not found: {src}</p>;
  }
  return (
    <div className="not-prose border-border my-6 overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {table.columns.map((col) => (
              <th
                key={col}
                className="bg-secondary text-muted-foreground px-4 py-2.5 text-left font-mono text-xs tracking-wider whitespace-nowrap uppercase"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.data.map((row, i) => (
            <tr key={i} className="border-border border-t">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 tabular-nums">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
