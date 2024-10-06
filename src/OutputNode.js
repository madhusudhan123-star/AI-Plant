import React from 'react';

const OutputNode = ({ output }) => {
    return (
        <div className="output-node">
            <label>LLM Response:</label>
            <textarea readOnly value={output} placeholder="The response will appear here..." />
        </div>
    );
};

export default OutputNode;
