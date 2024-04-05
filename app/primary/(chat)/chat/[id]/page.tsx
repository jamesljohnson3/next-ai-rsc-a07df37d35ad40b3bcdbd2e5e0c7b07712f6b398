import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'



import { getChat, getMissingKeys } from '@/app/actions'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'


export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = "test";

  if (!session) {
    return {}
  }

  const chat = await getChat(params.id, session)
  return {
    title: chat?.title.toString().slice(0, 50) ?? 'Chat'
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = "test";
  const missingKeys = await getMissingKeys()

  if (!session) {
    redirect(`/login?next=/chat/${params.id}`)
  }

  const userId = session 
  const chat = await getChat(params.id, userId)

  if (!chat) {
    redirect('/')
  }

  if (chat?.userId !== session) {
    notFound()
  }

  return (
    <AI initialAIState={{ chatId: chat.id, messages: chat.messages }}>
      <Chat
        id={chat.id}
        session={session}
        initialMessages={chat.messages}
        missingKeys={missingKeys}
      />
    </AI>
  )
}
