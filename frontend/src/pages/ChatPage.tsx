import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { chatApi, Conversation, Message } from '@/api/chat'
import { supabase } from '@/lib/supabase'
import { Send, User, MessageCircle, ArrowLeft, Loader2, Smile } from 'lucide-react'

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

    // Format relative time
    const formatRelativeTime = (date: string) => {
        const now = new Date()
        const messageDate = new Date(date)
        const diffMs = now.getTime() - messageDate.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays === 1) return 'Yesterday'
        return messageDate.toLocaleDateString()
    }

    if (!user) return null

    return (
        <div className="h-[calc(100vh-8rem)] flex bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-sm">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 bg-white dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700/50 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                {/* Sidebar Header */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-orange-50 to-white dark:from-gray-800 dark:to-gray-800/50">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2.5 text-lg">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <MessageCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        Messages
                        {conversations && conversations.length > 0 && (
                            <span className="ml-auto text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                {conversations.length}
                            </span>
                        )}
                    </h2>
                </div>

                {/* Conversations List */}
                {loadingConversations ? (
                    <div className="p-8 text-center">
                        <div className="relative">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                            <div className="absolute inset-0 w-8 h-8 mx-auto rounded-full bg-orange-400/20 animate-ping" />
                        </div>
                        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading conversations...</p>
                    </div>
                ) : conversations && conversations.length > 0 ? (
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
                        {conversations.map((conv) => {
                            const otherUser = conv.other_user
                            const name = otherUser?.username || otherUser?.email?.split('@')[0] || 'User'
                            const isSelected = selectedConversation?.id === conv.id

                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`w-full p-4 flex items-center gap-3 transition-all duration-200 text-left group relative
                                        ${isSelected
                                            ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-l-orange-500'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/30 border-l-4 border-l-transparent'
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        {otherUser?.avatar_url ? (
                                            <img
                                                src={otherUser.avatar_url}
                                                alt=""
                                                className={`w-12 h-12 rounded-full object-cover ring-2 transition-all duration-200
                                                    ${isSelected
                                                        ? 'ring-orange-300 dark:ring-orange-700'
                                                        : 'ring-gray-200 dark:ring-gray-600 group-hover:ring-gray-300 dark:group-hover:ring-gray-500'
                                                    }`}
                                            />
                                        ) : (
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
                                                ${isSelected
                                                    ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                                                    : 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 group-hover:from-gray-400 group-hover:to-gray-500'
                                                }`}
                                            >
                                                <User className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-white'}`} />
                                            </div>
                                        )}
                                        {/* Online indicator placeholder */}
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`font-medium truncate transition-colors ${isSelected
                                                    ? 'text-orange-700 dark:text-orange-300'
                                                    : 'text-gray-900 dark:text-white'
                                                }`}>
                                                {name}
                                            </p>
                                            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                                                {formatRelativeTime(conv.last_message_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                            Click to view messages
                                        </p>
                                    </div>

                                    {/* Hover chevron */}
                                    <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}>
                                        <svg className={`w-4 h-4 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">No conversations yet</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto">
                                Start a chat from someone's profile to get started!
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-gray-800/30 ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 flex items-center gap-3 bg-white dark:bg-gray-800/50 shadow-sm">
                            <button
                                onClick={() => setSelectedConversation(null)}
                                className="md:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>

                            {/* Avatar with status */}
                            <div className="relative">
                                {selectedConversation.other_user?.avatar_url ? (
                                    <img
                                        src={selectedConversation.other_user.avatar_url}
                                        alt=""
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-200 dark:ring-orange-800"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                )}
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                            </div>

                            <div className="flex-1">
                                <span className="font-semibold text-gray-900 dark:text-white block">
                                    {selectedConversation.other_user?.username ||
                                        selectedConversation.other_user?.email?.split('@')[0] || 'User'}
                                </span>
                                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    Online
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/20 dark:to-gray-800/30">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading messages...</p>
                                    </div>
                                </div>
                            ) : messages && messages.length > 0 ? (
                                messages.map((msg: Message, index: number) => {
                                    const isOwn = msg.sender_id === user.id
                                    const isFirstInGroup = index === 0 || messages[index - 1]?.sender_id !== msg.sender_id

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
                                            style={{ animationDelay: `${index * 30}ms` }}
                                        >
                                            {/* Show avatar for received messages */}
                                            {!isOwn && isFirstInGroup && (
                                                <div className="mr-2 flex-shrink-0 self-end">
                                                    {selectedConversation.other_user?.avatar_url ? (
                                                        <img
                                                            src={selectedConversation.other_user.avatar_url}
                                                            alt=""
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                                                            <User className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {!isOwn && !isFirstInGroup && <div className="w-10" />}

                                            <div className={`max-w-[75%] md:max-w-[65%] transition-transform hover:scale-[1.01]`}>
                                                <div
                                                    className={`px-4 py-2.5 shadow-sm ${isOwn
                                                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl rounded-br-md'
                                                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-bl-md border border-gray-100 dark:border-gray-600'
                                                        }`}
                                                >
                                                    <p className="leading-relaxed break-words">{msg.content}</p>
                                                </div>
                                                <p className={`text-[10px] mt-1 px-1 ${isOwn ? 'text-right text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center p-8">
                                        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center">
                                            <Smile className="w-12 h-12 text-orange-500 dark:text-orange-400" />
                                        </div>
                                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">No messages yet</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Say hi! 👋 Start the conversation
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 bg-white dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/50">
                            <div className="flex gap-3 items-end">
                                <div className="flex-1 relative">
                                    <input
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                        placeholder="Type a message..."
                                        className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 
                                            text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                                            focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 dark:focus:border-orange-500
                                            transition-all duration-200"
                                    />
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={!messageInput.trim() || sendMessageMutation.isPending}
                                    className={`p-3.5 rounded-xl transition-all duration-200 flex-shrink-0
                                        ${messageInput.trim() && !sendMessageMutation.isPending
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {sendMessageMutation.isPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className={`w-5 h-5 transition-transform ${messageInput.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/30 dark:to-gray-800/30">
                        <div className="text-center p-8">
                            <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/10">
                                <MessageCircle className="w-14 h-14 text-orange-500 dark:text-orange-400" />
                            </div>
                            <p className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Select a conversation</p>
                            <p className="text-gray-500 dark:text-gray-400 max-w-[280px] mx-auto">
                                Choose a conversation from the sidebar or start a new one from a user's profile
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
