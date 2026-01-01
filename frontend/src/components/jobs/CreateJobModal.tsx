import { useState } from 'react'
import { createPortal } from 'react-dom'
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

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-backdrop"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 animate-modal-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Post a New Gig</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Share what you need help with</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                        <input
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="input-clean"
                            placeholder="e.g. Need help with Calculus II"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                            <input
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                                className="input-clean"
                                placeholder="math, tutoring"
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Comma separated</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="input-clean cursor-pointer"
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

                    <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <input
                            type="checkbox"
                            id="resumeRequired"
                            checked={resumeRequired}
                            onChange={e => setResumeRequired(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <label htmlFor="resumeRequired" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
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
                            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
        </div>,
        document.body
    )
}

