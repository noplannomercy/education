'use client';

import { useState } from 'react';
import { Contact } from '@/lib/db/schema';
import { ContactCard } from './contact-card';
import { ContactDialog } from './contact-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type ContactWithCompany = Contact & {
  company: { id: string; name: string } | null;
};

type Props = {
  initialContacts: ContactWithCompany[];
  companies: { id: string; name: string }[];
};

export function ContactList({ initialContacts, companies }: Props) {
  const [contacts, setContacts] = useState<ContactWithCompany[]>(initialContacts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactWithCompany | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = () => {
    setEditingContact(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (contact: ContactWithCompany) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 연락처를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert('삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
      alert('삭제 중 오류가 발생했습니다');
    }
  };

  const handleSave = (contact: ContactWithCompany) => {
    if (editingContact) {
      setContacts((prev) =>
        prev.map((c) => (c.id === contact.id ? contact : c))
      );
    } else {
      setContacts((prev) => [contact, ...prev]);
    }
    setIsDialogOpen(false);
  };

  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.phone?.toLowerCase().includes(query) ||
      contact.company?.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="이름, 이메일, 전화번호, 회사 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {filteredContacts.length}개
          </span>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />새 연락처
          </Button>
        </div>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          {searchQuery ? '검색 결과가 없습니다' : '연락처가 없습니다'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ContactDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        contact={editingContact}
        onSave={handleSave}
        companies={companies}
      />
    </div>
  );
}
