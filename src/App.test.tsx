import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

type User = ReturnType<typeof userEvent.setup>

function setup() {
  const user = userEvent.setup()
  const utils = render(<App />)
  return { user, ...utils }
}

interface AddOptions {
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string
}

async function addTask(user: User, title: string, options: AddOptions = {}) {
  await user.type(screen.getByLabelText('Task name'), title)

  if (options.priority) {
    await user.selectOptions(
      screen.getByLabelText('Priority'),
      options.priority,
    )
  }

  if (options.dueDate) {
    fireEvent.change(screen.getByLabelText('Due'), {
      target: { value: options.dueDate },
    })
  }

  await user.click(screen.getByRole('button', { name: /add task/i }))
}

describe('App', () => {
  it('renders the header and the empty state on a first visit', () => {
    setup()

    expect(
      screen.getByRole('heading', { level: 1, name: /taskflow/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('adds a task and clears the input', async () => {
    const { user } = setup()

    await addTask(user, 'Write the docs', { priority: 'high' })

    expect(screen.getByText('Write the docs')).toBeInTheDocument()
    expect(screen.getByLabelText('Task name')).toHaveValue('')
    expect(
      within(screen.getByRole('listitem')).getByText('High'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/nothing here yet/i)).not.toBeInTheDocument()
  })

  it('rejects an empty submission with an accessible error', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: /add task/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      /give your task a name/i,
    )
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('toggles a task complete and updates the progress bar', async () => {
    const { user } = setup()

    await addTask(user, 'Toggle me')
    await user.click(screen.getByRole('checkbox', { name: /toggle me/i }))

    expect(screen.getByRole('checkbox', { name: /toggle me/i })).toBeChecked()
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    )
  })

  it('edits an existing task in place', async () => {
    const { user } = setup()

    await addTask(user, 'Original name')
    await user.click(
      screen.getByRole('button', { name: /edit "original name"/i }),
    )

    const input = screen.getByLabelText('Edit task name')
    await user.clear(input)
    await user.type(input, 'Renamed task')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.getByText('Renamed task')).toBeInTheDocument()
    expect(screen.queryByText('Original name')).not.toBeInTheDocument()
  })

  it('abandons an edit when Escape is pressed', async () => {
    const { user } = setup()

    await addTask(user, 'Keep this')
    await user.click(screen.getByRole('button', { name: /edit "keep this"/i }))

    const input = screen.getByLabelText('Edit task name')
    await user.clear(input)
    await user.type(input, 'Discarded{escape}')

    expect(screen.getByText('Keep this')).toBeInTheDocument()
    expect(screen.queryByLabelText('Edit task name')).not.toBeInTheDocument()
  })

  it('deletes a task', async () => {
    const { user } = setup()

    await addTask(user, 'Throw me away')
    await user.click(
      screen.getByRole('button', { name: /delete "throw me away"/i }),
    )

    expect(screen.queryByText('Throw me away')).not.toBeInTheDocument()
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument()
  })

  it('filters tasks by completion status', async () => {
    const { user } = setup()

    await addTask(user, 'Task one')
    await addTask(user, 'Task two')
    await user.click(screen.getByRole('checkbox', { name: /task two/i }))

    await user.click(screen.getByRole('tab', { name: /^completed/i }))

    expect(screen.getByText('Task two')).toBeInTheDocument()
    expect(screen.queryByText('Task one')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /^active/i }))

    expect(screen.getByText('Task one')).toBeInTheDocument()
    expect(screen.queryByText('Task two')).not.toBeInTheDocument()
  })

  it('searches task titles', async () => {
    const { user } = setup()

    await addTask(user, 'Buy milk')
    await addTask(user, 'Write the README')

    await user.type(screen.getByLabelText('Search tasks'), 'readme')

    expect(screen.getByText('Write the README')).toBeInTheDocument()
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument()
  })

  it('loads sample tasks from the empty state', async () => {
    const { user } = setup()

    await user.click(
      screen.getByRole('button', { name: /load sample tasks/i }),
    )

    expect(screen.getAllByRole('checkbox')).toHaveLength(4)
    expect(screen.queryByText(/nothing here yet/i)).not.toBeInTheDocument()
  })

  it('clears completed tasks in one action', async () => {
    const { user } = setup()

    await addTask(user, 'Keep me')
    await addTask(user, 'Clear me')
    await user.click(screen.getByRole('checkbox', { name: /clear me/i }))
    await user.click(screen.getByRole('button', { name: /clear completed/i }))

    expect(screen.queryByText('Clear me')).not.toBeInTheDocument()
    expect(screen.getByText('Keep me')).toBeInTheDocument()
  })

  it('persists tasks across a remount', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)

    await addTask(user, 'Survives a reload')
    unmount()

    render(<App />)

    expect(screen.getByText('Survives a reload')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /survives a reload/i })).toBeInTheDocument()
  })

  it('ignores corrupted stored data instead of crashing', () => {
    window.localStorage.setItem(
      'taskflow.todos.v1',
      JSON.stringify([{ title: '' }, null, 'garbage', { title: 'Valid' }]),
    )

    render(<App />)

    expect(screen.getByText('Valid')).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
  })

  it('toggles the colour theme from the header button', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: /switch to dark theme/i }))

    expect(document.documentElement).toHaveClass('dark')
    expect(
      screen.getByRole('button', { name: /switch to light theme/i }),
    ).toBeInTheDocument()
  })
})

