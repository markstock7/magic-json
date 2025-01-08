import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { createPatch } from 'diff';

export default function JsonCompare() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [diff, setDiff] = useState('');

  const compareDiff = () => {
    try {
      const leftFormatted = JSON.stringify(JSON.parse(left), null, 2);
      const rightFormatted = JSON.stringify(JSON.parse(right), null, 2);
      const diffResult = createPatch('json', leftFormatted, rightFormatted);
      setDiff(diffResult);
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      setDiff('Error: Invalid JSON');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">JSON 对比</h2>
      <div className="grid grid-cols-2 gap-4">
        <Editor
          height="400px"
          defaultLanguage="json"
          onChange={(value) => setLeft(value)}
          options={{ minimap: { enabled: false } }}
        />
        <Editor
          height="400px"
          defaultLanguage="json"
          onChange={(value) => setRight(value)}
          options={{ minimap: { enabled: false } }}
        />
      </div>
      <button onClick={compareDiff}>对比</button>
      <div className="mt-4">
        <Editor
          height="300px"
          defaultLanguage="diff"
          value={diff}
          options={{ readOnly: true, minimap: { enabled: false } }}
        />
      </div>
    </div>
  );
} 