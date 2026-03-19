// app/(dashboard)/recommendations/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Trip } from '@/lib/db/schema';
import type { Place } from '@/lib/ai/services/recommendPlaces';

export default function RecommendationsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('attraction');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Place[]>([]);
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

  const handleGetRecommendations = async () => {
    if (!selectedTripId) return;

    const selectedTrip = trips.find((t) => t.id === selectedTripId);
    if (!selectedTrip) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/recommend-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: selectedTrip.destination,
          country: selectedTrip.country,
          category,
          budget: parseFloat(selectedTrip.budget),
          count,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.data.places);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (cat: string): string => {
    const labels: Record<string, string> = {
      attraction: '관광지',
      restaurant: '레스토랑',
      accommodation: '숙박',
      shopping: '쇼핑',
      activity: '액티비티',
    };
    return labels[cat] || cat;
  };

  const getCategoryIcon = (cat: string): string => {
    const icons: Record<string, string> = {
      attraction: '🏛️',
      restaurant: '🍽️',
      accommodation: '🏨',
      shopping: '🛍️',
      activity: '🎯',
    };
    return icons[cat] || '📍';
  };

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  if (trips.length === 0) {
    return (
      <Card className="py-12">
        <CardContent className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            여행을 먼저 만들어주세요
          </h3>
          <p className="text-gray-500 mb-6">
            AI 추천을 받으려면 먼저 여행을 만들어야 합니다
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
        <h2 className="text-3xl font-bold text-gray-900">AI 장소 추천</h2>
        <p className="mt-1 text-sm text-gray-500">
          AI가 여행지에 맞는 최적의 장소를 추천해드립니다
        </p>
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

      {/* Recommendation Form */}
      <Card>
        <CardHeader>
          <CardTitle>추천 설정</CardTitle>
          <CardDescription>
            원하는 카테고리와 개수를 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attraction">관광지</SelectItem>
                  <SelectItem value="restaurant">레스토랑</SelectItem>
                  <SelectItem value="accommodation">숙박</SelectItem>
                  <SelectItem value="shopping">쇼핑</SelectItem>
                  <SelectItem value="activity">액티비티</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추천 개수
              </label>
              <Input
                type="number"
                min={1}
                max={10}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 5)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGetRecommendations}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    AI 추천 중... (5-10초)
                  </>
                ) : (
                  '✨ AI 추천 받기'
                )}
              </Button>
            </div>
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

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">
              추천 장소 ({recommendations.length}개)
            </h3>
            {selectedTrip && (
              <span className="text-sm text-gray-500">
                {selectedTrip.destination}, {selectedTrip.country}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((place, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span>{getCategoryIcon(place.category)}</span>
                        {place.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {place.address}
                      </CardDescription>
                    </div>
                    <Badge>{getCategoryLabel(place.category)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4">{place.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-24">평균 비용:</span>
                      <span className="font-medium">
                        {place.averageCost.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-24">권장 시간:</span>
                      <span className="font-medium">
                        {place.recommendedDuration}시간
                      </span>
                    </div>
                    {place.rating && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-24">평점:</span>
                        <span className="font-medium">⭐ {place.rating}/5</span>
                      </div>
                    )}
                    {place.openingHours && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-24">운영 시간:</span>
                        <span className="font-medium">{place.openingHours}</span>
                      </div>
                    )}
                  </div>

                  {place.tips && place.tips.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        💡 팁:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {place.tips.map((tip, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {place.nearbyTransport && (
                    <div className="mb-4">
                      <p className="text-sm">
                        <span className="text-gray-500">교통:</span>{' '}
                        {place.nearbyTransport}
                      </p>
                    </div>
                  )}

                  {place.bestTime && (
                    <div className="mb-4">
                      <p className="text-sm">
                        <span className="text-gray-500">방문 최적 시간:</span>{' '}
                        {place.bestTime}
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => alert('일정에 추가 기능은 곧 구현됩니다!')}
                  >
                    일정에 추가
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && recommendations.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI 추천을 받아보세요
            </h3>
            <p className="text-gray-500">
              카테고리를 선택하고 AI 추천 받기 버튼을 클릭하세요
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
