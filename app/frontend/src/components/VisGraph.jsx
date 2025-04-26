  // import React, { useEffect, useRef } from "react";
  // import { DataSet, Network } from "vis-network";

  // export default function VisGraph() {
  //   const containerRef = useRef(null);

  //   useEffect(() => {
  //     const nodes = new DataSet([
  //       { id: "query", label: "Query", shape: "box", color: "#FFAAAA" },
  //       { id: "table_location", label: "location", color: "#AAAAFF", shape: "dot" },
  //       { id: "table_attribute", label: "attribute", color: "#AAAAFF", shape: "dot" },
  //       { id: "table_museum_object", label: "museum_object", color: "#AAAAFF", shape: "dot" },
  //       { id: "column_location.country", label: "country\n(location)", color: "#AAFFAA", shape: "dot" },
  //       { id: "column_attribute.art_style", label: "art_style\n(attribute)", color: "#AAFFAA", shape: "dot" },
  //       { id: "column_attribute.material", label: "material\n(attribute)", color: "#AAFFAA", shape: "dot" },
  //       { id: "column_location.id", label: "id\n(location)", color: "#AAFFAA", shape: "dot" },
  //       { id: "column_attribute.object_id", label: "object_id\n(attribute)", color: "#AAFFAA", shape: "dot" },
  //       { id: "column_museum_object.id", label: "id\n(museum_object)", color: "#AAFFAA", shape: "dot" },
  //       { id: "column_museum_object.title", label: "title\n(museum_object)", color: "#AAFFAA", shape: "dot" }
  //     ]);

  //     const edges = new DataSet([
  //       { from: "query", to: "table_location", label: "ACCESSES", color: "blue", arrows: "to" },
  //       { from: "query", to: "table_attribute", label: "ACCESSES", color: "blue", arrows: "to" },
  //       { from: "query", to: "table_museum_object", label: "ACCESSES", color: "blue", arrows: "to" },
  //       { from: "query", to: "column_location.country", label: "REFERENCES", color: "green", arrows: "to" },
  //       { from: "query", to: "column_attribute.art_style", label: "REFERENCES", color: "green", arrows: "to" },
  //       { from: "query", to: "column_attribute.material", label: "REFERENCES", color: "green", arrows: "to" },
  //       { from: "query", to: "column_location.id", label: "REFERENCES", color: "green", arrows: "to" },
  //       { from: "query", to: "column_attribute.object_id", label: "REFERENCES", color: "green", arrows: "to" },
  //       { from: "query", to: "column_museum_object.id", label: "REFERENCES", color: "green", arrows: "to" },
  //       { from: "query", to: "column_museum_object.title", label: "REFERENCES", color: "green", arrows: "to" },
  //       { from: "table_attribute", to: "table_museum_object", label: "REFERENCES", color: "green", arrows: "to" },
  //       { from: "column_museum_object.id", to: "column_attribute.object_id", label: "JOINED_WITH", color: "red", arrows: "to" }
  //     ]);

  //     const data = { nodes, edges };

  //     const options = {
  //       layout: { hierarchical: false },
  //       physics: { hierarchicalRepulsion: { nodeDistance: 180 } }
  //     };

  //     const network = new Network(containerRef.current, data, options);
  //     return () => network.destroy();
  //   }, []);

  //   return <div ref={containerRef} style={{ height: "600px", border: "1px solid #ccc", marginTop: "30px" }} />;
  // }


  // src/components/VisGraph.jsx
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
  