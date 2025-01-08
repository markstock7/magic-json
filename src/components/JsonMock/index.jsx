import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { faker } from '@faker-js/faker';

const generateMockValue = (type) => {
  switch (type) {
    case 'string':
      return faker.lorem.word();
    case 'number':
      return faker.number.int();
    case 'boolean':
      return faker.datatype.boolean();
    case 'date':
      return faker.date.recent().toISOString();
    default:
      return null;
  }
};

const generateMockData = (structure) => {
  if (Array.isArray(structure)) {
    return structure.map(item => generateMockData(item));
  }
  
  if (typeof structure === 'object' && structure !== null) {
    const result = {};
    for (const [key, value] of Object.entries(structure)) {
      result[key] = generateMockData(value);
    }
    return result;
  }
  
  return generateMockValue(typeof structure);
};

export default function JsonMock() {
  const [template, setTemplate] = useState('');
  const [result, setResult] = useState('');
  const [count, setCount] = useState(1);

  const handleGenerate = () => {
    try {
      const structure = JSON.parse(template);
      const mockData = Array(count).fill(null).map(() => generateMockData(structure));
      setResult(JSON.stringify(mockData, null, 2));
    } catch (e) {
      setResult(`Error: ${e.message}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">JSON Mock 生成器</h2>
      <div>
        <label>生成数量：</label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          min="1"
          max="100"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h3>模板结构</h3>
          <Editor
            height="500px"
            defaultLanguage="json"
            onChange={(value) => setTemplate(value)}
            options={{ minimap: { enabled: false } }}
          />
        </div>
        <div>
          <h3>生成结果</h3>
          <Editor
            height="500px"
            defaultLanguage="json"
            value={result}
            options={{ readOnly: true, minimap: { enabled: false } }}
          />
        </div>
      </div>
      <button onClick={handleGenerate} className="mt-4">生成数据</button>
    </div>
  );
} 