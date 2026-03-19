// app/(dashboard)/budget/page.tsx
'use client'

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { BudgetChart } from '@/components/budget/BudgetChart';
import type { Trip, Expense } from '@/lib/db/schema';
import type { BudgetResponse } from '@/lib/ai/services/optimizeBudget';

interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  categoryBreakdown: Record<string, number>;
}

function BudgetContent() {
  const searchParams = useSearchParams();
  const tripIdFromUrl = searchParams.get('tripId');

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // AI Optimization states
  const [isAIOptimizing, setIsAIOptimizing] = useState(false);
  const [isAIResultDialogOpen, setIsAIResultDialogOpen] = useState(false);
  const [aiOptimizationResult, setAIOptimizationResult] = useState<BudgetResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    date: string;
    category: 'transport' | 'accommodation' | 'food' | 'activity' | 'shopping' | 'other';
    amount: string;
    description: string;
    notes: string;
  }>({
    date: '',
    category: 'food',
    amount: '',
    description: '',
    notes: '',
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchExpenses(selectedTripId);
    }
  }, [selectedTripId]);

  // URL에서 tripId가 있으면 해당 여행 선택
  useEffect(() => {
    if (tripIdFromUrl && trips.length > 0) {
      const tripExists = trips.find((t) => t.id === tripIdFromUrl);
      if (tripExists) {
        setSelectedTripId(tripIdFromUrl);
      }
    }
  }, [tripIdFromUrl, trips]);

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips');
      if (!response.ok) throw new Error('Failed to fetch trips');
      const result = await response.json();
      const trips = result.data || [];
      setTrips(trips);
      if (trips.length > 0 && !selectedTripId) {
        setSelectedTripId(trips[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async (tripId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/expenses?tripId=${tripId}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const result = await response.json();
      setExpenses(result.data || []);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId || !formData.date || !formData.amount || !formData.description) {
      alert('모든 필수 항목을 입력해주세요');
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: selectedTripId,
          date: formData.date,
          category: formData.category,
          amount: formData.amount,
          description: formData.description,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create expense');
      }

      await fetchExpenses(selectedTripId);
      setFormData({
        date: '',
        category: 'food',
        amount: '',
        description: '',
        notes: '',
      });
      setIsCreateDialogOpen(false);
      alert('지출이 성공적으로 추가되었습니다!');
    } catch (err) {
      alert(err instanceof Error ? err.message : '지출 추가 중 오류가 발생했습니다');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      date: expense.date,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      notes: expense.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !formData.date || !formData.amount || !formData.description) {
      alert('모든 필수 항목을 입력해주세요');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          category: formData.category,
          amount: formData.amount,
          description: formData.description,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update expense');
      }

      if (selectedTripId) {
        await fetchExpenses(selectedTripId);
      }
      setIsEditDialogOpen(false);
      setEditingExpense(null);
      alert('지출이 성공적으로 수정되었습니다!');
    } catch (err) {
      alert(err instanceof Error ? err.message : '지출 수정 중 오류가 발생했습니다');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('정말 이 지출을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete expense');
      }

      if (selectedTripId) {
        await fetchExpenses(selectedTripId);
      }
      alert('지출이 삭제되었습니다');
    } catch (err) {
      alert(err instanceof Error ? err.message : '지출 삭제 중 오류가 발생했습니다');
    }
  };

  const handleAIOptimize = async () => {
    if (!selectedTrip || !selectedTripId) {
      alert('여행을 먼저 선택해주세요');
      return;
    }

    try {
      setIsAIOptimizing(true);

      // 여행 기간 계산
      const duration = Math.ceil(
        (new Date(selectedTrip.endDate).getTime() -
          new Date(selectedTrip.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

      // 지출 데이터를 API 형식에 맞게 변환
      const expensesData = expenses.map((exp) => ({
        category: exp.category === 'activity' ? 'activities' : exp.category,
        amount: parseFloat(exp.amount),
        description: exp.description,
        date: exp.date,
      }));

      // AI API 호출
      const response = await fetch('/api/ai/optimize-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: selectedTripId,
          destination: selectedTrip.destination,
          country: selectedTrip.country,
          duration: duration,
          totalBudget: parseFloat(selectedTrip.budget),
          actualSpent: summary.totalSpent,
          travelers: selectedTrip.travelers,
          expenses: expensesData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'AI 예산 최적화에 실패했습니다');
      }

      const result = await response.json();
      setAIOptimizationResult(result.data);
      setIsAIResultDialogOpen(true);
    } catch (err) {
      console.error('AI 예산 최적화 오류:', err);
      alert(err instanceof Error ? err.message : 'AI 예산 최적화 중 오류가 발생했습니다');
    } finally {
      setIsAIOptimizing(false);
    }
  };

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    if (categoryFilter === 'all') {
      return expenses;
    }
    return expenses.filter((exp) => exp.category === categoryFilter);
  }, [expenses, categoryFilter]);

  const calculateBudgetSummary = (): BudgetSummary => {
    const selectedTrip = trips.find((t) => t.id === selectedTripId);
    const totalBudget = selectedTrip ? parseFloat(selectedTrip.budget) : 0;
    const totalSpent = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const remaining = totalBudget - totalSpent;

    const categoryBreakdown: Record<string, number> = {};
    filteredExpenses.forEach((exp) => {
      categoryBreakdown[exp.category] =
        (categoryBreakdown[exp.category] || 0) + parseFloat(exp.amount);
    });

    return {
      totalBudget,
      totalSpent,
      remaining,
      categoryBreakdown,
    };
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      transport: '교통',
      accommodation: '숙박',
      food: '식비',
      activity: '액티비티',
      shopping: '쇼핑',
      other: '기타',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      transport: '#0088FE',
      accommodation: '#00C49F',
      food: '#FFBB28',
      activity: '#FF8042',
      shopping: '#8884d8',
      other: '#82ca9d',
    };
    return colors[category] || '#999999';
  };

  const selectedTrip = trips.find((t) => t.id === selectedTripId);
  const summary = calculateBudgetSummary();
  const budgetUsagePercent = summary.totalBudget > 0
    ? (summary.totalSpent / summary.totalBudget) * 100
    : 0;

  const chartData = Object.entries(summary.categoryBreakdown).map(
    ([category, amount]) => ({
      category: getCategoryLabel(category),
      amount,
      color: getCategoryColor(category),
    })
  );

  if (loading && trips.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">예산 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <Card className="py-12">
        <CardContent className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            여행을 먼저 만들어주세요
          </h3>
          <p className="text-gray-500 mb-6">
            예산을 관리하려면 먼저 여행을 만들어야 합니다
          </p>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => alert('여행 만들기는 여행 목록 탭에서 가능합니다!')}
          >
            여행 만들기
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">예산 관리</h2>
          {selectedTrip && (
            <p className="mt-1 text-sm text-gray-500">
              {selectedTrip.name} - {selectedTrip.destination}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleAIOptimize}
            disabled={isAIOptimizing || !selectedTripId || expenses.length === 0}
          >
            {isAIOptimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                AI 분석 중... (5-10초)
              </>
            ) : (
              '✨ AI 예산 최적화'
            )}
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={!selectedTripId}
          >
            + 지출 추가
          </Button>
        </div>
      </div>

      {/* Trip Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {trips.map((trip) => (
          <Button
            key={trip.id}
            variant={selectedTripId === trip.id ? 'default' : 'outline'}
            onClick={() => setSelectedTripId(trip.id)}
            className="whitespace-nowrap"
          >
            {trip.name}
          </Button>
        ))}
      </div>

      {/* Category Filter */}
      {expenses.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 필터
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="transport">교통</SelectItem>
                    <SelectItem value="accommodation">숙박</SelectItem>
                    <SelectItem value="food">식비</SelectItem>
                    <SelectItem value="activity">액티비티</SelectItem>
                    <SelectItem value="shopping">쇼핑</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  {filteredExpenses.length}개의 지출 표시 중
                  {categoryFilter !== 'all' && ` (${getCategoryLabel(categoryFilter)})`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardDescription>총 예산</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(summary.totalBudget)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>실제 지출</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {formatCurrency(summary.totalSpent)}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {budgetUsagePercent.toFixed(1)}% 사용
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>남은 예산</CardDescription>
            <CardTitle
              className={`text-3xl ${
                summary.remaining >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(summary.remaining)}
            </CardTitle>
            {summary.remaining < 0 && (
              <p className="text-sm text-red-500 mt-1">예산 초과!</p>
            )}
          </CardHeader>
        </Card>
      </div>

      {/* Budget Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>예산 사용률</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all ${
                budgetUsagePercent > 100
                  ? 'bg-red-600'
                  : budgetUsagePercent > 80
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {budgetUsagePercent.toFixed(1)}% 사용 중
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      {expenses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>카테고리별 지출</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetChart data={chartData} />
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>카테고리 상세</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(summary.categoryBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const percent =
                      summary.totalSpent > 0
                        ? (amount / summary.totalSpent) * 100
                        : 0;
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">
                            {getCategoryLabel(category)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatCurrency(amount)} ({percent.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: getCategoryColor(category),
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              아직 지출 내역이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              지출을 기록하여 예산을 관리하세요
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              첫 지출 추가하기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Expenses */}
      {filteredExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {categoryFilter === 'all' ? '최근 지출 내역' : `${getCategoryLabel(categoryFilter)} 지출 내역`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredExpenses
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .slice(0, 10)
                .map((expense) => (
                  <div
                    key={expense.id}
                    className="py-3 border-b last:border-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-500">
                          {getCategoryLabel(expense.category)} · {formatDate(new Date(expense.date))}
                        </p>
                        {expense.notes && (
                          <p className="text-sm text-gray-600 mt-1">{expense.notes}</p>
                        )}
                      </div>
                      <span className="font-semibold text-lg">
                        {formatCurrency(parseFloat(expense.amount))}
                      </span>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditDialog(expense)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>지출 추가</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateExpense} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-date">날짜 *</Label>
                <Input
                  id="create-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-category">카테고리 *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: 'transport' | 'accommodation' | 'food' | 'activity' | 'shopping' | 'other') =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger id="create-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transport">교통</SelectItem>
                    <SelectItem value="accommodation">숙박</SelectItem>
                    <SelectItem value="food">식비</SelectItem>
                    <SelectItem value="activity">액티비티</SelectItem>
                    <SelectItem value="shopping">쇼핑</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-amount">금액 *</Label>
              <Input
                id="create-amount"
                type="number"
                placeholder="예: 50000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">내역 *</Label>
              <Input
                id="create-description"
                placeholder="예: 점심 식사"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-notes">메모</Label>
              <Textarea
                id="create-notes"
                placeholder="추가 메모사항을 입력하세요..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isCreating}
              >
                {isCreating ? '추가 중...' : '추가'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>지출 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateExpense} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">날짜 *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">카테고리 *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: 'transport' | 'accommodation' | 'food' | 'activity' | 'shopping' | 'other') =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transport">교통</SelectItem>
                    <SelectItem value="accommodation">숙박</SelectItem>
                    <SelectItem value="food">식비</SelectItem>
                    <SelectItem value="activity">액티비티</SelectItem>
                    <SelectItem value="shopping">쇼핑</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amount">금액 *</Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="예: 50000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">내역 *</Label>
              <Input
                id="edit-description"
                placeholder="예: 점심 식사"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">메모</Label>
              <Textarea
                id="edit-notes"
                placeholder="추가 메모사항을 입력하세요..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isUpdating}
              >
                {isUpdating ? '수정 중...' : '수정 완료'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Optimization Result Dialog */}
      <Dialog open={isAIResultDialogOpen} onOpenChange={setIsAIResultDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>✨ AI 예산 최적화 분석 결과</DialogTitle>
          </DialogHeader>

          {aiOptimizationResult && (
            <div className="space-y-6">
              {/* Overall Analysis */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle>전체 분석</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">전체 상태</p>
                      <p className="font-semibold text-lg">
                        {aiOptimizationResult.analysis.overallStatus === 'on_track'
                          ? '✅ 정상'
                          : aiOptimizationResult.analysis.overallStatus === 'over_budget'
                          ? '⚠️ 초과'
                          : '💰 여유'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">지출율</p>
                      <p className="font-semibold text-lg">
                        {aiOptimizationResult.analysis.spendingRate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">예상 총지출</p>
                      <p className="font-semibold text-lg">
                        {formatCurrency(aiOptimizationResult.analysis.projectedTotal)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">위험 수준</p>
                      <p className="font-semibold text-lg">
                        {aiOptimizationResult.analysis.riskLevel === 'low'
                          ? '🟢 낮음'
                          : aiOptimizationResult.analysis.riskLevel === 'medium'
                          ? '🟡 보통'
                          : '🔴 높음'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Analysis */}
              <div>
                <h3 className="font-semibold text-lg mb-3">카테고리별 분석</h3>
                <div className="space-y-3">
                  {aiOptimizationResult.categoryAnalysis.map((cat, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{cat.category}</h4>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  cat.status === 'on_track'
                                    ? 'bg-green-100 text-green-800'
                                    : cat.status === 'over_budget'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {cat.status === 'on_track'
                                  ? '정상'
                                  : cat.status === 'over_budget'
                                  ? '초과'
                                  : '여유'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{cat.recommendation}</p>
                            <div className="flex gap-4 text-sm">
                              <span>
                                사용: <strong>{formatCurrency(cat.spent)}</strong>
                              </span>
                              <span>
                                예산: <strong>{formatCurrency(cat.budgeted)}</strong>
                              </span>
                              <span>
                                남음: <strong>{formatCurrency(cat.remaining)}</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold text-lg mb-3">💡 추천사항</h3>
                <div className="space-y-3">
                  {aiOptimizationResult.recommendations.map((rec, idx) => (
                    <Card
                      key={idx}
                      className={`border-l-4 ${
                        rec.priority === 'high'
                          ? 'border-red-500'
                          : rec.priority === 'medium'
                          ? 'border-yellow-500'
                          : 'border-blue-500'
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{rec.category}</span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  rec.priority === 'high'
                                    ? 'bg-red-100 text-red-800'
                                    : rec.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {rec.priority === 'high' ? '높음' : rec.priority === 'medium' ? '보통' : '낮음'}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded bg-gray-100 text-gray-800`}
                              >
                                난이도: {rec.difficulty === 'easy' ? '쉬움' : rec.difficulty === 'medium' ? '보통' : '어려움'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{rec.action}</p>
                            <p className="text-sm text-green-600">
                              💰 예상 절감: {formatCurrency(rec.expectedSavings)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Optimized Budget */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle>최적화된 예산 배분</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">교통</p>
                      <p className="font-semibold">{formatCurrency(aiOptimizationResult.optimizedBudget.transport)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">숙박</p>
                      <p className="font-semibold">{formatCurrency(aiOptimizationResult.optimizedBudget.accommodation)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">식비</p>
                      <p className="font-semibold">{formatCurrency(aiOptimizationResult.optimizedBudget.food)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">액티비티</p>
                      <p className="font-semibold">{formatCurrency(aiOptimizationResult.optimizedBudget.activities)}</p>
                    </div>
                    {aiOptimizationResult.optimizedBudget.shopping && (
                      <div>
                        <p className="text-sm text-gray-600">쇼핑</p>
                        <p className="font-semibold">{formatCurrency(aiOptimizationResult.optimizedBudget.shopping)}</p>
                      </div>
                    )}
                    {aiOptimizationResult.optimizedBudget.emergency && (
                      <div>
                        <p className="text-sm text-gray-600">비상금</p>
                        <p className="font-semibold">{formatCurrency(aiOptimizationResult.optimizedBudget.emergency)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>💡 실용 팁</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {aiOptimizationResult.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setIsAIResultDialogOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  확인
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BudgetPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">예산 정보를 불러오는 중...</p>
        </div>
      </div>
    }>
      <BudgetContent />
    </Suspense>
  );
}
