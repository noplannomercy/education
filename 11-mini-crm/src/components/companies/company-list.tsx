'use client';

import { useState } from 'react';
import { Company } from '@/lib/db/schema';
import { CompanyCard } from './company-card';
import { CompanyDialog } from './company-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type CompanyWithCount = Company & {
  contactCount: number;
};

type Props = {
  initialCompanies: CompanyWithCount[];
};

export function CompanyList({ initialCompanies }: Props) {
  const [companies, setCompanies] = useState<CompanyWithCount[]>(initialCompanies);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = () => {
    setEditingCompany(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (company: CompanyWithCount) => {
    setEditingCompany(company);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Check if company can be deleted
    try {
      const res = await fetch(`/api/companies/${id}/delete-preview`);
      const preview = await res.json();

      const message = preview.canDelete
        ? '이 회사를 삭제하시겠습니까?'
        : `이 회사를 삭제하면 ${preview.contactCount}개의 연락처가 회사 연결이 해제됩니다. 계속하시겠습니까?`;

      if (!confirm(message)) return;

      const deleteRes = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      });

      if (deleteRes.ok) {
        setCompanies((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert('삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to delete company:', error);
      alert('삭제 중 오류가 발생했습니다');
    }
  };

  const handleSave = (company: Company) => {
    if (editingCompany) {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === company.id ? { ...company, contactCount: c.contactCount } : c
        )
      );
    } else {
      setCompanies((prev) => [{ ...company, contactCount: 0 }, ...prev]);
    }
    setIsDialogOpen(false);
  };

  const filteredCompanies = companies.filter((company) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      company.name.toLowerCase().includes(query) ||
      company.industry?.toLowerCase().includes(query) ||
      company.website?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="회사명, 업종, 웹사이트 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {filteredCompanies.length}개
          </span>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />새 회사
          </Button>
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          {searchQuery ? '검색 결과가 없습니다' : '회사가 없습니다'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CompanyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        company={editingCompany}
        onSave={handleSave}
      />
    </div>
  );
}
