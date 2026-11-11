import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Edit2,
  Trash2,
  Download,
  Plus,
  ExternalLink,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Globe,
  HardDrive,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Eye,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useUpdateDocument, useDeleteDocument, useUploadFiles, useDeleteFile } from '../hooks/use-documents';
import type { Document, DocumentFile as DocFile } from '@lifeos/shared';

interface DocumentDetailPanelProps {
  document: Document | null;
  onClose: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType === 'application/pdf') return FileText;
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
  return File;
}

function isPreviewable(mimeType: string): 'image' | 'pdf' | false {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  return false;
}

function getFilePreviewUrl(fileId: string, token: string | null): string {
  const base = `/api/documents/files/${fileId}/download`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

function getExpiryInfo(expiryDate: string | null): { label: string; className: string; icon: typeof AlertTriangle } | null {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return { label: `Expired ${Math.abs(daysUntil)}d ago`, className: 'text-danger', icon: AlertTriangle };
  if (daysUntil <= 30) return { label: `Expires in ${daysUntil} days`, className: 'text-warning', icon: Clock };
  return { label: 'Valid', className: 'text-success', icon: CheckCircle2 };
}

export function DocumentDetailPanel({ document: doc, onClose }: DocumentDetailPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = useState<DocFile | null>(null);
  const [expandedPreview, setExpandedPreview] = useState<DocFile | null>(null);
  const token = useAuthStore((s) => s.token);
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();
  const uploadFiles = useUploadFiles();
  const deleteFile = useDeleteFile();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editDocumentNumber, setEditDocumentNumber] = useState('');
  const [editIssuer, setEditIssuer] = useState('');
  const [editIssueDate, setEditIssueDate] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editExternalUrl, setEditExternalUrl] = useState('');

  useEffect(() => {
    if (doc) {
      setEditName(doc.name);
      setEditDescription(doc.description ?? '');
      setEditCategory(doc.category);
      setEditTags(doc.tags.join(', '));
      setEditDocumentNumber(doc.documentNumber ?? '');
      setEditIssuer(doc.issuer ?? '');
      setEditIssueDate(doc.issueDate?.slice(0, 10) ?? '');
      setEditExpiryDate(doc.expiryDate?.slice(0, 10) ?? '');
      setEditNotes(doc.notes ?? '');
      setEditExternalUrl(doc.externalUrl ?? '');
      setIsEditing(false);
    }
  }, [doc]);

  if (!doc) return null;

  const expiry = getExpiryInfo(doc.expiryDate);
  const isLocal = doc.storageType === 'local';

  const handleDelete = () => {
    deleteDocument.mutate(doc.id);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;
    uploadFiles.mutate({ documentId: doc.id, files: selected });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteFile = (fileId: string) => {
    deleteFile.mutate({ documentId: doc.id, fileId });
  };

  const handleDownload = (file: DocFile) => {
    window.open(getFilePreviewUrl(file.id, token), '_blank');
  };

  const handleSave = () => {
    if (!editName.trim()) return;
    const tagList = editTags.split(',').map((t) => t.trim()).filter(Boolean);
    updateDocument.mutate(
      {
        id: doc.id,
        name: editName.trim(),
        description: editDescription || null,
        category: editCategory,
        tags: tagList,
        documentNumber: editDocumentNumber || null,
        issuer: editIssuer || null,
        issueDate: editIssueDate || null,
        expiryDate: editExpiryDate || null,
        notes: editNotes || null,
        externalUrl: editExternalUrl || null,
      },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const inputClass =
    'w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 animate-overlay-in" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center p-6 pointer-events-none">
        <div className="relative w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl flex flex-col animate-dialog-in pointer-events-auto" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between border-b border-border bg-card px-5 py-4 rounded-t-lg">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-5 w-5 shrink-0 text-primary" />
              <h2 className="truncate text-base font-semibold text-foreground">{doc.name}</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Edit document"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5 overflow-y-auto flex-1 min-h-0 overscroll-contain">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Description</label>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className={inputClass + ' resize-none'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Category</label>
                  <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Tags</label>
                  <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)} className={inputClass} placeholder="tag1, tag2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Document Number</label>
                    <input type="text" value={editDocumentNumber} onChange={(e) => setEditDocumentNumber(e.target.value)} className={inputClass} placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Issuer</label>
                    <input type="text" value={editIssuer} onChange={(e) => setEditIssuer(e.target.value)} className={inputClass} placeholder="Optional" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Issue Date</label>
                    <input type="date" value={editIssueDate} onChange={(e) => setEditIssueDate(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Expiry Date</label>
                    <input type="date" value={editExpiryDate} onChange={(e) => setEditExpiryDate(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Notes</label>
                  <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className={inputClass + ' resize-none'} />
                </div>
                {!isLocal && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">External URL</label>
                    <input type="url" value={editExternalUrl} onChange={(e) => setEditExternalUrl(e.target.value)} className={inputClass} placeholder="https://..." />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!editName.trim()}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Metadata badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-card-hover px-1.5 py-0.5 text-xs text-muted-foreground">
                    {doc.category}
                  </span>
                  {doc.folder && doc.folder !== '/' && (
                    <span className="flex items-center gap-1 rounded bg-card-hover px-1.5 py-0.5 text-xs text-muted-foreground">
                      {doc.folder}
                    </span>
                  )}
                  <span className="flex items-center gap-1 rounded bg-card-hover px-1.5 py-0.5 text-xs text-muted-foreground">
                    {isLocal ? <HardDrive className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                    {isLocal ? 'Local' : 'External'}
                  </span>
                  {expiry && (
                    <span className={cn('flex items-center gap-1 rounded px-1.5 py-0.5 text-xs', expiry.className)}>
                      <expiry.icon className="h-3 w-3" />
                      {expiry.label}
                    </span>
                  )}
                </div>

                {/* Description */}
                {doc.description && (
                  <div>
                    <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{doc.description}</p>
                  </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  {doc.documentNumber && (
                    <div>
                      <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Document Number</h3>
                      <p className="text-sm text-foreground font-mono">{doc.documentNumber}</p>
                    </div>
                  )}
                  {doc.issuer && (
                    <div>
                      <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Issuer</h3>
                      <p className="text-sm text-muted-foreground">{doc.issuer}</p>
                    </div>
                  )}
                  {doc.issueDate && (
                    <div>
                      <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Issue Date</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(doc.issueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                  {doc.expiryDate && (
                    <div>
                      <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Expiry Date</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(doc.expiryDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {doc.tags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {doc.tags.map((tag) => (
                        <span key={tag} className="rounded bg-card-hover px-2 py-0.5 text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* External URL */}
                {doc.externalUrl && (
                  <div>
                    <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">External Link</h3>
                    <a
                      href={doc.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="truncate">{doc.externalUrl}</span>
                    </a>
                  </div>
                )}

                {/* Notes */}
                {doc.notes && (
                  <div>
                    <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{doc.notes}</p>
                  </div>
                )}
              </>
            )}

            {/* Files section — always visible */}
            {isLocal && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-muted uppercase tracking-wider">
                    Files ({doc.files.length})
                  </h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                  />
                </div>

                {doc.files.length === 0 ? (
                  <p className="text-sm text-muted">No files uploaded yet</p>
                ) : (
                  <div className="space-y-2">
                    {doc.files.map((file) => {
                      const FileIcon = getFileIcon(file.mimeType);
                      const previewType = isPreviewable(file.mimeType);
                      const isActive = previewFile?.id === file.id;
                      return (
                        <div key={file.id} className="space-y-2">
                          <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2 group">
                            <FileIcon className="h-4 w-4 shrink-0 text-muted" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-foreground">{file.originalName}</p>
                              <p className="text-xs text-muted">
                                {formatFileSize(file.fileSize)}
                                {file.label && ` - ${file.label}`}
                                {' - v'}
                                {file.version}
                              </p>
                            </div>
                            {previewType && (
                              <button
                                onClick={() => setPreviewFile(isActive ? null : file)}
                                className={cn(
                                  'shrink-0 rounded p-1 transition-colors',
                                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                                )}
                                title={isActive ? 'Close preview' : 'Preview'}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDownload(file)}
                              className="shrink-0 rounded p-1 text-muted-foreground hover:text-primary transition-colors"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="shrink-0 rounded p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-danger transition-all"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {isActive && previewType && (
                            <div className="relative rounded-md border border-border bg-background overflow-hidden">
                              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-card-hover">
                                <span className="text-xs text-muted-foreground">Preview</span>
                                <button
                                  onClick={() => setExpandedPreview(file)}
                                  className="rounded p-1 text-muted-foreground hover:text-primary transition-colors"
                                  title="Expand"
                                >
                                  <Maximize2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              {previewType === 'image' ? (
                                <img
                                  src={getFilePreviewUrl(file.id, token)}
                                  alt={file.originalName}
                                  className="w-full max-h-64 object-contain bg-black/20"
                                />
                              ) : (
                                <iframe
                                  src={getFilePreviewUrl(file.id, token)}
                                  title={file.originalName}
                                  className="w-full h-72 border-0"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-muted space-y-1">
              <p>Created {format(new Date(doc.createdAt), 'MMM d, yyyy h:mm a')}</p>
              <p>Updated {format(new Date(doc.updatedAt), 'MMM d, yyyy h:mm a')}</p>
            </div>

            {/* Delete */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Document
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded preview modal */}
      {expandedPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70" onClick={() => setExpandedPreview(null)} />
          <div className="relative z-10 w-[90vw] h-[85vh] flex flex-col rounded-lg border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
              <span className="text-sm font-medium text-foreground truncate">{expandedPreview.originalName}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDownload(expandedPreview)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-primary transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setExpandedPreview(null)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  title="Close"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-black/20">
              {isPreviewable(expandedPreview.mimeType) === 'image' ? (
                <img
                  src={getFilePreviewUrl(expandedPreview.id, token)}
                  alt={expandedPreview.originalName}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <iframe
                  src={getFilePreviewUrl(expandedPreview.id, token)}
                  title={expandedPreview.originalName}
                  className="w-full h-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
