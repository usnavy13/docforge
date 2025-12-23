// Types for @docforge/file-io

export interface XlsxOptions {
  sheetName?: string;
  includeStyles?: boolean;
  password?: string;
}

export interface PptxOptions {
  author?: string;
  subject?: string;
  title?: string;
}

export interface PdfOptions {
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface CsvOptions {
  delimiter?: string;
  quoteChar?: string;
  headers?: boolean;
}
