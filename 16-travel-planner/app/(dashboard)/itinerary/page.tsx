// app/(dashboard)/itinerary/page.tsx
'use client'

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils/format';
import type { Itinerary, Trip } from '@/lib/db/schema';
import type { OptimizationResponse } from '@/lib/ai/services/optimizeItinerary';

interface GroupedItinerary {
  date: string;
  items: Itinerary[];
}

function ItineraryContent() {
  const searchParams = useSearchParams();
  const tripIdFromUrl = searchParams.get('tripId');

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null);

  // AI Optimization states
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimizationResultDialogOpen, setIsOptimizationResultDialogOpen] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    date: string;
    startTime: string;
    endTime: string;
    activity: string;
    notes: string;
    priority: 'high' | 'medium' | 'low';
  }>({
    date: '',
    startTime: '',
    endTime: '',
    activity: '',
    notes: '',
    priority: 'medium',
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchItineraries(selectedTripId);
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

  const fetchItineraries = async (tripId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/itineraries?tripId=${tripId}`);
      if (!response.ok) throw new Error('Failed to fetch itineraries');
      const result = await response.json();
      setItineraries(result.data || []);
    } catch (err) {
      console.error('Failed to fetch itineraries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId || !formData.date || !formData.startTime || !formData.endTime || !formData.activity) {
      alert('모든 필수 항목을 입력해주세요');
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: selectedTripId,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          activity: formData.activity,
          notes: formData.notes || null,
          priority: formData.priority,
          completed: false,
          order: 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create itinerary');
      }

      await fetchItineraries(selectedTripId);
      setFormData({
        date: '',
        startTime: '',
        endTime: '',
        activity: '',
        notes: '',
        priority: 'medium',
      });
      setIsCreateDialogOpen(false);
      alert('일정이 성공적으로 추가되었습니다!');
    } catch (err) {
      alert(err instanceof Error ? err.message : '일정 추가 중 오류가 발생했습니다');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEditDialog = (itinerary: Itinerary) => {
    setEditingItinerary(itinerary);
    setFormData({
      date: itinerary.date,
      startTime: itinerary.startTime,
      endTime: itinerary.endTime,
      activity: itinerary.activity,
      notes: itinerary.notes || '',
      priority: itinerary.priority,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItinerary || !formData.date || !formData.startTime || !formData.endTime || !formData.activity) {
      alert('모든 필수 항목을 입력해주세요');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/itineraries/${editingItinerary.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          activity: formData.activity,
          notes: formData.notes || null,
          priority: formData.priority,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update itinerary');
      }

      if (selectedTripId) {
        await fetchItineraries(selectedTripId);
      }
      setIsEditDialogOpen(false);
      setEditingItinerary(null);
      alert('일정이 성공적으로 수정되었습니다!');
    } catch (err) {
      alert(err instanceof Error ? err.message : '일정 수정 중 오류가 발생했습니다');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteItinerary = async (id: string) => {
    if (!confirm('정말 이 일정을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/itineraries/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete itinerary');
      }

      if (selectedTripId) {
        await fetchItineraries(selectedTripId);
      }
      alert('일정이 삭제되었습니다');
    } catch (err) {
      alert(err instanceof Error ? err.message : '일정 삭제 중 오류가 발생했습니다');
    }
  };

  const handleToggleCompleted = async (itinerary: Itinerary) => {
    try {
      const response = await fetch(`/api/itineraries/${itinerary.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: !itinerary.completed,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update itinerary');
      }

      if (selectedTripId) {
        await fetchItineraries(selectedTripId);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '일정 상태 변경 중 오류가 발생했습니다');
    }
  };

  const handleGenerateAIItinerary = async () => {
    if (!selectedTrip || !selectedTripId) {
      alert('여행을 먼저 선택해주세요');
      return;
    }

    try {
      setIsGeneratingAI(true);
      setIsAIDialogOpen(false);

      // AI API 호출
      const response = await fetch('/api/ai/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: selectedTrip.destination,
          country: selectedTrip.country,
          startDate: selectedTrip.startDate,
          endDate: selectedTrip.endDate,
          budget: parseFloat(selectedTrip.budget),
          travelers: selectedTrip.travelers,
          tripType: selectedTrip.tripType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'AI 일정 생성에 실패했습니다');
      }

      const result = await response.json();
      const aiData = result.data;

      // 생성된 일정을 DB에 저장
      let savedCount = 0;
      for (const dailyPlan of aiData.dailyPlans) {
        for (const activity of dailyPlan.activities) {
          try {
            // startTime과 duration을 사용해서 endTime 계산
            const [hours, minutes] = activity.time.split(':').map(Number);
            const startMinutes = hours * 60 + minutes;
            const endMinutes = startMinutes + (activity.duration || 60); // duration이 없으면 기본 60분
            const endHours = Math.floor(endMinutes / 60) % 24;
            const endMins = endMinutes % 60;
            const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

            const createResponse = await fetch('/api/itineraries', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tripId: selectedTripId,
                date: dailyPlan.date,
                startTime: activity.time,
                endTime: endTime,
                activity: activity.activity,
                notes: `${activity.location}${activity.notes ? ' - ' + activity.notes : ''}`,
                priority: activity.priority,
                completed: false,
                order: 0,
              }),
            });

            if (createResponse.ok) {
              savedCount++;
            } else {
              const errorData = await createResponse.json();
              console.error('일정 저장 실패:', errorData);
            }
          } catch (err) {
            console.error('일정 저장 오류:', err);
          }
        }
      }

      // 일정 새로고침
      await fetchItineraries(selectedTripId);

      alert(`AI가 ${savedCount}개의 일정을 생성했습니다!\n\n💡 팁:\n${aiData.tips.slice(0, 3).join('\n')}`);
    } catch (err) {
      console.error('AI 일정 생성 오류:', err);
      alert(err instanceof Error ? err.message : 'AI 일정 생성 중 오류가 발생했습니다');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleOptimizeSchedule = async () => {
    if (!selectedTrip || !selectedTripId || itineraries.length === 0) {
      alert('일정을 먼저 추가해주세요');
      return;
    }

    try {
      setIsOptimizing(true);

      // 일정 데이터 준비
      const itineraryData = itineraries.map((item) => ({
        id: item.id,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        activity: item.activity,
        notes: item.notes || '',
        priority: item.priority,
        completed: item.completed,
      }));

      // AI API 호출
      const response = await fetch('/api/ai/optimize-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: selectedTripId,
          destination: selectedTrip.destination,
          country: selectedTrip.country,
          startDate: selectedTrip.startDate,
          endDate: selectedTrip.endDate,
          itineraries: itineraryData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'AI 일정 최적화에 실패했습니다');
      }

      const result = await response.json();
      setOptimizationResult(result.data);
      setIsOptimizationResultDialogOpen(true);
    } catch (err) {
      console.error('AI 일정 최적화 오류:', err);
      alert(err instanceof Error ? err.message : 'AI 일정 최적화 중 오류가 발생했습니다');
    } finally {
      setIsOptimizing(false);
    }
  };

  const groupByDate = (items: Itinerary[]): GroupedItinerary[] => {
    const groups: Record<string, Itinerary[]> = {};
    items.forEach((item) => {
      const date = new Date(item.date).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });

    return Object.entries(groups)
      .map(([date, items]) => ({
        date,
        items: items.sort((a, b) => a.startTime.localeCompare(b.startTime)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
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

  // Filter itineraries
  const filteredItineraries = useMemo(() => {
    let filtered = itineraries;

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((item) => item.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter === 'completed') {
      filtered = filtered.filter((item) => item.completed);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter((item) => !item.completed);
    }

    return filtered;
  }, [itineraries, priorityFilter, statusFilter]);

  const selectedTrip = trips.find((t) => t.id === selectedTripId);
  const groupedItineraries = groupByDate(filteredItineraries);

  if (loading && trips.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">일정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <Card className="py-12">
        <CardContent className="text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            여행을 먼저 만들어주세요
          </h3>
          <p className="text-gray-500 mb-6">
            일정을 관리하려면 먼저 여행을 만들어야 합니다
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
          <h2 className="text-3xl font-bold text-gray-900">여행 일정</h2>
          {selectedTrip && (
            <p className="mt-1 text-sm text-gray-500">
              {selectedTrip.name} - {selectedTrip.destination}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsAIDialogOpen(true)}
            disabled={!selectedTripId || isGeneratingAI}
          >
            {isGeneratingAI ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                AI 생성 중...
              </>
            ) : (
              <>✨ AI 일정 생성</>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleOptimizeSchedule}
            disabled={!selectedTripId || isOptimizing || itineraries.length === 0}
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                AI 분석 중... (5-10초)
              </>
            ) : (
              <>🔧 AI 일정 조정</>
            )}
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={!selectedTripId}
          >
            + 일정 추가
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

      {/* Filters */}
      {itineraries.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  우선순위
                </label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="high">높음</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="low">낮음</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  완료 상태
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="pending">예정</SelectItem>
                    <SelectItem value="completed">완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  {filteredItineraries.length}개의 일정 표시 중
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : itineraries.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              아직 일정이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              일정을 추가하거나 AI에게 일정을 생성하도록 요청하세요!
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setIsAIDialogOpen(true)}
                disabled={isGeneratingAI}
              >
                {isGeneratingAI ? 'AI 생성 중...' : '✨ AI 일정 생성'}
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                직접 추가하기
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedItineraries.map((group) => (
            <div key={group.date}>
              {/* Date Header */}
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                  {formatDate(new Date(group.date))}
                </div>
                <div className="flex-1 ml-4 border-t-2 border-gray-200"></div>
              </div>

              {/* Timeline Items */}
              <div className="space-y-4 ml-6">
                {group.items.map((item, idx) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Timeline Dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          item.completed ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                      ></div>
                      {idx < group.items.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-300 my-1"></div>
                      )}
                    </div>

                    {/* Content */}
                    <Card className="flex-1">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{item.activity}</CardTitle>
                          </div>
                          <Badge className={getPriorityColor(item.priority)}>
                            {getPriorityLabel(item.priority)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            ⏰ {formatTime(item.startTime)} - {formatTime(item.endTime)}
                          </span>
                          {item.completed && (
                            <Badge className="bg-green-100 text-green-800">완료</Badge>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 mr-auto">
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={() => handleToggleCompleted(item)}
                            />
                            <span className="text-sm text-gray-600">완료</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDialog(item)}
                          >
                            수정
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteItinerary(item.id)}
                          >
                            삭제
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>일정 추가</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateItinerary} className="space-y-4">
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
                <Label htmlFor="create-priority">우선순위</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'high' | 'medium' | 'low') =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger id="create-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">낮음</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="high">높음</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-start-time">시작 시간 *</Label>
                <Input
                  id="create-start-time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-end-time">종료 시간 *</Label>
                <Input
                  id="create-end-time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-activity">활동 *</Label>
              <Input
                id="create-activity"
                placeholder="예: 에펠탑 관광"
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
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
            <DialogTitle>일정 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateItinerary} className="space-y-4">
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
                <Label htmlFor="edit-priority">우선순위</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'high' | 'medium' | 'low') =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger id="edit-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">낮음</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="high">높음</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-time">시작 시간 *</Label>
                <Input
                  id="edit-start-time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-time">종료 시간 *</Label>
                <Input
                  id="edit-end-time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-activity">활동 *</Label>
              <Input
                id="edit-activity"
                placeholder="예: 에펠탑 관광"
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
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

      {/* AI Generation Confirmation Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>✨ AI 일정 자동 생성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              AI가 선택한 여행 정보를 바탕으로 최적의 일정을 자동으로 생성합니다.
            </p>

            {selectedTrip && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">목적지:</span>
                  <span className="font-medium">{selectedTrip.destination}, {selectedTrip.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">기간:</span>
                  <span className="font-medium">{formatDate(new Date(selectedTrip.startDate))} ~ {formatDate(new Date(selectedTrip.endDate))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">예산:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(selectedTrip.budget))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">인원:</span>
                  <span className="font-medium">{selectedTrip.travelers}명</span>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 AI 생성은 약 10-20초 소요되며, 생성된 일정은 수정 및 삭제가 가능합니다.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAIDialogOpen(false)}
              >
                취소
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleGenerateAIItinerary}
              >
                ✨ AI 일정 생성
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Optimization Result Dialog */}
      <Dialog open={isOptimizationResultDialogOpen} onOpenChange={setIsOptimizationResultDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🔧 AI 일정 최적화 분석 결과</DialogTitle>
          </DialogHeader>

          {optimizationResult && (
            <div className="space-y-6">
              {/* Summary */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-gray-700">{optimizationResult.summary}</p>
                </CardContent>
              </Card>

              {/* Conflicts */}
              {optimizationResult.analysis.conflicts.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">⚠️ 일정 충돌</h3>
                  <div className="space-y-2">
                    {optimizationResult.analysis.conflicts.map((conflict, idx) => (
                      <Card
                        key={idx}
                        className={`border-l-4 ${
                          conflict.severity === 'high'
                            ? 'border-red-500'
                            : conflict.severity === 'medium'
                            ? 'border-yellow-500'
                            : 'border-blue-500'
                        }`}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Badge
                                className={
                                  conflict.severity === 'high'
                                    ? 'bg-red-100 text-red-800'
                                    : conflict.severity === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                                }
                              >
                                {conflict.severity === 'high' ? '높음' : conflict.severity === 'medium' ? '보통' : '낮음'}
                              </Badge>
                              <p className="text-sm text-gray-700 mt-2">{conflict.issue}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                관련 일정: {conflict.itineraryIds.length}개
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Inefficiencies */}
              {optimizationResult.analysis.inefficiencies.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">📊 비효율 분석</h3>
                  <div className="space-y-2">
                    {optimizationResult.analysis.inefficiencies.map((ineff, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          <div className="flex items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{formatDate(new Date(ineff.date))}</p>
                              <p className="text-sm text-gray-700 mt-1">{ineff.issue}</p>
                              <p className="text-sm text-gray-600 mt-1">영향: {ineff.impact}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* General Suggestions */}
              {optimizationResult.analysis.suggestions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">💡 일반 제안</h3>
                  <div className="space-y-2">
                    {optimizationResult.analysis.suggestions.map((sugg, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-2">
                            <Badge
                              className={
                                sugg.priority === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : sugg.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }
                            >
                              {sugg.priority === 'high' ? '높음' : sugg.priority === 'medium' ? '보통' : '낮음'}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{sugg.type}</p>
                              <p className="text-sm text-gray-700 mt-1">{sugg.reason}</p>
                              <p className="text-sm text-green-600 mt-1">
                                ✓ {sugg.expectedImprovement}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Optimized Schedule */}
              {optimizationResult.optimizedSchedule.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">🔄 일정 변경 제안</h3>
                  <div className="space-y-2">
                    {optimizationResult.optimizedSchedule.map((item, idx) => (
                      <Card key={idx} className="bg-green-50 border-green-200">
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">
                                  {formatDate(new Date(item.suggestedDate))}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {item.suggestedStartTime} - {item.suggestedEndTime}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{item.reason}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* New Suggestions */}
              {optimizationResult.newSuggestions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">➕ 새로운 일정 제안</h3>
                  <div className="space-y-2">
                    {optimizationResult.newSuggestions.map((item, idx) => (
                      <Card key={idx} className="bg-purple-50 border-purple-200">
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{item.activity}</p>
                                <p className="text-sm text-gray-600">{item.location}</p>
                              </div>
                              <Badge
                                className={
                                  item.priority === 'high'
                                    ? 'bg-red-100 text-red-800'
                                    : item.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }
                              >
                                {item.priority === 'high' ? '높음' : item.priority === 'medium' ? '보통' : '낮음'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">{item.reason}</p>
                            <div className="flex gap-4 text-sm">
                              <span>
                                📅 {formatDate(new Date(item.date))}
                              </span>
                              <span>
                                🕐 {item.startTime} - {item.endTime}
                              </span>
                              <span>
                                💰 {formatCurrency(item.estimatedCost)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setIsOptimizationResultDialogOpen(false)}
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

export default function ItineraryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">일정을 불러오는 중...</p>
        </div>
      </div>
    }>
      <ItineraryContent />
    </Suspense>
  );
}
