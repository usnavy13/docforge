interface HeaderProps {
  title: string;
  onFileClick: () => void;
  onAIClick: () => void;
}

function Header({ title, onFileClick, onAIClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-white">DocForge</h1>
        <span className="text-gray-400">|</span>
        <span className="text-gray-300">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onFileClick}
          className="px-3 py-1.5 text-sm text-gray-300 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
        >
          File
        </button>
        <button
          onClick={onAIClick}
          className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-500 transition-colors"
        >
          AI Commands
        </button>
      </div>
    </header>
  );
}

export default Header;
