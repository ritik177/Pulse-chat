import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import conversationsReducer from '@/features/chat/slice/conversationsSlice'
import messagesReducer from '@/features/chat/slice/messagesSlice'
import usersReducer from '@/features/chat/slice/usersSlice'
import uiReducer from '@/features/chat/slice/uiSlice'
import { ConversationFilters } from '@/features/chat/components/Sidebar/ConversationFilters'

function renderFilters() {
  const store = configureStore({
    reducer: {
      conversations: conversationsReducer,
      messages: messagesReducer,
      users: usersReducer,
      ui: uiReducer,
    },
  })

  return {
    store,
    ...render(
      <Provider store={store}>
        <ConversationFilters />
      </Provider>,
    ),
  }
}

describe('ConversationFilters', () => {
  it('switches filter tabs', async () => {
    const user = userEvent.setup()
    const { store } = renderFilters()

    expect(store.getState().ui.filter).toBe('all')
    await user.click(screen.getByRole('tab', { name: 'Unread' }))
    expect(store.getState().ui.filter).toBe('unread')
    await user.click(screen.getByRole('tab', { name: 'Groups' }))
    expect(store.getState().ui.filter).toBe('groups')
  })
})
