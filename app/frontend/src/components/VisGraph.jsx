  import React, { useEffect, useRef } from "react";
  import { Network } from "vis-network/standalone";
  
  const VisGraph = ({ nodes, edges }) => {
    const containerRef = useRef(null);
  
    useEffect(() => {
      if (nodes.length === 0 || edges.length === 0) return;
  
      const data = {
        nodes: nodes,
        edges: edges,
      };
  
      const options = {
        nodes: {
          shape: "dot",
          size: 16,
          font: {
            size: 14,
            color: "#343434",
          },
        },
        edges: {
          color: "#848484",
        },
        physics: {
          enabled: true,
        },
      };
  
      new Network(containerRef.current, data, options);
    }, [nodes, edges]);
  
    return (
      <div
        ref={containerRef}
        style={{
          height: "600px",
          border: "1px solid lightgray",
          borderRadius: "8px",
          marginTop: "1rem",
        }}
      />
    );
  };
  
  export default VisGraph;
  