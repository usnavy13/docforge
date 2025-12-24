import { useState } from 'react';

interface AIPanelProps {
  onExecute: (command: string) => void;
  result: string;
  onClose: () => void;
}

const EXAMPLE_COMMANDS = [
  {
    name: 'Set Cell Value',
    command: {
      type: 'sheet.setCells',
      payload: {
        cells: [{ ref: 'A1', value: 'Hello World' }],
      },
    },
  },
  {
    name: 'Set Formula',
    command: {
      type: 'sheet.setCells',
      payload: {
        cells: [
          { ref: 'A1', value: 10 },
          { ref: 'A2', value: 20 },
          { ref: 'A3', formula: '=A1+A2' },
        ],
      },
    },
  },
  {
    name: 'Format Cells',
    command: {
      type: 'sheet.format',
      payload: {
        range: 'A1:C1',
        style: {
          bold: true,
          backgroundColor: '#4A90D9',
          fontColor: '#FFFFFF',
        },
      },
    },
  },
  {
    name: 'Get Sheet Data',
    command: {
      type: 'sheet.getData',
      payload: {},
    },
  },
];

function AIPanel({ onExecute, result, onClose }: AIPanelProps) {
  const [commandText, setCommandText] = useState(
    JSON.stringify(EXAMPLE_COMMANDS[0].command, null, 2)
  );

  const handleExampleClick = (command: object) => {
    setCommandText(JSON.stringify(command, null, 2));
  };

  // Stop propagation to prevent FortuneSheet from capturing clicks
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col relative z-50"
      onMouseDown={stopPropagation}
      onClick={stopPropagation}
      onPointerDown={stopPropagation}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-white">AI Command Panel</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          X
        </button>
      </div>

      <div className="p-4 border-b border-gray-700">
        <label className="block text-xs text-gray-400 mb-2">Examples:</label>
        <div className="flex flex-wrap gap-1">
          {EXAMPLE_COMMANDS.map((ex) => (
            <button
              key={ex.name}
              onClick={() => handleExampleClick(ex.command)}
              className="px-2 py-1 text-xs text-gray-300 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <label className="block text-xs text-gray-400 mb-2">
          Command JSON:
        </label>
        <textarea
          value={commandText}
          onChange={(e) => setCommandText(e.target.value)}
          className="flex-1 w-full p-2 text-sm font-mono bg-gray-900 text-gray-300 border border-gray-700 rounded resize-none focus:outline-none focus:border-blue-500"
          placeholder="Enter AI command JSON..."
        />

        <button
          onClick={() => onExecute(commandText)}
          className="mt-2 w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-500 transition-colors"
        >
          Execute Command
        </button>
      </div>

      <div className="p-4 border-t border-gray-700 max-h-48 overflow-auto">
        <label className="block text-xs text-gray-400 mb-2">Result:</label>
        <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-words">
          {result || 'No result yet'}
        </pre>
      </div>
    </div>
  );
}

export default AIPanel;
