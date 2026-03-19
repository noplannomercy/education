// src/components/dashboard/RecentTransactions.tsx
interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  date: string;
  categoryName: string | null;
  categoryColor: string | null;
}

interface Props {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: Props) {
  return (
    <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-lg font-black p-4 border-b-4 border-black bg-black text-white">최근 거래</h2>
      <div className="divide-y-2 divide-black">
        {transactions.map(tx => (
          <div key={tx.id} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              {tx.categoryColor && (
                <div className="w-3 h-3 border border-black shrink-0" style={{ backgroundColor: tx.categoryColor }} />
              )}
              <div>
                <p className="font-bold text-sm">{tx.description ?? tx.categoryName ?? '(메모 없음)'}</p>
                <p className="text-xs text-gray-500">{tx.date}</p>
              </div>
            </div>
            <span className={`font-black ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('ko-KR')}
            </span>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="p-4 text-center font-bold text-gray-500">거래 내역이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
