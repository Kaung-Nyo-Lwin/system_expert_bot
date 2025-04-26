import React, { useEffect } from 'react';
import vis from 'vis-network';

const VisNetwork = () => {
  useEffect(() => {
    // Create nodes and edges for the network
    const nodes = new vis.DataSet([
      { id: "query", label: "Query", color: "#FFAAAA", shape: "box" },
      { id: "table_location", label: "location", color: "#AAAAFF", shape: "dot" },
      { id: "column_museum_object.title", label: "title\n(museum_object)", color: "#AAFFAA", shape: "dot" },
      { id: "column_museum_object.id", label: "id\n(museum_object)", color: "#AAFFAA", shape: "dot" },
      { id: "column_attribute.art_style", label: "art_style\n(attribute)", color: "#AAFFAA", shape: "dot" },
      { id: "column_location.country", label: "country\n(location)", color: "#AAFFAA", shape: "dot" },
      { id: "column_attribute.object_id", label: "object_id\n(attribute)", color: "#AAFFAA", shape: "dot" },
      { id: "column_location.id", label: "id\n(location)", color: "#AAFFAA", shape: "dot" },
      { id: "column_attribute.material", label: "material\n(attribute)", color: "#AAFFAA", shape: "dot" },
      { id: "table_attribute", label: "attribute", color: "#AAAAFF", shape: "dot" },
      { id: "table_museum_object", label: "museum_object", color: "#AAAAFF", shape: "dot" }
    ]);

    const edges = new vis.DataSet([
      { from: "table_attribute", to: "table_museum_object", label: "REFERENCES", color: "green", arrows: "to" },
      { from: "column_museum_object.id", to: "column_attribute.object_id", label: "JOINED_WITH", color: "red", dashes: false, arrows: "to" },
      { from: "query", to: "table_location", label: "ACCESSES", color: "blue", arrows: "to" },
      { from: "query", to: "table_attribute", label: "ACCESSES", color: "blue", arrows: "to" },
      { from: "query", to: "table_museum_object", label: "ACCESSES", color: "blue", arrows: "to" },
      { from: "query", to: "column_location.country", label: "REFERENCES", color: "green", arrows: "to" },
      { from: "query", to: "column_attribute.art_style", label: "REFERENCES", color: "green", arrows: "to" },
      { from: "query", to: "column_attribute.material", label: "REFERENCES", color: "green", arrows: "to" },
      { from: "query", to: "column_location.id", label: "REFERENCES", color: "green", arrows: "to" },
      { from: "query", to: "column_attribute.object_id", label: "REFERENCES", color: "green", arrows: "to" },
      { from: "query", to: "column_museum_object.id", label: "REFERENCES", color: "green", arrows: "to" },
      { from: "query", to: "column_museum_object.title", label: "REFERENCES", color: "green", arrows: "to" }
    ]);

    // Create the network
    const container = document.getElementById('network');
    const data = { nodes, edges };
    const options = {
      physics: {
        hierarchicalRepulsion: {
          centralGravity: 0,
          springLength: 200,
          springConstant: 0.01,
          nodeDistance: 200,
          damping: 0.09
        },
        minVelocity: 0.75,
        solver: "hierarchicalRepulsion"
      }
    };

    new vis.Network(container, data, options);
  }, []);

  return <div id="network" style={{ width: '100%', height: '600px', border: '1px solid lightgray' }} />;
};

export default VisNetwork;