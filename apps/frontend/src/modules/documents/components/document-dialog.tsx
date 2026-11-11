import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Globe } from 'lucide-react';
import { useCategoryNames } from '@/hooks/use-categories';
import { FileUploadZone } from './file-upload-zone';
import type { Document, CreateDocumentInput, UpdateDocumentInput } from '@lifeos/shared';

type TabMode = 'upload' | 'external';

interface DocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    input: CreateDocumentInput | (UpdateDocumentInput & { id: string });
    files?: File[];
  }) => void;
  document?: Document | null;
  folders?: string[];
  currentFolder?: string;
}

export function DocumentDialog({ open, onClose, onSubmit, document, folders = [], currentFolder }: DocumentDialogProps) {
  const isEdit = !!document;
  const documentCategories = useCategoryNames('document');

  const [tab, setTab] = useState<TabMode>('upload');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [folder, setFolder] = useState('/');
  const [tags, setTags] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (document) {
      setTab(document.storageType === 'external' ? 'external' : 'upload');
      setName(document.name);
      setDescription(document.description ?? '');
      setCategory(document.category);
      setFolder(document.folder ?? '/');
      setTags(document.tags.join(', '));
      setDocumentNumber(document.documentNumber ?? '');
      setIssuer(document.issuer ?? '');
      setIssueDate(document.issueDate ? document.issueDate.slice(0, 10) : '');
      setExpiryDate(document.expiryDate ? document.expiryDate.slice(0, 10) : '');
      setNotes(document.notes ?? '');
      setExternalUrl(document.externalUrl ?? '');
      setFiles([]);
    } else {
      setTab('upload');
      setName('');
      setDescription('');
      setCategory('Other');
      setFolder(currentFolder || '/');
      setTags('');
      setDocumentNumber('');
      setIssuer('');
      setIssueDate('');
      setExpiryDate('');
      setNotes('');
      setExternalUrl('');
      setFiles([]);
    }
  }, [document, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (isEdit) {
      onSubmit({
        input: {
          id: document.id,
          name: name.trim(),
          description: description || null,
          category,
          folder,
          tags: tagList,
          documentNumber: documentNumber || null,
          issuer: issuer || null,
          issueDate: issueDate ? new Date(issueDate).toISOString() : null,
          expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
          notes: notes || null,
          externalUrl: tab === 'external' ? externalUrl || null : null,
        },
      });
    } else {
      const storageType = tab === 'external' ? 'external' : 'local';
      onSubmit({
        input: {
          name: name.trim(),
          description: description || undefined,
          category,
          folder: folder || '/',
          tags: tagList.length ? tagList : undefined,
          documentNumber: documentNumber || undefined,
          issuer: issuer || undefined,
          issueDate: issueDate ? new Date(issueDate).toISOString() : undefined,
          expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
          notes: notes || undefined,
          storageType,
          externalUrl: storageType === 'external' ? externalUrl : undefined,
        },
        files: storageType === 'local' ? files : undefined,
      });
    }
  };

  const inputClass =
    'w-full rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1';

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 animate-overlay-in" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-dialog-in pointer-events-auto" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
          <div className="shrink-0 flex items-center justify-between border-b border-border bg-card px-4 py-2.5 rounded-t-lg">
            <h2 className="text-base font-semibold text-foreground">
              {isEdit ? 'Edit Document' : 'New Document'}
            </h2>
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {!isEdit && (
            <div className="shrink-0 flex border-b border-border">
              <button
                type="button"
                onClick={() => setTab('upload')}
                className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  tab === 'upload'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                Upload
              </button>
              <button
                type="button"
                onClick={() => setTab('external')}
                className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  tab === 'external'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                External Link
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="px-4 py-3 space-y-2.5 overflow-y-auto flex-1 min-h-0 overscroll-contain">
              <div>
                <label className={labelClass}>Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Passport, PAN Card"
                  className={inputClass}
                  autoFocus
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description..."
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                    {documentCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Folder</label>
                  {folders.length > 0 ? (
                    <select value={folder} onChange={(e) => setFolder(e.target.value)} className={inputClass}>
                      <option value="/">/ (Root)</option>
                      {[...new Set(folders.filter((f) => f !== '/'))].sort().map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="/" className={inputClass} />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Doc Number</label>
                  <input type="text" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="ABCDE1234F" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Issuer</label>
                  <input type="text" value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Govt. of India" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tags</label>
                  <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1, tag2" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Issue Date</label>
                  <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Expiry Date</label>
                  <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Notes</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." className={inputClass} />
              </div>

              {tab === 'upload' && !isEdit && (
                <div>
                  <label className={labelClass}>Files</label>
                  <FileUploadZone files={files} onChange={setFiles} />
                </div>
              )}

              {tab === 'external' && (
                <div>
                  <label className={labelClass}>External URL *</label>
                  <input type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://drive.google.com/..." className={inputClass} />
                </div>
              )}
            </div>

            <div className="shrink-0 flex justify-end gap-3 px-4 py-2.5 border-t border-border rounded-b-lg">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || (tab === 'external' && !isEdit && !externalUrl)}
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                {isEdit ? 'Save Changes' : 'Create Document'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    globalThis.document.body,
  );
}
