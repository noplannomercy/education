'use client';

import { useState, useEffect } from 'react';
import { searchJournals } from '@/actions/journal';
import { getAllTags } from '@/actions/tag';
import type { Tag } from '@/db/schema';
import type { SearchFilters } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JournalCard } from '@/components/journal/JournalCard';
import { Search } from 'lucide-react';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (open) {
      async function loadTags() {
        const tags = await getAllTags();
        setAllTags(tags);
      }
      loadTags();
    }
  }, [open]);

  async function handleSearch() {
    setIsSearching(true);
    setHasSearched(true);

    const filters: SearchFilters = {
      query: query || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    };

    const results = await searchJournals(filters);
    setSearchResults(results);
    setIsSearching(false);
  }

  function handleTagToggle(tagId: string) {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  }

  function handleReset() {
    setQuery('');
    setStartDate('');
    setEndDate('');
    setSelectedTagIds([]);
    setSearchResults([]);
    setHasSearched(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            일기 검색
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div>
            <label className="text-sm font-medium">검색어</label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목이나 내용으로 검색..."
              className="mt-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">시작일</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">종료일</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">태그 필터</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`rounded-md px-3 py-1 text-sm transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="flex-1"
            >
              {isSearching ? '검색 중...' : '검색'}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
            >
              초기화
            </Button>
          </div>

          {/* Search results */}
          {hasSearched && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">
                검색 결과 ({searchResults.length}개)
              </h3>

              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  검색 결과가 없습니다
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((journal) => (
                    <JournalCard
                      key={journal.id}
                      journal={journal}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
