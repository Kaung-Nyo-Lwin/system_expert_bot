import { useEffect, useRef } from "react";
import { Network } from "vis-network/standalone";

export default function VisGraph({ nodes = [], edges = [] }) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current || !nodes.length) return;
    const network = new Network(
      containerRef.current,
      { nodes, edges },
      {
        layout: { randomSeed: 17, improvedLayout: true },
        nodes: {
          shape: "dot",
          size: 13,
          borderWidth: 2,
          font: { face: "system-ui", size: 12, color: "#44505c" },
        },
        groups: {
          query: { shape: "box", color: { background: "#d7f58c", border: "#a3c958" }, margin: 13 },
          table: { color: { background: "#dce8fb", border: "#95b6e9" }, size: 20 },
          column: { color: { background: "#fff", border: "#ccd5dc" }, size: 9 },
        },
        edges: {
          color: "#c5d0d5",
          width: 1.3,
          smooth: { type: "continuous" },
          font: { size: 9, color: "#79858e", strokeWidth: 3, strokeColor: "#fafcfb" },
          arrows: { to: { enabled: true, scaleFactor: 0.4 } },
        },
        physics: {
          stabilization: { iterations: 120 },
          barnesHut: { gravitationalConstant: -2500, springLength: 105 },
        },
        interaction: { hover: true, zoomView: false },
      },
    );
    network.once("stabilizationIterationsDone", () => {
      network.setOptions({ physics: false });
      network.fit();
    });
    return () => network.destroy();
  }, [nodes, edges]);
  return (
    <>
      <div
        ref={containerRef}
        className="graph-canvas"
        role="img"
        aria-label={`Query relationship graph with ${nodes.length} nodes and ${edges.length} connections. A text alternative follows.`}
      />
      <details className="graph-text">
        <summary>View relationships as text</summary>
        <ul>
          {edges.map((edge, index) => (
            <li key={index}>
              {nodes.find((node) => node.id === edge.from)?.label} →{" "}
              {nodes.find((node) => node.id === edge.to)?.label} ({edge.label})
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
