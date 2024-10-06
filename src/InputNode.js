import React, { useState } from 'react';

const InputNode = ({ setInputValue }) => {
    const [input, setInput] = useState('');

    const handleInputChange = (e) => {
        setInput(e.target.value);
        setInputValue(e.target.value);
    };

    return (
        <div className="input-node">
            <label>Enter your query:</label>
            <input type="text" value={input} onChange={handleInputChange} placeholder="Ask a question..." />
        </div>
    );
};

export default InputNode;
