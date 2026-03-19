// src/components/dashboard/SummaryCards.tsx
interface Props {
  income: number;
  expense: number;
  balance: number;
}

export default function SummaryCards({ income, expense, balance }: Props) {
  const cards = [
    { label: '총 수입', value: income, bg: 'bg-green-300', sign: '+' },
    { label: '총 지출', value: expense, bg: 'bg-red-300', sign: '-' },
    { label: '잔액', value: balance, bg: balance >= 0 ? 'bg-yellow-300' : 'bg-orange-300', sign: balance >= 0 ? '' : '-' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {cards.map(card => (
        <div
          key={card.label}
          className={`p-4 border-4 border-black ${card.bg} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
        >
          <p className="font-black text-sm mb-1">{card.label}</p>
          <p className="text-2xl font-black">
            {card.label === '잔액' && balance < 0 ? '-' : card.label !== '잔액' ? card.sign : ''}
            {Math.abs(card.value).toLocaleString('ko-KR')}
            <span className="text-sm ml-1">원</span>
          </p>
        </div>
      ))}
    </div>
  );
}
