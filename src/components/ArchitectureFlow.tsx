import { ChevronRight } from 'lucide-react';
import type { Project } from '@/data/projects';

/**
 * The ten-second version of a project: what flows through the system, in order.
 * Renders as a horizontal pipeline on desktop and a vertical one on mobile,
 * so it stays readable without horizontal scrolling.
 */
export default function ArchitectureFlow({
  architecture,
}: {
  architecture: Project['architecture'];
}) {
  return (
    <div>
      <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
        {architecture.nodes.map((node, i) => (
          <div key={node.label} className="flex items-center gap-2 md:flex-1">
            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                {node.label}
              </div>
              <div className="mt-0.5 font-mono text-[10px] leading-tight text-slate-500">
                {node.sub}
              </div>
            </div>
            {i < architecture.nodes.length - 1 && (
              <ChevronRight
                aria-hidden
                className="h-4 w-4 shrink-0 rotate-90 text-slate-300 md:rotate-0"
              />
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">{architecture.caption}</p>
    </div>
  );
}
