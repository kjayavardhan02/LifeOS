export type QuickCaptureType = 'task' | 'expense' | 'note' | 'reminder' | 'event';

export interface QuickCaptureResult {
  id: string;
  rawInput: string;
  detectedType: QuickCaptureType;
  resolvedType: QuickCaptureType;
  createdItemId: string | null;
  parsedData: Record<string, unknown> | null;
  createdAt: string;
}

export interface QuickCaptureParseResult {
  type: QuickCaptureType;
  confidence: number;
  parsed: Record<string, unknown>;
  preview: string;
}

export interface QuickCaptureInput {
  input: string;
  type?: QuickCaptureType;
}
