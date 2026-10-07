import { lazy, Suspense } from "react";
import Icon from "./Icon";
const VisGraph = lazy(() => import("./VisGraph"));
export default function GraphPanel({ nodes, edges }) {
  return (
    <section className="panel graph-panel">
      <div className="panel-heading">
        <span>
          <Icon name="graph" size={17} /> Query relationships
        </span>
        <span className="subtle-tag">{nodes.length} nodes</span>
      </div>
      <Suspense fallback={<div className="graph-canvas page-loading">Loading graph…</div>}>
        <VisGraph nodes={nodes} edges={edges} />
      </Suspense>
      <div className="graph-legend">
        <span>
          <i className="legend-query" /> Query
        </span>
        <span>
          <i className="legend-table" /> Table
        </span>
        <span>
          <i className="legend-column" /> Column
        </span>
        <small>Drag nodes to explore</small>
      </div>
    </section>
  );
}
