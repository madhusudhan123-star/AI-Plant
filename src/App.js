import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import { Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import LLM from './LLM.svg';
import input from './input.svg'
import output from './output.svg'
import three from './three.svg'
import logo from './logo.svg'

// Input Node Component
const InputNode = ({ data }) => (
  <div className="px-1  py-1 rounded-md flex flex-col items-start justify-between  bg-white border-0 ">
    <Handle type="source" position={Position.Right} />
    <div className="font-bold flex justify-between items-center mb-2 pb-8">
      <img src={input} alt="LLM Icon" className="w-6 h-6 mr-2" /> INPUT
    </div>
    <p >Input</p>
    <input
      className="nodrag border rounded p-2 mt-2 w-full"
      type="text"
      onChange={(evt) => data.onChange(evt.target.value)}
      placeholder="Type SomeThing..."
    />
  </div>
);

const LLMNode = ({ data }) => {
  const [modelName, setModelName] = useState('gpt-3.5');
  const [apiBase, setApiBase] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [maxTokens, setMaxTokens] = useState(2000);
  const [temperature, setTemperature] = useState(0.5);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass the values to the data object for processing
    data.onSubmit({ modelName, apiBase, apiKey, maxTokens, temperature });
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white ">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="font-bold flex items-center mb-2">
        <img src={LLM} alt="LLM Icon" className="w-6 h-6 mr-2" /> LLM ENGINE
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Model Name Dropdown */}
        <div>
          <label className="block mb-1">Model Name</label>
          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="gpt-3.5">gpt-3.5</option>
            <option value="gpt-4">gpt-4</option>
          </select>
        </div>

        {/* OpenAI API Base Input */}
        <div>
          <label className="block mb-1">OpenAI API Base</label>
          <input
            type="text"
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="type something"
          />
        </div>

        {/* OpenAI API Key Input */}
        <div>
          <label className="block mb-1">OpenAI Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="type something"
          />
        </div>

        {/* Max Tokens Input */}
        <div>
          <label className="block mb-1">Max Tokens</label>
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            placeholder="type something"
          />
        </div>

        {/* Temperature Input */}
        <div>
          <label className="block mb-1">Temperature</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Configure LLM</button>
      </form>
    </div>
  );
};

const OutputNode = ({ data }) => (
  <div className="px-1 py-2 rounded-md bg-white shadow-md border-2 border-gray-300">
    <Handle type="target" position={Position.Left} />

    {/* Title section with a soft background and bold title */}
    <div className=" rounded-t-md text-black font-bold flex items-center ">
      <img src={output} alt="LLM Icon" className="w-6 h-6 mr-2" />
      <span>OUTPUT</span>
    </div>
    {/* Main content where the output is displayed */}
    <div className="py-2">
      <label className="block font-medium text-gray-700">Output Response</label>

      {/* Output box that expands based on the text content */}
      <textarea
        readOnly
        placeholder="Output Response will be shown here"
        value={data.output || ''}
        className="w-full mt-1 border rounded-md bg-gray-50 h-auto resize-none"
        style={{ minHeight: data.output ? "100px" : "auto", height: data.output ? "auto" : "100px" }}
      ></textarea>
    </div>

    {/* Optional footer (like a reference to the LLM engine) */}
    <div className=" py-1 text-gray-500 text-sm">
      LLM Engine
    </div>
  </div>
);



const nodeTypes = {
  input: InputNode,
  llm: LLMNode,
  output: OutputNode,
};

// Start with no nodes on load
const initialNodes = [];

const LLMWorkflow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [error, setError] = useState(null);

  const inputRef = useRef('');
  const llmConfigRef = useRef({ apiKey: '', model: 'gpt-3.5-turbo', tokens: 2000 });

  // Function to add nodes only if they are not already added
  const addNode = (type) => {
    if (nodes.some((node) => node.type === type)) {
      setError(`${type.charAt(0).toUpperCase() + type.slice(1)} Node is already added.`);
      return;
    }

    const newNode = {
      id: `${nodes.length + 1}`,
      type,
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        ...(type === 'input' && { onChange: (val) => (inputRef.current = val) }),
        ...(type === 'llm' && {
          onSubmit: ({ modelName, apiBase, apiKey, maxTokens, temperature }) => {
            llmConfigRef.current = { modelName, apiBase, apiKey, maxTokens, temperature };
          },
        }),
      },
      position: { x: type === 'input' ? 200 : type === 'output' ? 600 : 400, y: 150 },
    };

    setNodes((nds) => [...nds, newNode]);

    // Automatically connect nodes
    if (type === 'input') {
      connectNodes('input', 'llm');
    } else if (type === 'output') {
      connectNodes('llm', 'output');
    }
  };

  // Function to automatically connect nodes
  const connectNodes = (sourceType, targetType) => {
    const sourceNode = nodes.find((n) => n.type === sourceType);
    const targetNode = nodes.find((n) => n.type === targetType);

    if (sourceNode && targetNode) {
      setEdges((eds) =>
        addEdge(
          {
            id: `${sourceNode.id}-${targetNode.id}`,
            source: sourceNode.id,
            target: targetNode.id,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      );
    }
  };

  // Handle valid connections only (input → LLM → output)
  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (
        (sourceNode?.type === 'input' && targetNode?.type === 'llm') ||
        (sourceNode?.type === 'llm' && targetNode?.type === 'output')
      ) {
        setEdges((eds) =>
          addEdge(
            {
              ...params,
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed },
            },
            eds
          )
        );
      } else {
        setError('Invalid connection. Input → LLM → Output only.');
      }
    },
    [nodes, setEdges]
  );


  const handleRun = async () => {
    setError(null);

    // Validate Input and LLM Configuration
    if (!inputRef.current || !llmConfigRef.current.apiKey) {
      setError('Please provide input and configure the LLM node.');
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${llmConfigRef.current.apiKey}`,
        },
        body: JSON.stringify({
          model: llmConfigRef.current.modelName,
          messages: [{ role: 'user', content: inputRef.current }],
          max_tokens: parseInt(llmConfigRef.current.maxTokens),
          temperature: parseFloat(llmConfigRef.current.temperature),
        }),
      });

      const data = await response.json();
      const output = data.choices[0].message.content;

      // Update Output Node with Response
      setNodes((nds) =>
        nds.map((node) =>
          node.type === 'output' ? { ...node, data: { ...node.data, output } } : node
        )
      );
    } catch (error) {
      setError(`Error: ${error.message}`);
    }
  };


  return (
    <div>
      <div>
        <div className='flex items-center justify-between mx-5'>
          <div className='flex items-center px-5 py-3'>
            <img src={logo} alt="LLM Icon" className="w-12 h-12 mr-2" />
            <h1 className='font-bold'>Open AGI</h1>
          </div>
          <div className=" flex flex-col items-end">
            <button
              onClick={handleRun}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2"
            >
              Run Workflow
            </button>
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', width: '100vw', height: '90vh', background: "#e5e7eb" }}>

        {/* Sidebar */}
        <div className="w-1/5 bg-white z-10 m-3 p-4 shadow-md rounded-lg">
          <div className="font-bold text-lg mb-4">Components</div>
          <div className='w-full h-[1px] bg-[#e5e7eb]'></div>
          <button
            className="block w-full flex items-center justify-between p-2 mb-2 mt-5 rounded"
            onClick={() => addNode('input')}
          >
            <div className='flex'>
              <img src={input} alt="LLM Icon" className="w-6 h-6 mr-2" />
              Add Input Node
            </div>
            <img src={three} alt="LLM Icon" className="w-3 h-3 mr-2" />
          </button>
          <button
            className="block w-full flex items-center justify-between p-2 mb-2 rounded"
            onClick={() => addNode('llm')}
          >
            <div className='flex'>

              <img src={LLM} alt="LLM Icon" className="w-6 h-6 mr-2" />
              Add LLM Node
            </div>
            <img src={three} alt="LLM Icon" className="w-3 h-3 mr-2" />
          </button>
          <button
            className="block w-full flex items-center justify-between p-2 mb-2 rounded"
            onClick={() => addNode('output')}
          >
            <div className="flex">
              <img src={output} alt="LLM Icon" className="w-6 h-6 mr-2" />
              Add Output Node
            </div>
            <img src={three} alt="LLM Icon" className="w-3 h-3 mr-2" />
          </button>
        </div>

        {/* Main Workflow Area */}
        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className='w-full'
          >
            <Background className='z-0' variant="dots" gap={20} size={5} />
            <Controls />

          </ReactFlow>

        </div>
      </div>
    </div>
  );
};

export default LLMWorkflow;


