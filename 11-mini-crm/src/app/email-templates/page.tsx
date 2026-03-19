import { db } from '@/lib/db';
import { emailTemplates } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { EmailTemplateList } from '@/components/email-templates/email-template-list';

export const dynamic = 'force-dynamic';

export default async function EmailTemplatesPage() {
  const templates = await db
    .select()
    .from(emailTemplates)
    .orderBy(desc(emailTemplates.createdAt));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">이메일 템플릿</h1>
      </div>

      <EmailTemplateList initialTemplates={templates} />
    </div>
  );
}
