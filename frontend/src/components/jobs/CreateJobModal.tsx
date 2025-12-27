import { useState } from 'react'
import { X, Loader2, Plus, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { jobsApi } from '@/api/jobs'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreateJobModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CreateJobModal({ isOpen, onClose }: CreateJobModalProps) {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState('')
    const [groupId, setGroupId] = useState('general')

    const createJobMutation = useMutation({
        mutationFn: jobsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
            onClose()
            // Reset form
            setTitle('')
            setDescription('')
            setTags('')
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        createJobMutation.mutate({
            title,
            description,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            group_id: groupId,
            creator_id: user.id
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg glass-card p-8 animate-fade-in-up overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Post a New Gig</h2>
                        <p className="text-sm text-slate-400">Share what you need help with</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                        <input
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="input-premium"
                            placeholder="e.g. Need help with Calculus II"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                        <textarea
                            required
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                            className="input-premium resize-none"
                            placeholder="Describe what you need help with in detail..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
                            <input
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                                className="input-premium"
                                placeholder="math, tutoring"
                            />
                            <p className="text-xs text-slate-500 mt-1">Comma separated</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                            <select
                                value={groupId}
                                onChange={e => setGroupId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl transition-all duration-300 bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 hover:border-white/20 appearance-none cursor-pointer"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                            >
                                <option value="general" className="bg-slate-800 text-white">General</option>
                                <option value="tutoring" className="bg-slate-800 text-white">Tutoring</option>
                                <option value="design" className="bg-slate-800 text-white">Design</option>
                                <option value="coding" className="bg-slate-800 text-white">Coding</option>
                                <option value="writing" className="bg-slate-800 text-white">Writing</option>
                                <option value="other" className="bg-slate-800 text-white">Other</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={createJobMutation.isPending}
                        className="btn-primary w-full flex items-center justify-center gap-2 mt-8"
                    >
                        {createJobMutation.isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5" />
                                Post Gig
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
