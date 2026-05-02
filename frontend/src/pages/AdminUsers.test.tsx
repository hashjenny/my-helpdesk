import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminUsers } from '../pages/AdminUsers'
import { AuthContext } from '@/context/auth-context'

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'ADMIN', createdAt: '2024-01-01' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'AGENT', createdAt: '2024-01-02' },
]

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
    },
  })
  const mockSession = {
    user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
    session: { id: 's1', expiresAt: new Date(), token: 'test-token' },
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ session: mockSession, isPending: false, signOut: vi.fn() }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  )

  return { Wrapper, queryClient, mockSession }
}

describe('AdminUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading skeleton', () => {
    it('shows skeleton while loading', async () => {
      const { Wrapper } = createWrapper()

      render(<AdminUsers />, { wrapper: Wrapper })

      const skeletonItems = document.querySelectorAll('.animate-pulse')
      expect(skeletonItems.length).toBeGreaterThan(0)
    })
  })

  describe('User table', () => {
    it('renders table headers', async () => {
      const { Wrapper, queryClient } = createWrapper()

      queryClient.setQueryData(['users', 1, 10, '', ''], {
        users: mockUsers,
        total: 2,
        page: 1,
        totalPages: 1,
      })

      render(<AdminUsers />, { wrapper: Wrapper })

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
      expect(screen.getByText('Created')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('renders user data', async () => {
      const { Wrapper, queryClient } = createWrapper()

      queryClient.setQueryData(['users', 1, 10, '', ''], {
        users: mockUsers,
        total: 2,
        page: 1,
        totalPages: 1,
      })

      render(<AdminUsers />, { wrapper: Wrapper })

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  describe('Search and filter', () => {
    it('has search input', async () => {
      const { Wrapper, queryClient } = createWrapper()

      queryClient.setQueryData(['users', 1, 10, '', ''], {
        users: mockUsers,
        total: 2,
        page: 1,
        totalPages: 1,
      })

      render(<AdminUsers />, { wrapper: Wrapper })

      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      expect(searchInput).toBeInTheDocument()
    })

    it('has role filter select', async () => {
      const { Wrapper, queryClient } = createWrapper()

      queryClient.setQueryData(['users', 1, 10, '', ''], {
        users: mockUsers,
        total: 2,
        page: 1,
        totalPages: 1,
      })

      render(<AdminUsers />, { wrapper: Wrapper })

      expect(screen.getByText('All Roles')).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('displays pagination controls', async () => {
      const { Wrapper, queryClient } = createWrapper()

      queryClient.setQueryData(['users', 1, 10, '', ''], {
        users: mockUsers,
        total: 25,
        page: 1,
        totalPages: 3,
      })

      render(<AdminUsers />, { wrapper: Wrapper })

      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
    })

    it('shows total count', async () => {
      const { Wrapper, queryClient } = createWrapper()

      queryClient.setQueryData(['users', 1, 10, '', ''], {
        users: mockUsers,
        total: 25,
        page: 1,
        totalPages: 3,
      })

      render(<AdminUsers />, { wrapper: Wrapper })

      expect(screen.getByText('Total: 25 users')).toBeInTheDocument()
    })
  })

  describe('Add user form', () => {
    it('shows Add Agent button', async () => {
      const { Wrapper, queryClient } = createWrapper()

      queryClient.setQueryData(['users', 1, 10, '', ''], {
        users: mockUsers,
        total: 2,
        page: 1,
        totalPages: 1,
      })

      render(<AdminUsers />, { wrapper: Wrapper })

      expect(screen.getByRole('button', { name: 'Add Agent' })).toBeInTheDocument()
    })
  })
})
