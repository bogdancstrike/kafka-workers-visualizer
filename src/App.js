import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  MiniMap,
  Controls,
  Background,
  Handle,
  useNodesState,
  useEdgesState,
  MarkerType,
  getSmoothStepPath,
} from 'react-flow-renderer';
import dagre from 'dagre';
import { Button, Input } from 'antd';
import './App.css';

// Mock data representing the database structure
const backendData = [
  {
    id: 1,
    consumer_name: 'consumer1',
    topics_input: 'topic_1',
    topics_output: 'topic_2',
    metadatas: '',
    kafka_bootstrap_server: '172.17.12.80:9092',
  },
  {
    id: 2,
    consumer_name: 'consumer2',
    topics_input: 'topic_2',
    topics_output: 'topic_3,topic_4',
    metadatas: '',
    kafka_bootstrap_server: '172.17.12.80:9092',
  },
  {
    id: 3,
    consumer_name: 'consumer3',
    topics_input: 'topic_3',
    topics_output: 'topic_5',
    metadatas: '',
    kafka_bootstrap_server: '172.17.12.80:9092',
  },
  {
    id: 4,
    consumer_name: 'consumer4',
    topics_input: 'topic_4',
    topics_output: 'topic_6',
    metadatas: '',
    kafka_bootstrap_server: '172.17.12.80:9092',
  },
  {
    id: 5,
    consumer_name: 'consumer5',
    topics_input: 'topic_5,topic_6',
    topics_output: 'topic_7',
    metadatas: '',
    kafka_bootstrap_server: '172.17.12.80:9092',
  },
];

// Generate initial nodes and edges based on backend data
const generateInitialNodesAndEdges = (data, onDeleteNode, onLabelChange) => {
  const nodes = [];
  const edges = [];
  const topics = new Set();

  data.forEach((item) => {
    // Add worker node (formerly consumer)
    nodes.push({
      id: `worker-${item.id}`,
      type: 'worker',
      data: { label: `worker${item.id}`, onDeleteNode, onLabelChange },
      position: { x: 0, y: 0 }, // Initial positions, will be updated by Dagre layout
    });

    // Add topics to set
    item.topics_input.split(',').forEach((topic) => topics.add(topic));
    item.topics_output.split(',').forEach((topic) => topics.add(topic));

    // Create edges for input topics
    item.topics_input.split(',').forEach((inputTopic) => {
      edges.push({
        id: `e-${inputTopic}-worker-${item.id}`,
        source: inputTopic,
        target: `worker-${item.id}`,
        type: 'customEdge', // Default type
        animated: true,
      });
    });

    // Create edges for output topics
    item.topics_output.split(',').forEach((outputTopic) => {
      edges.push({
        id: `e-worker-${item.id}-${outputTopic}`,
        source: `worker-${item.id}`,
        target: outputTopic,
        type: 'customEdge', // Default type
        animated: true,
      });
    });
  });

  // Add topic nodes
  topics.forEach((topic) => {
    nodes.push({
      id: topic,
      type: 'topic',
      data: { label: topic, onDeleteNode, onLabelChange },
      position: { x: 0, y: 0 }, // Initial positions, will be updated by Dagre layout
    });
  });

  return { nodes, edges };
};

// Layout using Dagre
const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 200, // Increased space between nodes vertically
    nodesep: 200, // Increased space between nodes horizontally
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 172, height: 36 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // Shift dagre node position (anchor=center center) to the top left
    node.position = {
      x: nodeWithPosition.x - 172 / 2,
      y: nodeWithPosition.y - 36 / 2,
    };

    return node;
  });

  return { nodes, edges };
};

// Custom Node for Workers with Editable Name and Delete Button
const WorkerNode = ({ data, id }) => {
  const onDeleteClick = () => {
    console.log(`Attempting to delete worker node: ${id}`);
    data.onDeleteNode(id);
  };

  const onChange = (e) => {
    data.onLabelChange(id, e.target.value);
  };

  return (
    <div style={{ backgroundColor: '#FFC0CB', padding: '10px', borderRadius: '5px', border: '1px solid #000', position: 'relative' }}>
      <Handle type="target" position="left" style={{ background: '#555' }} />
      <Input
        value={data.label}
        onChange={onChange}
        style={{ width: '100%', marginBottom: '5px', fontWeight: 'bold' }}
      />
      <button
        onClick={onDeleteClick}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          cursor: 'pointer',
        }}
      >
        &times;
      </button>
      <Handle type="source" position="right" style={{ background: '#555' }} />
    </div>
  );
};

// Custom Node for Topics with Editable Name and Delete Button
const TopicNode = ({ data, id }) => {
  const onDeleteClick = () => {
    console.log(`Attempting to delete topic node: ${id}`);
    data.onDeleteNode(id);
  };

  const onChange = (e) => {
    data.onLabelChange(id, e.target.value);
  };

  return (
    <div style={{ backgroundColor: '#ADD8E6', padding: '10px', borderRadius: '5px', border: '1px solid #000', position: 'relative' }}>
      <Handle type="target" position="left" style={{ background: '#555' }} />
      <Input
        value={data.label}
        onChange={onChange}
        style={{ width: '100%', marginBottom: '5px', fontWeight: 'bold' }}
      />
      <button
        onClick={onDeleteClick}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          cursor: 'pointer',
        }}
      >
        &times;
      </button>
      <Handle type="source" position="right" style={{ background: '#555' }} />
    </div>
  );
};

// Custom Edge with Delete Button using SmoothStep
const CustomSmoothStepEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt, edgeId) => {
    evt.stopPropagation();
    console.log(`Deleting edge with id: ${edgeId}`);
    data.onEdgeDelete(edgeId); // Use the onEdgeDelete function passed via the data prop
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <text>
        <textPath
          href={`#${id}`}
          style={{ fontSize: 12 }}
          startOffset="50%"
          textAnchor="middle"
        >
          <tspan
            dy={-10}
            xlinkHref={`#${id}`}
            className="delete-btn"
            onClick={(evt) => onEdgeClick(evt, id)}
          >
            Delete
          </tspan>
        </textPath>
      </text>
    </>
  );
};

// Custom Edge with Delete Button using Floating
const CustomFloatingEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}) => {
  const path = `M${sourceX},${sourceY} C${sourceX + (targetX - sourceX) / 2},${sourceY} ${targetX - (targetX - sourceX) / 2},${targetY} ${targetX},${targetY}`;

  const onEdgeClick = (evt, edgeId) => {
    evt.stopPropagation();
    console.log(`Deleting edge with id: ${edgeId}`);
    data.onEdgeDelete(edgeId); // Use the onEdgeDelete function passed via the data prop
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={path}
        markerEnd={markerEnd}
      />
      <text>
        <textPath
          href={`#${id}`}
          style={{ fontSize: 12 }}
          startOffset="50%"
          textAnchor="middle"
        >
          <tspan
            dy={-10}
            xlinkHref={`#${id}`}
            className="delete-btn"
            onClick={(evt) => onEdgeClick(evt, id)}
          >
            Delete
          </tspan>
        </textPath>
      </text>
    </>
  );
};

// Define nodeTypes and edgeTypes here
const nodeTypes = {
  worker: WorkerNode,
  topic: TopicNode,
};

const edgeTypes = {
  smoothstep: CustomSmoothStepEdge,
  customEdge: CustomFloatingEdge,
};

const FlowApp = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(backendData.length + 1);
  const [edgeType, setEdgeType] = useState('customEdge'); // Default edge type

  // Initialize with backend data
  useEffect(() => {
    const { nodes, edges } = generateInitialNodesAndEdges(backendData, onDeleteNode, onLabelChange);
    const layouted = getLayoutedElements(nodes, edges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: edgeType, data: { onEdgeDelete } }, eds)
      ),
    [setEdges, edgeType]
  );

  const isValidConnection = (connection) => {
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);

    // Allow connections only between workers and topics
    return (
      (sourceNode.type === 'worker' && targetNode.type === 'topic') ||
      (sourceNode.type === 'topic' && targetNode.type === 'worker')
    );
  };

  const onAddWorker = useCallback(() => {
    const newWorker = {
      id: `worker-${nodeIdCounter}`,
      type: 'worker',
      data: { label: `Worker ${nodeIdCounter}`, onDeleteNode, onLabelChange },
      position: { x: 200, y: Math.random() * 250 },
    };

    setNodes((nds) => [...nds, newWorker]);
    setNodeIdCounter((id) => id + 1);
  }, [nodeIdCounter, setNodes]);

  const onAddTopic = useCallback(() => {
    const newTopic = {
      id: `topic-${nodeIdCounter}`,
      type: 'topic',
      data: { label: `Topic ${nodeIdCounter}`, onDeleteNode, onLabelChange },
      position: { x: 400, y: Math.random() * 250 },
    };

    setNodes((nds) => [...nds, newTopic]);
    setNodeIdCounter((id) => id + 1);
  }, [nodeIdCounter, setNodes]);

  const onEdgeDelete = useCallback(
    (id) => {
      console.log(`Deleting edge with id: ${id}`);
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
    },
    [setEdges]
  );

  const onDeleteNode = useCallback(
    (id) => {
      console.log(`Deleting node with id: ${id}`);
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    },
    [setNodes, setEdges]
  );

  const onLabelChange = useCallback(
    (id, newLabel) => {
      setNodes((nds) =>
        nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, label: newLabel } } : node))
      );
    },
    [setNodes]
  );

  const onSave = () => {
    console.log('Current nodes:', nodes);
    console.log('Current edges:', edges);

    const tableStructure = nodes
      .filter((node) => node.id.startsWith('worker'))
      .map((worker) => {
        const inputs = edges
          .filter((edge) => edge.target === worker.id)
          .map((edge) => nodes.find((node) => node.id === edge.source).data.label)
          .join(',');

        const outputs = edges
          .filter((edge) => edge.source === worker.id)
          .map((edge) => nodes.find((node) => node.id === edge.target).data.label)
          .join(',');

        return {
          id: parseInt(worker.id.split('-')[1]),
          worker_name: worker.data.label,
          topics_input: inputs,
          topics_output: outputs,
          metadatas: '',
          kafka_bootstrap_server: '172.17.12.80:9092',
        };
      });
    console.log('Generated Table Structure (JSON):', JSON.stringify(tableStructure, null, 2));
  };

  const onLayout = useCallback(
    (direction) => {
      const layouted = getLayoutedElements(nodes, edges, direction);
      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);
    },
    [nodes, edges, setNodes, setEdges]
  );

  const toggleEdgeType = () => {
    const newEdgeType = edgeType === 'step' ? 'customEdge' : 'step';
    setEdgeType(newEdgeType);
    setEdges((eds) => eds.map((edge) => ({ ...edge, type: newEdgeType })));
  };

  return (
    <div style={{ height: '100vh' }}>
      <div className="controls">
        <Button type="primary" onClick={onAddWorker} style={{ marginRight: 10 }}>
          Add Worker
        </Button>
        <Button type="primary" onClick={onAddTopic} style={{ marginRight: 10 }}>
          Add Topic
        </Button>
        <Button type="primary" danger onClick={onSave} style={{ marginRight: 10 }}>
          Save
        </Button>
        <Button type="default" onClick={toggleEdgeType} style={{ marginRight: 10 }}>
          Toggle Edge Type
        </Button>
        <Button type="default" onClick={() => onLayout('TB')} style={{ marginRight: 10 }}>
          Vertical Layout
        </Button>
        <Button type="default" onClick={() => onLayout('LR')}>
          Horizontal Layout
        </Button>

      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        isValidConnection={isValidConnection}
        defaultEdgeOptions={{ data: { onEdgeDelete } }}
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

const App = () => (
  <ReactFlowProvider>
    <FlowApp />
  </ReactFlowProvider>
);

export default App;
