import { useState } from 'react'
import { Job, jobsApi, Application } from '@/api/jobs'
import { useAuthStore } from '@/stores/authStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, User, Calendar, Tag, Trash2, CheckCircle, Loader2, Send, FileText, MessageCircle } from 'lucide-react'

interface JobDetailModalProps {
    job: Job | null
    isOpen: boolean
    onClose: () => void
}

export function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    const [pitch, setPitch] = useState('')
    const [showApplyForm, setShowApplyForm] = useState(false)

    const isCreator = user?.id === job?.creator_id

    // Fetch applications if creator
    const { data: applications } = useQuery({
        queryKey: ['applications', job?.id],
        queryFn: () => jobsApi.getApplications(job!.id),
        enabled: isCreator && !!job,
    })

    const applyMutation = useMutation({
        mutationFn: () => jobsApi.apply(job!.id, user!.id, pitch),
        onSuccess: () => {
            setPitch('')
            setShowApplyForm(false)
            alert('Application submitted successfully!')
        },
        onError: (err: any) => {
            alert(err.response?.data?.detail || 'Failed to apply')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: () => jobsApi.delete(job!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
            onClose()
        }
    })

    const updateStatusMutation = useMutation({
        mutationFn: (status: string) => jobsApi.update(job!.id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
        }
    })

    if (!isOpen || !job) return null

    const creatorName = job.creator?.username || job.creator?.email?.split('@')[0] || 'Anonymous'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h2>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    {job.creator?.avatar_url ? (
                                        <img src={job.creator.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-500" />
                                        </div>
                                    )}
                                    <span className="text-sm text-gray-600">{creatorName}</span>
                                </div>
                                <span className={`tag ${job.status === 'OPEN' ? 'tag-orange' : 'bg-gray-100 text-gray-600'}`}>
                                    {job.status}
                                </span>
                                <span className="tag bg-blue-50 text-blue-700">{job.category}</span>
                                {job.resume_required && (
                                    <span className="tag bg-purple-50 text-purple-700">
                                        <FileText className="w-3 h-3" />
                                        Resume Required
                                    </span>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {/* Description */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
                    </div>

                    {/* Tags */}
                    {job.tags.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.tags.map(tag => (
                                    <span key={tag} className="tag">
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Calendar className="w-4 h-4" />
                        Posted {new Date(job.created_at).toLocaleDateString()}
                    </div>

                    {/* Applications (for creator) */}
                    {isCreator && applications && applications.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Applications ({applications.length})
                            </h3>
                            <div className="space-y-3">
                                {applications.map((app: Application) => (
                                    <div key={app.id} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm text-gray-700">{app.pitch}</p>
                                            <span className={`tag text-xs ${app.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                                                    app.status === 'ACCEPTED' ? 'bg-green-50 text-green-700' :
                                                        'bg-red-50 text-red-700'
                                                }`}>{app.status}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(app.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Apply Form (for non-creators) */}
                    {!isCreator && showApplyForm && (
                        <div className="p-4 bg-orange-50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Your Pitch</h3>
                            <textarea
                                value={pitch}
                                onChange={(e) => setPitch(e.target.value)}
                                placeholder="Tell them why you're perfect for this gig..."
                                className="input-clean resize-none mb-3"
                                rows={4}
                                required
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => applyMutation.mutate()}
                                    disabled={!pitch.trim() || applyMutation.isPending}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {applyMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Submit Application
                                </button>
                                <button
                                    onClick={() => setShowApplyForm(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-between">
                    {isCreator ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => deleteMutation.mutate()}
                                disabled={deleteMutation.isPending}
                                className="btn-secondary text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                            {job.status === 'OPEN' && (
                                <button
                                    onClick={() => updateStatusMutation.mutate('COMPLETED')}
                                    disabled={updateStatusMutation.isPending}
                                    className="btn-secondary text-green-600 hover:bg-green-50 flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark Complete
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            {!showApplyForm && job.status === 'OPEN' && (
                                <button
                                    onClick={() => setShowApplyForm(true)}
                                    className="btn-primary"
                                >
                                    Apply Now
                                </button>
                            )}
                            <button className="btn-secondary flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                Message Creator
                            </button>
                        </div>
                    )}
                    <button onClick={onClose} className="btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
