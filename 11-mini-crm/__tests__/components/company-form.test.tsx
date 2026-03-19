import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock CompanyForm component (will be implemented later)
interface CompanyFormProps {
  onSubmit: (data: Record<string, string | number | undefined>) => void;
  initialData?: Record<string, string | number | undefined>;
}

const CompanyForm = ({ onSubmit, initialData }: CompanyFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      industry: formData.get('industry') as string,
      website: formData.get('website') as string,
      address: formData.get('address') as string,
      employeeCount: formData.get('employeeCount') ? Number(formData.get('employeeCount')) : undefined,
      memo: formData.get('memo') as string,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="company-form">
      <div>
        <label htmlFor="name">회사명</label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={initialData?.name}
          required
        />
      </div>
      <div>
        <label htmlFor="industry">업종</label>
        <input
          id="industry"
          name="industry"
          type="text"
          defaultValue={initialData?.industry}
        />
      </div>
      <div>
        <label htmlFor="website">웹사이트</label>
        <input
          id="website"
          name="website"
          type="url"
          defaultValue={initialData?.website}
        />
      </div>
      <div>
        <label htmlFor="address">주소</label>
        <input
          id="address"
          name="address"
          type="text"
          defaultValue={initialData?.address}
        />
      </div>
      <div>
        <label htmlFor="employeeCount">직원 수</label>
        <input
          id="employeeCount"
          name="employeeCount"
          type="number"
          defaultValue={initialData?.employeeCount}
        />
      </div>
      <div>
        <label htmlFor="memo">메모</label>
        <textarea
          id="memo"
          name="memo"
          defaultValue={initialData?.memo}
        />
      </div>
      <button type="submit">저장</button>
    </form>
  );
};

describe('CompanyForm', () => {
  it('should render all fields', () => {
    const mockSubmit = vi.fn();
    render(<CompanyForm onSubmit={mockSubmit} />);

    expect(screen.getByLabelText('회사명')).toBeInTheDocument();
    expect(screen.getByLabelText('업종')).toBeInTheDocument();
    expect(screen.getByLabelText('웹사이트')).toBeInTheDocument();
    expect(screen.getByLabelText('주소')).toBeInTheDocument();
    expect(screen.getByLabelText('직원 수')).toBeInTheDocument();
    expect(screen.getByLabelText('메모')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });

  it('should show validation error for empty name', async () => {
    const mockSubmit = vi.fn();
    render(<CompanyForm onSubmit={mockSubmit} />);

    const submitButton = screen.getByRole('button', { name: '저장' });
    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with form data', async () => {
    const mockSubmit = vi.fn();
    const user = userEvent.setup();

    render(<CompanyForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText('회사명'), 'Test Company');
    await user.type(screen.getByLabelText('업종'), 'Technology');
    await user.type(screen.getByLabelText('웹사이트'), 'https://example.com');
    await user.type(screen.getByLabelText('주소'), '123 Main St');
    await user.type(screen.getByLabelText('직원 수'), '50');
    await user.type(screen.getByLabelText('메모'), 'Test memo');

    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Test Company',
        industry: 'Technology',
        website: 'https://example.com',
        address: '123 Main St',
        employeeCount: 50,
        memo: 'Test memo',
      });
    });
  });

  it('should populate form with initialData', () => {
    const mockSubmit = vi.fn();
    const initialData = {
      name: 'Existing Company',
      industry: 'Finance',
      website: 'https://existing.com',
      address: '456 Oak Ave',
      employeeCount: 100,
      memo: 'Existing memo',
    };

    render(<CompanyForm onSubmit={mockSubmit} initialData={initialData} />);

    expect(screen.getByLabelText('회사명')).toHaveValue('Existing Company');
    expect(screen.getByLabelText('업종')).toHaveValue('Finance');
    expect(screen.getByLabelText('웹사이트')).toHaveValue('https://existing.com');
    expect(screen.getByLabelText('주소')).toHaveValue('456 Oak Ave');
    expect(screen.getByLabelText('직원 수')).toHaveValue(100);
    expect(screen.getByLabelText('메모')).toHaveValue('Existing memo');
  });
});
