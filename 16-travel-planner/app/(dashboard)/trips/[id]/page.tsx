// app/(dashboard)/trips/[id]/page.tsx
'use client'

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, formatCurrency, formatTime } from '@/lib/utils/format';
import type { Trip, Itinerary, Expense } from '@/lib/db/schema';

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TripDetailPage({ params }: TripDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState<{
    name: string;
    destination: string;
    country: string;
    startDate: string;
    endDate: string;
    budget: string;
    travelers: string;
    tripType: 'vacation' | 'business' | 'adventure' | 'backpacking';
    status: 'planning' | 'ongoing' | 'completed';
  }>({
    name: '',
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: '1',
    tripType: 'vacation',
    status: 'planning',
  });

  useEffect(() => {
    fetchTripDetails();
  }, [resolvedParams.id]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);

      // Fetch trip details
      const tripResponse = await fetch(`/api/trips/${resolvedParams.id}`);
      if (!tripResponse.ok) throw new Error('Failed to fetch trip');
      const tripResult = await tripResponse.json();
      setTrip(tripResult.data);

      // Fetch itineraries
      const itineraryResponse = await fetch(`/api/itineraries?tripId=${resolvedParams.id}`);
      if (itineraryResponse.ok) {
        const itineraryResult = await itineraryResponse.json();
        setItineraries(itineraryResult.data || []);
      }

      // Fetch expenses
      const expenseResponse = await fetch(`/api/expenses?tripId=${resolvedParams.id}`);
      if (expenseResponse.ok) {
        const expenseResult = await expenseResponse.json();
        setExpenses(expenseResult.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = () => {
    if (!trip) return;

    // 기존 데이터로 폼 채우기
    setEditFormData({
      name: trip.name,
      destination: trip.destination,
      country: trip.country,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budget,
      travelers: trip.travelers.toString(),
      tripType: trip.tripType,
      status: trip.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trip || !editFormData.name || !editFormData.destination || !editFormData.country ||
        !editFormData.startDate || !editFormData.endDate || !editFormData.budget) {
      alert('모든 필수 항목을 입력해주세요');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: trip.userId,
          name: editFormData.name,
          destination: editFormData.destination,
          country: editFormData.country,
          startDate: editFormData.startDate,
          endDate: editFormData.endDate,
          budget: parseFloat(editFormData.budget),
          travelers: parseInt(editFormData.travelers),
          tripType: editFormData.tripType,
          status: editFormData.status,
          version: trip.version, // Optimistic locking
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update trip');
      }

      // 성공: 데이터 새로고침
      await fetchTripDetails();
      setIsEditDialogOpen(false);
      alert('여행이 성공적으로 수정되었습니다!');
    } catch (err) {
      alert(err instanceof Error ? err.message : '여행 수정 중 오류가 발생했습니다');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning':
        return '계획 중';
      case 'ongoing':
        return '진행 중';
      case 'completed':
        return '완료';
      default:
        return status;
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return priority;
    }
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const budget = trip ? parseFloat(trip.budget) : 0;
  const remaining = budget - totalSpent;
  const budgetUsagePercent = budget > 0 ? (totalSpent / budget) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">여행 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">오류: {error || '여행을 찾을 수 없습니다'}</p>
          <Button onClick={() => router.push('/trips')} className="mt-4">
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-gray-900">{trip.name}</h2>
            <Badge className={getStatusColor(trip.status)}>
              {getStatusLabel(trip.status)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {trip.destination}, {trip.country}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/trips')}
          >
            ← 목록으로
          </Button>
          <Button
            variant="outline"
            onClick={handleOpenEditDialog}
          >
            ✏️ 수정
          </Button>
          <Button
            variant="destructive"
            onClick={() => alert('여행 삭제 기능은 곧 구현됩니다!')}
          >
            🗑️ 삭제
          </Button>
        </div>
      </div>

      {/* Trip Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>여행 기간</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="font-semibold">{formatDate(new Date(trip.startDate))}</div>
              <div className="text-gray-500">~</div>
              <div className="font-semibold">{formatDate(new Date(trip.endDate))}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>예산</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(budget)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>실제 지출</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {budgetUsagePercent.toFixed(1)}% 사용
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>남은 예산</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(remaining)}
            </div>
            {remaining < 0 && (
              <p className="text-xs text-red-500 mt-1">예산 초과!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
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

      {/* Itineraries */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>일정 ({itineraries.length})</CardTitle>
            <Button
              size="sm"
              onClick={() => router.push(`/itinerary?tripId=${trip.id}`)}
            >
              전체 일정 보기
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {itineraries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>아직 일정이 없습니다</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push(`/itinerary?tripId=${trip.id}`)}
              >
                일정 추가하기
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {itineraries.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.activity}</span>
                      <Badge className={getPriorityColor(item.priority)}>
                        {getPriorityLabel(item.priority)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(new Date(item.date))} · {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </p>
                  </div>
                  {item.completed && (
                    <Badge className="bg-green-100 text-green-800">완료</Badge>
                  )}
                </div>
              ))}
              {itineraries.length > 5 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  외 {itineraries.length - 5}개 일정
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>최근 지출 ({expenses.length})</CardTitle>
            <Button
              size="sm"
              onClick={() => router.push(`/budget?tripId=${trip.id}`)}
            >
              전체 지출 보기
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>아직 지출 내역이 없습니다</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push(`/budget?tripId=${trip.id}`)}
              >
                지출 추가하기
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((expense) => (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-gray-500">
                        {getCategoryLabel(expense.category)} · {formatDate(new Date(expense.date))}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(expense.amount))}
                    </span>
                  </div>
                ))}
              {expenses.length > 5 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  외 {expenses.length - 5}개 지출
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>여행 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTrip} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">여행명 *</Label>
                <Input
                  id="edit-name"
                  placeholder="예: 도쿄 여행"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-destination">목적지 *</Label>
                <Input
                  id="edit-destination"
                  placeholder="예: 도쿄"
                  value={editFormData.destination}
                  onChange={(e) => setEditFormData({ ...editFormData, destination: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-country">국가 *</Label>
                <Input
                  id="edit-country"
                  placeholder="예: 일본"
                  value={editFormData.country}
                  onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-travelers">여행자 수 *</Label>
                <Input
                  id="edit-travelers"
                  type="number"
                  min="1"
                  value={editFormData.travelers}
                  onChange={(e) => setEditFormData({ ...editFormData, travelers: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">시작일 *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">종료일 *</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-budget">예산 (₩) *</Label>
                <Input
                  id="edit-budget"
                  type="number"
                  min="0"
                  placeholder="예: 2000000"
                  value={editFormData.budget}
                  onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">상태</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value as any })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">계획 중</SelectItem>
                    <SelectItem value="ongoing">진행 중</SelectItem>
                    <SelectItem value="completed">완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
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
    </div>
  );
}
