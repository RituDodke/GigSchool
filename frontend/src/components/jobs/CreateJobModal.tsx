import { useState } from 'react'
import { X, Loader2, Plus, Briefcase } from 'lucide-react'
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
    const [category, setCategory] = useState('general')
    const [resumeRequired, setResumeRequired] = useState(false)

    const createJobMutation = useMutation({
        mutationFn: jobsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
            onClose()
            setTitle('')
            setDescription('')
            setTags('')
            setCategory('general')
            setResumeRequired(false)
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        createJobMutation.mutate({
            title,
            description,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            category,
            resume_required: resumeRequired,
            group_id: 'general',
            creator_id: user.id
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl p-6 animate-fade-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Post a New Gig</h2>
                        <p className="text-sm text-gray-500">Share what you need help with</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                        <input
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="input-clean"
                            placeholder="e.g. Need help with Calculus II"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea
                            required
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                            className="input-clean resize-none"
                            placeholder="Describe what you need help with..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                            <input
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                                className="input-clean"
                                placeholder="math, tutoring"
                            />
                            <p className="text-xs text-gray-400 mt-1">Comma separated</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="input-clean"
                            >
                                <option value="general">General</option>
                                <option value="tutoring">Tutoring</option>
                                <option value="design">Design</option>
                                <option value="coding">Coding</option>
                                <option value="writing">Writing</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            id="resumeRequired"
                            checked={resumeRequired}
                            onChange={e => setResumeRequired(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <label htmlFor="resumeRequired" className="text-sm text-gray-700">
                            Require resume/portfolio from applicants
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createJobMutation.isPending}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {createJobMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Post Gig
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
