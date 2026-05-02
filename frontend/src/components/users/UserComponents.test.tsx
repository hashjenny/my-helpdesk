import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { User } from 'shared'
import {
  UserTable,
  UserFilters,
  CreateUserForm,
  EditUserModal,
  Pagination,
} from './index'

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } })

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'ADMIN', createdAt: '2024-01-01' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'AGENT', createdAt: '2024-01-02' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'AGENT', createdAt: '2024-01-03' },
]

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('UserTable', () => {
  const defaultProps = {
    users: mockUsers,
    isLoading: false,
    error: null,
    currentUserId: '1',
    limit: 10,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    deletePending: false,
  }

  beforeEach(() => vi.clearAllMocks())

  it('renders table headers', () => {
    renderWithClient(<UserTable {...defaultProps} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders user rows', () => {
    renderWithClient(<UserTable {...defaultProps} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('shows ADMIN badge for admin users', () => {
    renderWithClient(<UserTable {...defaultProps} />)
    const badges = screen.getAllByText('ADMIN')
    expect(badges.length).toBe(1)
  })

  it('shows delete button for non-current user', () => {
    renderWithClient(<UserTable {...defaultProps} />)
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' })
    expect(deleteButtons.length).toBe(2) // Jane and Bob, not John (current user)
  })

  it('hides delete button for current user', () => {
    renderWithClient(<UserTable {...defaultProps} />)
    const johnRow = screen.getByText('John Doe').closest('tr')
    expect(johnRow?.querySelectorAll('button').length).toBe(1) // Only Edit, no Delete
  })

  it('calls onEdit when Edit button is clicked', () => {
    renderWithClient(<UserTable {...defaultProps} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockUsers[0])
  })

  it('calls onDelete when Delete button is clicked', () => {
    renderWithClient(<UserTable {...defaultProps} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0])
    expect(defaultProps.onDelete).toHaveBeenCalledWith('2')
  })

  it('shows loading skeleton when isLoading is true', () => {
    renderWithClient(<UserTable {...defaultProps} isLoading={true} />)
    const skeletonItems = document.querySelectorAll('.animate-pulse')
    expect(skeletonItems.length).toBeGreaterThan(0)
  })

  it('shows error message when error exists', () => {
    renderWithClient(<UserTable {...defaultProps} error={new Error('Failed to load')} />)
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })

  it('shows empty state when no users', () => {
    renderWithClient(<UserTable {...defaultProps} users={[]} />)
    expect(screen.getByText('No users found')).toBeInTheDocument()
  })
})

describe('UserFilters', () => {
  const defaultProps = {
    search: '',
    roleFilter: '',
    onSearchChange: vi.fn(),
    onRoleFilterChange: vi.fn(),
  }

  beforeEach(() => vi.clearAllMocks())

  it('renders search input', () => {
    renderWithClient(<UserFilters {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search by name or email...')).toBeInTheDocument()
  })

  it('renders role filter select', () => {
    renderWithClient(<UserFilters {...defaultProps} />)
    expect(screen.getByText('All Roles')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Agent' })).toBeInTheDocument()
  })

  it('calls onSearchChange when typing', () => {
    renderWithClient(<UserFilters {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Search by name or email...'), {
      target: { value: 'john' },
    })
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('john')
  })

  it('calls onRoleFilterChange when selecting role', () => {
    renderWithClient(<UserFilters {...defaultProps} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ADMIN' } })
    expect(defaultProps.onRoleFilterChange).toHaveBeenCalledWith('ADMIN')
  })

  it('displays current search value', () => {
    renderWithClient(<UserFilters {...defaultProps} search="test query" />)
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument()
  })

  it('displays current role filter value', () => {
    renderWithClient(<UserFilters {...defaultProps} roleFilter="ADMIN" />)
    expect(screen.getByRole('combobox')).toHaveValue('ADMIN')
  })
})

describe('Pagination', () => {
  const defaultProps = {
    page: 1,
    totalPages: 3,
    total: 25,
    limit: 10,
    isLoading: false,
    onPageChange: vi.fn(),
    onLimitChange: vi.fn(),
  }

  beforeEach(() => vi.clearAllMocks())

  it('displays page info', () => {
    renderWithClient(<Pagination {...defaultProps} />)
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
    expect(screen.getByText('Total: 25 users')).toBeInTheDocument()
  })

  it('disables Previous button on first page', () => {
    renderWithClient(<Pagination {...defaultProps} page={1} />)
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
  })

  it('disables Next button on last page', () => {
    renderWithClient(<Pagination {...defaultProps} page={3} />)
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('enables Previous button when not on first page', () => {
    renderWithClient(<Pagination {...defaultProps} page={2} />)
    expect(screen.getByRole('button', { name: 'Previous' })).not.toBeDisabled()
  })

  it('enables Next button when not on last page', () => {
    renderWithClient(<Pagination {...defaultProps} page={1} />)
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
  })

  it('calls onPageChange with previous page when Previous clicked', () => {
    renderWithClient(<Pagination {...defaultProps} page={2} />)
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1)
  })

  it('calls onPageChange with next page when Next clicked', () => {
    renderWithClient(<Pagination {...defaultProps} page={2} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onLimitChange when limit select changes', () => {
    renderWithClient(<Pagination {...defaultProps} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '20' } })
    expect(defaultProps.onLimitChange).toHaveBeenCalledWith(20)
  })

  it('disables buttons when loading', () => {
    renderWithClient(<Pagination {...defaultProps} isLoading={true} />)
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })
})

describe('CreateUserForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    isPending: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields', () => {
    renderWithClient(<CreateUserForm {...defaultProps} />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Role')).toBeInTheDocument()
  })

  it('renders Create and Cancel buttons', () => {
    renderWithClient(<CreateUserForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('shows "Creating..." when pending', () => {
    renderWithClient(<CreateUserForm {...defaultProps} isPending={true} />)
    expect(screen.getByText('Creating...')).toBeInTheDocument()
  })

  it('disables Create button when pending', () => {
    renderWithClient(<CreateUserForm {...defaultProps} isPending={true} />)
    expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled()
  })

  it('calls onCancel when Cancel is clicked', () => {
    renderWithClient(<CreateUserForm {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(defaultProps.onCancel).toHaveBeenCalled()
  })
})

describe('EditUserModal', () => {
  const defaultProps = {
    user: mockUsers[0],
    onClose: vi.fn(),
    onSave: vi.fn(),
    isPending: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders user data in form', () => {
    renderWithClient(<EditUserModal {...defaultProps} />)
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
  })

  it('renders Save and Cancel buttons', () => {
    renderWithClient(<EditUserModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('shows Save button as disabled when pending', () => {
    renderWithClient(<EditUserModal {...defaultProps} isPending={true} />)
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument()
  })

  it('calls onSave with updated data when Save is clicked', () => {
    renderWithClient(<EditUserModal {...defaultProps} />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Updated' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(defaultProps.onSave).toHaveBeenCalledWith('1', {
      name: 'John Updated',
      role: 'ADMIN',
    })
  })

  it('calls onClose when Cancel is clicked', () => {
    renderWithClient(<EditUserModal {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})
