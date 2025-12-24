import { useRef } from 'react';

interface FilePanelProps {
  onOpen: (file: File) => void;
  onSave: () => void;
  onClose: () => void;
}

function FilePanel({ onOpen, onSave, onClose }: FilePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpen(file);
    }
  };

  // Stop propagation to prevent FortuneSheet from capturing clicks
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onMouseDown={stopPropagation}
      onClick={stopPropagation}
      onPointerDown={stopPropagation}
    >
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-96">
        <h2 className="text-xl font-semibold text-white mb-4">File Operations</h2>

        <div className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-500 transition-colors"
            >
              Open File...
            </button>
            <p className="mt-1 text-xs text-gray-400">
              Supports .xlsx, .xls, and .csv files
            </p>
          </div>

          <div>
            <button
              onClick={onSave}
              className="w-full px-4 py-2 text-white bg-green-600 rounded hover:bg-green-500 transition-colors"
            >
              Save as XLSX
            </button>
          </div>

          <hr className="border-gray-700" />

          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-300 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilePanel;
