import { useState } from 'react';
import Editor from '@monaco-editor/react';

function renderPath(path, value) {
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).map(([key, val]) => {
      const newPath = path ? `${path}.${key}` : key;
      return (
        <div key={newPath} className="ml-4">
          <div>{newPath}: {typeof val}</div>
          {renderPath(newPath, val)}
        </div>
      );
    });
  }
  return null;
}

export default function JsonDiff() {
  const [json, setJson] = useState({});
  const [error, setError] = useState('');

  const handleChange = (value) => {
    try {
      const parsed = JSON.parse(value);
      setJson(parsed);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">JSON 结构分解</h2>
      <div className="grid grid-cols-2 gap-4">
        <Editor
          height="500px"
          defaultLanguage="json"
          onChange={handleChange}
          options={{ minimap: { enabled: false } }}
        />
        <div className="border p-4 overflow-auto">
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            renderPath('', json)
          )}
        </div>
      </div>
    </div>
  );
} 