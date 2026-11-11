import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Target, Flame, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useGoals,
  useCreateGoal,
  useGoalStats,
} from '../hooks/use-goals';
import type { GoalListItem } from '../hooks/use-goals';
import {
  useTodayChecklist,
  useCreateHabit,
  useLogHabit,
  useDeleteHabit,
  useHabitStats,
} from '../hooks/use-habits';
import { GoalCard } from '../components/goal-card';
import { GoalDialog } from '../components/goal-dialog';
import { GoalFiltersBar } from '../components/goal-filters';
import { HabitDialog } from '../components/habit-dialog';
import { HabitChecklist } from '../components/habit-checklist';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import type {
  GoalFilters,
  CreateGoalInput,
  UpdateGoalInput,
  CreateHabitInput,
  UpdateHabitInput,
  Habit,
} from '@lifeos/shared';

type Tab = 'goals' | 'habits';

export function GoalsHabitsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('habits');
  const [goalFilters, setGoalFilters] = useState<GoalFilters>({});
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteHabitId, setDeleteHabitId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data: goalsData, isLoading: goalsLoading } = useGoals({ ...goalFilters, page, limit: 20 });
  const { data: goalStatsData } = useGoalStats();
  const { data: todayData, isLoading: todayLoading } = useTodayChecklist();
  const { data: habitStatsData } = useHabitStats();

  const createGoal = useCreateGoal();
  const createHabit = useCreateHabit();
  const logHabit = useLogHabit();
  const deleteHabit = useDeleteHabit();

  const goals = goalsData?.data ?? [];
  const goalMeta = goalsData?.meta;
  const goalStats = goalStatsData?.data;
  const todayHabits = todayData?.data ?? [];
  const habitStats = habitStatsData?.data;

  const todayStr = new Date().toISOString().split('T')[0]!;

  const handleGoalSubmit = (input: CreateGoalInput | (UpdateGoalInput & { id: string })) => {
    if ('id' in input) return;
    createGoal.mutate(input, { onSuccess: () => setGoalDialogOpen(false) });
  };

  const handleHabitSubmit = (input: CreateHabitInput | (UpdateHabitInput & { id: string })) => {
    if ('id' in input) return;
    createHabit.mutate(input as CreateHabitInput, { onSuccess: () => setHabitDialogOpen(false) });
  };

  const handleToggleHabit = (habitId: string, completed: boolean) => {
    logHabit.mutate({ habitId, date: todayStr, value: completed ? 1 : 0 });
  };

  const handleCardClick = (goal: GoalListItem) => {
    navigate(`/goals/${goal.id}`);
  };

  const completedToday = todayHabits.filter((h) => h.todayLog !== null && h.todayLog.value > 0).length;
  const totalToday = todayHabits.length;
  const todayProgress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Goals & Habits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your goals and build daily habits
          </p>
        </div>
        <button
          onClick={() => activeTab === 'goals' ? setGoalDialogOpen(true) : setHabitDialogOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          {activeTab === 'goals' ? 'New Goal' : 'New Habit'}
        </button>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Today's Progress</p>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{todayProgress}%</p>
          <p className="text-xs text-muted-foreground">{completedToday}/{totalToday} habits</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Best Streak</p>
            <Flame className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{habitStats?.currentBestStreak ?? 0}</p>
          <p className="text-xs text-muted-foreground">days current</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Active Goals</p>
            <Target className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{goalStats?.inProgressGoals ?? 0}</p>
          <p className="text-xs text-muted-foreground">of {goalStats?.totalGoals ?? 0} total</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Completed</p>
            <Trophy className="h-4 w-4 text-success" />
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{goalStats?.completedGoals ?? 0}</p>
          <p className="text-xs text-muted-foreground">goals achieved</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-card-hover p-1">
        <button
          onClick={() => setActiveTab('habits')}
          className={cn(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'habits'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Flame className="mr-2 inline h-4 w-4" />
          Today's Habits
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={cn(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'goals'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Target className="mr-2 inline h-4 w-4" />
          Goals
        </button>
      </div>

      {/* Content */}
      {activeTab === 'habits' ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Today — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            {totalToday > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-success transition-all"
                    style={{ width: `${todayProgress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{todayProgress}%</span>
              </div>
            )}
          </div>

          {todayLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-card-hover animate-pulse" />
              ))}
            </div>
          ) : (
            <HabitChecklist
              habits={todayHabits}
              onToggle={handleToggleHabit}
              onEdit={(habit) => { setEditingHabit(habit); setHabitDialogOpen(true); }}
              onDelete={(id) => setDeleteHabitId(id)}
            />
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <GoalFiltersBar filters={goalFilters} onChange={setGoalFilters} />
          </div>

          {goalsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[180px] rounded-lg border border-border bg-card animate-pulse" />
              ))}
            </div>
          ) : goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
              <Target className="h-10 w-10 text-muted" />
              <p className="mt-3 text-sm text-muted-foreground">No goals found</p>
              <p className="mt-1 text-xs text-muted">Create your first goal to start tracking progress</p>
              <button
                onClick={() => setGoalDialogOpen(true)}
                className="mt-4 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Goal
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal, i) => (
                  <div key={goal.id} className="animate-card-in" style={{ '--i': i } as React.CSSProperties}>
                    <GoalCard goal={goal} onClick={handleCardClick} />
                  </div>
                ))}
              </div>

              {goalMeta && goalMeta.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {goalMeta.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(goalMeta.totalPages, p + 1))}
                    disabled={page === goalMeta.totalPages}
                    className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <GoalDialog
        open={goalDialogOpen}
        onClose={() => setGoalDialogOpen(false)}
        onSubmit={handleGoalSubmit}
      />

      <HabitDialog
        open={habitDialogOpen}
        onClose={() => { setHabitDialogOpen(false); setEditingHabit(null); }}
        onSubmit={handleHabitSubmit}
        initialData={editingHabit ? {
          id: editingHabit.id,
          name: editingHabit.name,
          description: editingHabit.description,
          frequency: editingHabit.frequency,
          targetDays: editingHabit.targetDays,
          targetCount: editingHabit.targetCount,
          unit: editingHabit.unit,
          category: editingHabit.category,
          color: editingHabit.color,
        } : undefined}
      />

      <ConfirmDialog
        open={deleteHabitId !== null}
        title="Delete Habit"
        description="This habit and all its logs will be permanently deleted."
        variant="danger"
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteHabitId) deleteHabit.mutate(deleteHabitId);
          setDeleteHabitId(null);
        }}
        onCancel={() => setDeleteHabitId(null)}
      />
    </div>
  );
}
