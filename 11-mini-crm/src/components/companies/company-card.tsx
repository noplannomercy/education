'use client';

import { Company } from '@/lib/db/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Building2, Users, Globe, MapPin } from 'lucide-react';
import Link from 'next/link';

type CompanyWithCount = Company & {
  contactCount: number;
};

type Props = {
  company: CompanyWithCount;
  onEdit: (company: CompanyWithCount) => void;
  onDelete: (id: string) => void;
};

export function CompanyCard({ company, onEdit, onDelete }: Props) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="bg-blue-100 text-blue-700 rounded-full p-2 flex-shrink-0">
            <Building2 className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/companies/${company.id}`}
              className="font-semibold text-gray-900 hover:text-blue-600 block truncate"
            >
              {company.name}
            </Link>
            {company.industry && (
              <p className="text-sm text-gray-600 truncate">{company.industry}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onEdit(company)}>
            <Edit className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(company.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {company.website && (
          <div className="flex items-center gap-2 text-gray-600">
            <Globe className="h-4 w-4 flex-shrink-0" />
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 truncate"
            >
              {company.website}
            </a>
          </div>
        )}

        {company.address && (
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{company.address}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-600 pt-2 border-t">
          <Users className="h-4 w-4" />
          <span>연락처 {company.contactCount}개</span>
          {company.employeeCount && (
            <span className="text-gray-400">• 직원 {company.employeeCount}명</span>
          )}
        </div>
      </div>

      {company.memo && (
        <p className="mt-3 text-sm text-gray-500 line-clamp-2 pt-3 border-t">
          {company.memo}
        </p>
      )}
    </Card>
  );
}
