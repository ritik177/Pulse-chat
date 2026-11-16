import { Provider } from 'react-redux'
import { store } from '@/app/store'
import { ChatLayout } from '@/features/chat/components/ChatLayout'

export default function App() {
  return (
    <Provider store={store}>
      <ChatLayout />
    </Provider>
  )
}
