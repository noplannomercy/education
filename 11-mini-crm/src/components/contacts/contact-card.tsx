'use client';

import { Contact } from '@/lib/db/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User, Mail, Phone, Building2 } from 'lucide-react';
import Link from 'next/link';

type ContactWithCompany = Contact & {
  company: { id: string; name: string } | null;
};

type Props = {
  contact: ContactWithCompany;
  onEdit: (contact: ContactWithCompany) => void;
  onDelete: (id: string) => void;
};

export function ContactCard({ contact, onEdit, onDelete }: Props) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="bg-green-100 text-green-700 rounded-full p-2 flex-shrink-0">
            <User className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/contacts/${contact.id}`}
              className="font-semibold text-gray-900 hover:text-blue-600 block truncate"
            >
              {contact.name}
            </Link>
            {contact.position && (
              <p className="text-sm text-gray-600 truncate">{contact.position}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onEdit(contact)}>
            <Edit className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(contact.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {contact.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <a
              href={`mailto:${contact.email}`}
              className="hover:text-blue-600 truncate"
            >
              {contact.email}
            </a>
          </div>
        )}

        {contact.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
              {contact.phone}
            </a>
          </div>
        )}

        {contact.company && (
          <div className="flex items-center gap-2 text-gray-600 pt-2 border-t">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <Link
              href={`/companies/${contact.company.id}`}
              className="hover:text-blue-600 truncate"
            >
              {contact.company.name}
            </Link>
          </div>
        )}
      </div>

      {contact.memo && (
        <p className="mt-3 text-sm text-gray-500 line-clamp-2 pt-3 border-t">
          {contact.memo}
        </p>
      )}
    </Card>
  );
}
