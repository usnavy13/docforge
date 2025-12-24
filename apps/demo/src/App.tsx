import { useRef, useState, useCallback, useEffect } from 'react';
import {
  SpreadsheetEditor,
  SpreadsheetEditorRef,
  registerSpreadsheetHandlers,
  Workbook,
} from '@docforge/spreadsheet';
import { CommandRegistry, CommandExecutor } from '@docforge/ai-bridge';
import type { AICommand } from '@docforge/core';
import { readXlsx, writeXlsx } from '@docforge/file-io';

import Header from './components/Header';
import FilePanel from './components/FilePanel';
import AIPanel from './components/AIPanel';
import StatusBar from './components/StatusBar';

function App() {
  const editorRef = useRef<SpreadsheetEditorRef>(null);
  const [registry] = useState(() => new CommandRegistry());
  const [executor] = useState(() => new CommandExecutor(registry));
  const [workbook, setWorkbook] = useState<Workbook | undefined>();
  const [selection, setSelection] = useState<{ row: number; col: number } | null>(null);
  const [showFilePanel, setShowFilePanel] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');
  const [editorReady, setEditorReady] = useState(false);

  // Register handlers when editor is ready
  useEffect(() => {
    // Use a small delay to ensure the ref is populated after mount
    const timer = setTimeout(() => {
      if (editorRef.current) {
        registerSpreadsheetHandlers(registry, editorRef);
        setEditorReady(true);
        console.log('Spreadsheet handlers registered');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [registry]);

  // Handle workbook changes
  const handleChange = useCallback((wb: Workbook) => {
    setWorkbook(wb);
  }, []);

  // Handle selection changes
  const handleSelectionChange = useCallback(
    (sel: { sheet: number; startRow: number; startCol: number }) => {
      setSelection({ row: sel.startRow, col: sel.startCol });
    },
    []
  );

  // File operations
  const handleOpenFile = useCallback(async (file: File) => {
    try {
      const wb = await readXlsx(file);
      if (editorRef.current) {
        // Cast to spreadsheet Workbook type (compatible structure)
        editorRef.current.setData(wb as unknown as Workbook);
      }
      setShowFilePanel(false);
    } catch (err) {
      console.error('Failed to open file:', err);
      alert('Failed to open file: ' + (err as Error).message);
    }
  }, []);

  const handleSaveFile = useCallback(async () => {
    try {
      if (!editorRef.current) return;
      const wb = editorRef.current.getData();
      // Cast to file-io Workbook type (compatible structure)
      const blob = await writeXlsx(wb as unknown as Parameters<typeof writeXlsx>[0]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${wb.title || 'spreadsheet'}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setShowFilePanel(false);
    } catch (err) {
      console.error('Failed to save file:', err);
      alert('Failed to save file: ' + (err as Error).message);
    }
  }, []);

  // AI command execution
  const handleExecuteCommand = useCallback(
    async (commandJson: string) => {
      if (!editorReady) {
        setAiResult('Error: Editor not ready yet. Please wait a moment.');
        return;
      }

      try {
        const command = JSON.parse(commandJson) as AICommand;
        if (!command.id) command.id = crypto.randomUUID();
        if (!command.timestamp) command.timestamp = Date.now();

        console.log('Executing command:', command);
        const response = await executor.execute(command);
        console.log('Command response:', response);
        setAiResult(JSON.stringify(response, null, 2));
      } catch (err) {
        console.error('Command error:', err);
        setAiResult(`Error: ${(err as Error).message}\n\nStack: ${(err as Error).stack}`);
      }
    },
    [executor, editorReady]
  );

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <Header
        title={workbook?.title || 'Untitled Spreadsheet'}
        onFileClick={() => setShowFilePanel(true)}
        onAIClick={() => setShowAIPanel(!showAIPanel)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <SpreadsheetEditor
            ref={editorRef}
            toolbar="minimal"
            initialData={workbook}
            onChange={handleChange}
            onSelectionChange={handleSelectionChange}
            showFormulaBar={true}
            showSheetTabs={true}
          />
        </div>

        {showAIPanel && (
          <AIPanel
            onExecute={handleExecuteCommand}
            result={aiResult}
            onClose={() => setShowAIPanel(false)}
          />
        )}
      </div>

      <StatusBar
        sheet={workbook?.sheets[workbook.activeSheet]?.name || 'Sheet1'}
        row={selection?.row ?? 0}
        col={selection?.col ?? 0}
      />

      {showFilePanel && (
        <FilePanel
          onOpen={handleOpenFile}
          onSave={handleSaveFile}
          onClose={() => setShowFilePanel(false)}
        />
      )}
    </div>
  );
}

export default App;
