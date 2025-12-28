import { api } from './client'

export interface Message {
    id: string
    conversation_id: string
    sender_id: string
    content: string
    created_at: string
}

export interface OtherUser {
    id: string
    email: string
    username: string | null
    avatar_url: string | null
}

export interface Conversation {
    id: string
    user1_id: string
    user2_id: string
    last_message_at: string
    created_at: string
    other_user?: OtherUser
    last_message?: string
}

export const chatApi = {
    getConversations: async (userId: string) => {
        const response = await api.get<Conversation[]>('/chat/conversations', {
            params: { user_id: userId }
        })
        return response.data
    },

    getOrCreateConversation: async (currentUserId: string, otherUserId: string) => {
        const response = await api.post<Conversation>(`/chat/conversations/${otherUserId}`, null, {
            params: { current_user_id: currentUserId }
        })
        return response.data
    },

    getMessages: async (conversationId: string) => {
        const response = await api.get<Message[]>(`/chat/conversations/${conversationId}/messages`)
        return response.data
    },

    sendMessage: async (conversationId: string, senderId: string, content: string) => {
        const response = await api.post<Message>(`/chat/conversations/${conversationId}/messages`, null, {
            params: { sender_id: senderId, content }
        })
        return response.data
    }
}
