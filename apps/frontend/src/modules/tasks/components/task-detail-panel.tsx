import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Circle, CheckCircle2, Calendar as CalendarIcon, Clock, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityBadge } from './priority-badge';
import { StatusBadge } from './status-badge';
import { useUpdateTask, useDeleteTask, useAddSubtask, useUpdateSubtask, useDeleteSubtask } from '../hooks/use-tasks';
import type { Task, Priority, TaskStatus } from '@lifeos/shared';
import { format } from 'date-fns';

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskDetailPanel({ task, onClose }: TaskDetailPanelProps) {
  const [newSubtask, setNewSubtask] = useState('');
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const addSubtask = useAddSubtask();
  const updateSubtask = useUpdateSubtask();
  const deleteSubtask = useDeleteSubtask();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('todo');

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description ?? '');
      setEditPriority(task.priority);
      setEditCategory(task.category);
      setEditTags(task.tags.join(', '));
      setEditDueDate(task.dueDate ? task.dueDate.slice(0, 16) : '');
      setEditEstimatedMinutes(task.estimatedMinutes?.toString() ?? '');
      setEditNotes(task.notes ?? '');
      setEditStatus(task.status);
      setIsEditing(false);
    }
  }, [task]);

  if (!task) return null;

  const isDone = task.status === 'done';

  const handleToggleStatus = () => {
    updateTask.mutate({
      id: task.id,
      status: isDone ? 'todo' : 'done',
    });
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id);
    onClose();
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    addSubtask.mutate({ taskId: task.id, title: newSubtask.trim() });
    setNewSubtask('');
  };

  const handleToggleSubtask = (subtaskId: string, isCompleted: boolean) => {
    updateSubtask.mutate({
      taskId: task.id,
      subtaskId,
      isCompleted: !isCompleted,
    });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    deleteSubtask.mutate({ taskId: task.id, subtaskId });
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    const tagList = editTags.split(',').map((t) => t.trim()).filter(Boolean);
    updateTask.mutate(
      {
        id: task.id,
        title: editTitle.trim(),
        description: editDescription || null,
        priority: editPriority,
        category: editCategory,
        tags: tagList,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
        estimatedMinutes: editEstimatedMinutes ? parseInt(editEstimatedMinutes, 10) : null,
        notes: editNotes || null,
        status: editStatus,
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
          <div className="shrink-0 flex items-center justify-between border-b border-border bg-card px-5 py-4 rounded-t-lg">
            <div className="flex items-center gap-2">
              <button onClick={handleToggleStatus} className="text-muted-foreground hover:text-primary transition-colors">
                {isDone ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5" />}
              </button>
              <h2 className={cn('text-base font-semibold text-foreground', isDone && 'line-through text-muted-foreground')}>
                {task.title}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Edit task"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5 overflow-y-auto flex-1 min-h-0 overscroll-contain">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Title</label>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Description</label>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className={inputClass + ' resize-none'} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Priority</label>
                    <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as Priority)} className={inputClass}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Status</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as TaskStatus)} className={inputClass}>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
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
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Due Date</label>
                    <input type="datetime-local" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Estimated Minutes</label>
                    <input type="number" value={editEstimatedMinutes} onChange={(e) => setEditEstimatedMinutes(e.target.value)} className={inputClass} placeholder="e.g. 30" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Notes</label>
                  <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className={inputClass + ' resize-none'} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!editTitle.trim()}
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
                <div className="flex flex-wrap gap-2">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                  <span className="rounded bg-card-hover px-1.5 py-0.5 text-xs text-muted-foreground">{task.category}</span>
                </div>

                {task.description && (
                  <div>
                    <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      {format(new Date(task.dueDate), 'MMM d, yyyy h:mm a')}
                    </div>
                  )}
                  {task.estimatedMinutes && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {task.estimatedMinutes} min
                    </div>
                  )}
                </div>

                {task.tags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {task.tags.map((tag) => (
                        <span key={tag} className="rounded bg-card-hover px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {task.notes && (
                  <div>
                    <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.notes}</p>
                  </div>
                )}
              </>
            )}

            {/* Subtasks always visible */}
            <div>
              <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
                Subtasks ({task.subtasks.filter((s) => s.isCompleted).length}/{task.subtasks.length})
              </h3>
              <div className="space-y-1.5">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => handleToggleSubtask(subtask.id, subtask.isCompleted)}
                      className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {subtask.isCompleted
                        ? <CheckCircle2 className="h-4 w-4 text-success" />
                        : <Circle className="h-4 w-4" />
                      }
                    </button>
                    <span className={cn('flex-1 text-sm', subtask.isCompleted && 'line-through text-muted')}>
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                    placeholder="Add subtask..."
                    className="flex-1 rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="shrink-0 rounded-md bg-card-hover p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
