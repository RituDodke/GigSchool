import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { jobsApi, ApplicationWithDetails } from '@/api/jobs'
import { Bell, Briefcase, Send, CheckCircle, X, MessageCircle, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { chatApi } from '@/api/chat'
import { useState } from 'react'

export default function NotificationsPage() {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [startingChatWith, setStartingChatWith] = useState<string | null>(null)

    const { data: notifications, isLoading } = useQuery({
        queryKey: ['notifications', user?.id],
        queryFn: () => jobsApi.getNotifications(user!.id),
        enabled: !!user,
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ appId, status }: { appId: string, status: 'ACCEPTED' | 'REJECTED' }) =>
            jobsApi.updateApplicationStatus(appId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
    })

    const handleStartChat = async (otherUserId: string) => {
        if (!user) return
        setStartingChatWith(otherUserId)
        try {
            await chatApi.getOrCreateConversation(user.id, otherUserId)
            navigate('/chat')
        } catch (err) {
            console.error('Failed to start chat:', err)
            alert('Failed to start chat')
        } finally {
            setStartingChatWith(null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <span className="tag text-xs bg-yellow-50 text-yellow-700">PENDING</span>
            case 'ACCEPTED':
                return <span className="tag text-xs bg-green-50 text-green-700">ACCEPTED</span>
            case 'REJECTED':
                return <span className="tag text-xs bg-red-50 text-red-700">REJECTED</span>
            default:
                return <span className="tag text-xs">{status}</span>
        }
    }

    const ApplicationCard = ({ app, isCreatorView }: { app: ApplicationWithDetails, isCreatorView: boolean }) => (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Gig</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">{app.job_title || 'Unknown Gig'}</h4>
                    {isCreatorView && (
                        <p className="text-xs text-gray-500 mt-1">
                            Applicant: <span className="font-medium text-gray-700">{app.applicant_username || app.applicant_email?.split('@')[0] || 'Anonymous'}</span>
                        </p>
                    )}
                </div>
                {getStatusBadge(app.status)}
            </div>

            <p className="text-sm text-gray-600 mb-2 line-clamp-2 italic">"{app.pitch}"</p>

            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                    {new Date(app.created_at).toLocaleDateString()}
                </span>

                <div className="flex gap-1">
                    {isCreatorView && app.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => updateStatusMutation.mutate({ appId: app.id, status: 'ACCEPTED' })}
                                disabled={updateStatusMutation.isPending}
                                className="p-1.5 hover:bg-green-100 rounded text-green-600"
                                title="Accept"
                            >
                                <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => updateStatusMutation.mutate({ appId: app.id, status: 'REJECTED' })}
                                disabled={updateStatusMutation.isPending}
                                className="p-1.5 hover:bg-red-100 rounded text-red-600"
                                title="Reject"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </>
                    )}

                    {isCreatorView && app.applicant_id && (
                        <button
                            onClick={() => handleStartChat(app.applicant_id)}
                            disabled={startingChatWith === app.applicant_id}
                            className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                            title="Message"
                        >
                            {startingChatWith === app.applicant_id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <MessageCircle className="w-4 h-4" />
                            )}
                        </button>
                    )}

                    {!isCreatorView && app.job_creator_id && (
                        <button
                            onClick={() => handleStartChat(app.job_creator_id!)}
                            disabled={startingChatWith === app.job_creator_id}
                            className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                            title="Message Creator"
                        >
                            {startingChatWith === app.job_creator_id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <MessageCircle className="w-4 h-4" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    const applicationsOnGigs = notifications?.applications_on_your_gigs || []
    const yourApplications = notifications?.your_applications || []

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-orange-500" />
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Applications on Your Gigs */}
                <div className="card">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-orange-500" />
                            <h2 className="font-semibold text-gray-900">Applications on Your Gigs</h2>
                            <span className="ml-auto tag tag-orange text-xs">{applicationsOnGigs.length}</span>
                        </div>
                    </div>
                    <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                        {applicationsOnGigs.length > 0 ? (
                            applicationsOnGigs.map(app => (
                                <ApplicationCard key={app.id} app={app} isCreatorView={true} />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No applications on your gigs yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Your Applications */}
                <div className="card">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-blue-500" />
                            <h2 className="font-semibold text-gray-900">Your Applications</h2>
                            <span className="ml-auto tag bg-blue-50 text-blue-700 text-xs">{yourApplications.length}</span>
                        </div>
                    </div>
                    <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                        {yourApplications.length > 0 ? (
                            yourApplications.map(app => (
                                <ApplicationCard key={app.id} app={app} isCreatorView={false} />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Send className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>You haven't applied to any gigs yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
