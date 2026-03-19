// app/(dashboard)/insights/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Trip } from '@/lib/db/schema';
import type { InsightsResponse } from '@/lib/ai/services/analyzeTravelInsights';

export default function InsightsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

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
    }
  };

  const handleAnalyzeInsights = async () => {
    if (!selectedTripId) return;

    const selectedTrip = trips.find((t) => t.id === selectedTripId);
    if (!selectedTrip) return;

    setLoading(true);
    setError(null);

    try {
      // Calculate trip duration
      const start = new Date(selectedTrip.startDate);
      const end = new Date(selectedTrip.endDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const response = await fetch('/api/ai/analyze-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: selectedTrip.id,
          tripName: selectedTrip.name,
          destination: selectedTrip.destination,
          country: selectedTrip.country,
          startDate: selectedTrip.startDate,
          endDate: selectedTrip.endDate,
          duration,
          status: selectedTrip.status,
          budget: parseFloat(selectedTrip.budget),
          actualSpent: 0, // Would be calculated from expenses
          travelers: selectedTrip.travelers,
          tripType: selectedTrip.tripType,
          itinerariesCount: 0, // Would be fetched from API
          completedItineraries: 0,
          expensesCount: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze insights');
      }

      const data = await response.json();
      setInsights(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string): string => {
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

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  if (trips.length === 0) {
    return (
      <Card className="py-12">
        <CardContent className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            여행을 먼저 만들어주세요
          </h3>
          <p className="text-gray-500 mb-6">
            인사이트를 분석하려면 먼저 여행을 만들어야 합니다
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
      <div>
        <h2 className="text-3xl font-bold text-gray-900">AI 여행 인사이트</h2>
        <p className="mt-1 text-sm text-gray-500">
          AI가 여행 데이터를 분석하여 인사이트를 제공합니다
        </p>
      </div>

      {/* Trip Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {trips.map((trip) => (
          <Button
            key={trip.id}
            variant={selectedTripId === trip.id ? 'default' : 'outline'}
            onClick={() => {
              setSelectedTripId(trip.id);
              setInsights(null);
            }}
            className="whitespace-nowrap"
          >
            {trip.name}
          </Button>
        ))}
      </div>

      {/* Analyze Button */}
      <Card>
        <CardContent className="py-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">
                {selectedTrip?.name} 분석하기
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedTrip?.destination}, {selectedTrip?.country}
              </p>
            </div>
            <Button
              onClick={handleAnalyzeInsights}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  AI 분석 중... (5-10초)
                </>
              ) : (
                '📊 AI 인사이트 분석'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-red-600">오류: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle>종합 점수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="text-6xl font-bold text-blue-600">
                  {insights.overallScore}
                </div>
                <div className="text-2xl text-gray-400 ml-2">/100</div>
              </div>
              <p className="text-center text-gray-600 mt-4">{insights.summary}</p>
            </CardContent>
          </Card>

          {/* Highlights and Concerns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ✅ 잘한 점
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">•</span>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚠️ 개선할 점
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.concerns.map((concern, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-600 mr-2 mt-1">•</span>
                      <span className="text-gray-700">{concern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Budget Insights */}
          <Card>
            <CardHeader>
              <CardTitle>💰 예산 인사이트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">예산 효율성:</span>
                  <Badge
                    className={
                      insights.budgetInsights.efficiency === 'good'
                        ? 'bg-green-100 text-green-800'
                        : insights.budgetInsights.efficiency === 'average'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {insights.budgetInsights.efficiency === 'good'
                      ? '우수'
                      : insights.budgetInsights.efficiency === 'average'
                      ? '보통'
                      : '개선 필요'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {insights.budgetInsights.comparison}
                </p>

                {insights.budgetInsights.savingsOpportunities.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">절약 기회:</h4>
                    <div className="space-y-2">
                      {insights.budgetInsights.savingsOpportunities.map(
                        (opportunity, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{opportunity.category}</span>
                              <span className="text-green-600 font-semibold">
                                -{opportunity.potentialSavings.toLocaleString()}원
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {opportunity.suggestion}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Travel Style */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 여행 스타일</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">여행 페이스:</span>
                  <Badge>
                    {insights.travelStyle.pace === 'fast'
                      ? '빠름'
                      : insights.travelStyle.pace === 'moderate'
                      ? '보통'
                      : '느림'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">예산 수준:</span>
                  <Badge>
                    {insights.travelStyle.budgetLevel === 'budget'
                      ? '가성비'
                      : insights.travelStyle.budgetLevel === 'mid-range'
                      ? '중간'
                      : '럭셔리'}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-700">선호 카테고리:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {insights.travelStyle.preferences.map((pref, index) => (
                      <Badge key={index} variant="outline">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>💡 개선 추천사항</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.recommendations.map((rec, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{rec.category}</span>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority === 'high'
                              ? '높음'
                              : rec.priority === 'medium'
                              ? '보통'
                              : '낮음'}
                          </Badge>
                        </div>
                        <p className="text-gray-700">{rec.suggestion}</p>
                        <p className="text-sm text-green-600 mt-1">
                          ✓ {rec.expectedBenefit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Trip Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>🗺️ 다음 여행 제안</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">추천 목적지:</h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.nextTripSuggestions.similarDestinations.map(
                      (dest, index) => (
                        <Badge key={index} variant="outline" className="text-base py-1 px-3">
                          {dest}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span className="text-gray-700">예상 예산:</span>
                  <span className="font-semibold text-blue-600">
                    {insights.nextTripSuggestions.budgetEstimate.toLocaleString()}원
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-gray-700">최적 방문 시기:</span>
                  <p className="font-medium mt-1">
                    {insights.nextTripSuggestions.bestTimeToVisit}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">여행 팁:</h4>
                  <ul className="space-y-1">
                    {insights.nextTripSuggestions.tips.map((tip, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <span className="mr-2">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!loading && !insights && (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI 인사이트를 받아보세요
            </h3>
            <p className="text-gray-500">
              여행을 선택하고 AI 인사이트 분석 버튼을 클릭하세요
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
