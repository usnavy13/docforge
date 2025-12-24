interface StatusBarProps {
  sheet: string;
  row: number;
  col: number;
}

function colToLetter(col: number): string {
  let result = '';
  let n = col + 1;
  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

function StatusBar({ sheet, row, col }: StatusBarProps) {
  const cellRef = `${colToLetter(col)}${row + 1}`;

  return (
    <footer className="flex items-center justify-between px-4 py-1 bg-gray-800 border-t border-gray-700 text-sm">
      <div className="flex items-center gap-4">
        <span className="text-gray-400">Sheet:</span>
        <span className="text-gray-200">{sheet}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-gray-400">Cell:</span>
        <span className="text-gray-200 font-mono">{cellRef}</span>
      </div>
    </footer>
  );
}

export default StatusBar;
