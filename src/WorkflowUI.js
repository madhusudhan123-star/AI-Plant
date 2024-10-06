import React, { useState, useCallback } from 'react';
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

import InputNode from './InputNode';
import LLMNode from './LLMNode';
import OutputNode from './OutputNode';

const nodeTypes = {
    input: InputNode,
    llm: LLMNode,
    output: OutputNode
};

const initialNodes = [
    {
        id: '1',
        type: 'input',
        data: { label: 'Input Node' },
        position: { x: 250, y: 5 },
    },
    {
        id: '2',
        type: 'llm',
        data: { label: 'LLM Node' },
        position: { x: 250, y: 100 },
    },
    {
        id: '3',
        type: 'output',
        data: { label: 'Output Node' },
        position: { x: 250, y: 200 },
    },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
];

const LLMWorkflow = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [inputValue, setInputValue] = useState('');
    const [llmConfig, setLLMConfig] = useState({});
    const [output, setOutput] = useState('');

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const handleRun = async () => {
        if (inputValue && llmConfig.apiKey) {
            try {
                const response = await fetch('https://api.openai.com/v1/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${llmConfig.apiKey}`
                    },
                    body: JSON.stringify({
                        model: llmConfig.model,
                        prompt: inputValue,
                        max_tokens: llmConfig.tokens
                    })
                });
                const data = await response.json();
                setOutput(data.choices[0].text);

                // Update the Output node with the new data
                setNodes((nds) =>
                    nds.map((node) => {
                        if (node.type === 'output') {
                            node.data = {
                                ...node.data,
                                output: data.choices[0].text,
                            };
                        }
                        return node;
                    })
                );
            } catch (error) {
                setOutput('Error: Unable to fetch response.');
            }
        } else {
            setOutput('Please provide input and configure the LLM node.');
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
            >
                <Controls />
                <MiniMap />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
            <div style={{ position: 'absolute', right: 10, top: 10, zIndex: 4 }}>
                <button onClick={handleRun} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Run Workflow
                </button>
            </div>
        </div>
    );
};

export default LLMWorkflow;