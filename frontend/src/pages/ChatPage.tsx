import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { chatApi, Conversation, Message } from '@/api/chat'
import { supabase } from '@/lib/supabase'
import { Send, User, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react'

export default function ChatPage() {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messageInput, setMessageInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Fetch conversations
    const { data: conversations, isLoading: loadingConversations } = useQuery({
        queryKey: ['conversations', user?.id],
        queryFn: () => chatApi.getConversations(user!.id),
        enabled: !!user,
    })

    // Fetch messages for selected conversation
    const { data: messages, isLoading: loadingMessages } = useQuery({
        queryKey: ['messages', selectedConversation?.id],
        queryFn: () => chatApi.getMessages(selectedConversation!.id),
        enabled: !!selectedConversation,
        refetchInterval: 3000, // Poll every 3 seconds (fallback for realtime)
    })

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: (content: string) =>
            chatApi.sendMessage(selectedConversation!.id, user!.id, content),
        onSuccess: () => {
            setMessageInput('')
            queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] })
        }
    })

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Real-time subscription for new messages
    useEffect(() => {
        if (!selectedConversation) return

        const channel = supabase
            .channel(`messages:${selectedConversation.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${selectedConversation.id}`
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation.id] })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [selectedConversation?.id, queryClient])

    const handleSend = () => {
        if (!messageInput.trim() || !selectedConversation) return
        sendMessageMutation.mutate(messageInput)
    }

    if (!user) return null

    return (
        <div className="h-[calc(100vh-8rem)] flex">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 border-r border-gray-200 ${selectedConversation ? 'hidden md:block' : ''}`}>
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Messages
                    </h2>
                </div>

                {loadingConversations ? (
                    <div className="p-4 text-center text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </div>
                ) : conversations && conversations.length > 0 ? (
                    <div className="overflow-y-auto">
                        {conversations.map((conv) => {
                            const otherUser = conv.other_user
                            const name = otherUser?.username || otherUser?.email?.split('@')[0] || 'User'

                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${selectedConversation?.id === conv.id ? 'bg-orange-50' : ''
                                        }`}
                                >
                                    {otherUser?.avatar_url ? (
                                        <img src={otherUser.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-500" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{name}</p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {new Date(conv.last_message_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No conversations yet</p>
                        <p className="text-sm">Start a chat from someone's profile!</p>
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                            <button
                                onClick={() => setSelectedConversation(null)}
                                className="md:hidden p-1"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            {selectedConversation.other_user?.avatar_url ? (
                                <img src={selectedConversation.other_user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-500" />
                                </div>
                            )}
                            <span className="font-medium text-gray-900">
                                {selectedConversation.other_user?.username ||
                                    selectedConversation.other_user?.email?.split('@')[0] || 'User'}
                            </span>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loadingMessages ? (
                                <div className="text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </div>
                            ) : messages && messages.length > 0 ? (
                                messages.map((msg: Message) => {
                                    const isOwn = msg.sender_id === user.id
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] p-3 rounded-2xl ${isOwn
                                                    ? 'bg-orange-500 text-white rounded-br-md'
                                                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                                }`}>
                                                <p>{msg.content}</p>
                                                <p className={`text-xs mt-1 ${isOwn ? 'text-orange-100' : 'text-gray-400'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center text-gray-500">
                                    <p>No messages yet</p>
                                    <p className="text-sm">Say hi! 👋</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-100">
                            <div className="flex gap-2">
                                <input
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="input-clean flex-1"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!messageInput.trim() || sendMessageMutation.isPending}
                                    className="btn-primary px-4"
                                >
                                    {sendMessageMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">Select a conversation</p>
                            <p className="text-sm">or start a new one from a user's profile</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
