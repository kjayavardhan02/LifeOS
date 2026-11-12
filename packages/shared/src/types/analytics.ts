export interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  overdueTasks: number;
  avgCompletionDays: number | null;
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  tasksByCategory: { category: string; count: number }[];
  completionTrend: { date: string; completed: number; created: number }[];
}

export interface FinanceStats {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  totalSubscriptionCost: number;
  expenseByCategory: { category: string; amount: number }[];
  incomeByCategory: { category: string; amount: number }[];
  dailySpending: { date: string; amount: number }[];
  monthlyTrend: { month: string; income: number; expense: number; savings: number }[];
}

export interface AnalyticsHabitStats {
  totalHabits: number;
  activeHabits: number;
  avgCompletionRate: number;
  longestStreak: number;
  habitPerformance: {
    id: string;
    name: string;
    color: string;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
    totalLogs: number;
  }[];
  weeklyHeatmap: { date: string; count: number }[];
}

export interface AnalyticsGoalStats {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  avgProgress: number;
  goalsByStatus: { status: string; count: number }[];
  goalsByType: { type: string; count: number }[];
}

export interface AnalyticsQuery {
  period?: 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
}
