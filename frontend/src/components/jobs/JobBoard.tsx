import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi, Job } from '@/api/jobs'
import { JobCard } from './JobCard'
import { CreateJobModal } from './CreateJobModal'
import { JobDetailModal } from './JobDetailModal'
import { Loader2, Plus, Search, Briefcase, ArrowUpDown, FileText } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const CATEGORIES = ['all', 'coding', 'tutoring', 'design', 'writing', 'general', 'other'] as const
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
] as const

export function JobBoard() {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
    const [resumeRequiredFilter, setResumeRequiredFilter] = useState(false)

    const { data: jobs, isLoading, error } = useQuery<Job[]>({
        queryKey: ['jobs'],
        queryFn: () => jobsApi.getAll()
    })

    // Get user's applications to check which jobs they've applied to
    const { data: userApplications } = useQuery({
        queryKey: ['myApplications', user?.id],
        queryFn: () => jobsApi.getUserApplications(user!.id),
        enabled: !!user,
    })

    // Get user's bookmarks
    const { data: userBookmarks } = useQuery({
        queryKey: ['bookmarks', user?.id],
        queryFn: () => jobsApi.getBookmarks(user!.id),
        enabled: !!user,
    })

    const bookmarkedJobIds = new Set(userBookmarks?.map(b => b.job_id) || [])

    // Bookmark mutation
    const bookmarkMutation = useMutation({
        mutationFn: async (jobId: string) => {
            if (!user) return
            if (bookmarkedJobIds.has(jobId)) {
                await jobsApi.removeBookmark(user.id, jobId)
            } else {
                await jobsApi.addBookmark(user.id, jobId)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] })
        }
    })

    const handleBookmark = (jobId: string) => {
        bookmarkMutation.mutate(jobId)
    }

    const appliedJobIds = new Set(userApplications?.map(app => app.job_id) || [])

    const filteredJobs = jobs?.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
            job.description.toLowerCase().includes(search.toLowerCase()) ||
            job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))

        const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter
        const matchesResume = !resumeRequiredFilter || job.resume_required === true

        return matchesSearch && matchesCategory && matchesResume
    })?.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="mt-4 text-gray-500">Loading gigs...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="card p-8 text-center">
                <p className="text-red-600">Error loading jobs. Please try again later.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search gigs..."
                        className="input-clean pl-10"
                    />
                </div>

                {/* CTA Button */}
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Post a Gig
                </button>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
                {CATEGORIES.map(category => (
                    <button
                        key={category}
                        onClick={() => setCategoryFilter(category)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${categoryFilter === category
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                        className="appearance-none pl-8 pr-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        {SORT_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Resume Required Filter */}
                <button
                    onClick={() => setResumeRequiredFilter(!resumeRequiredFilter)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${resumeRequiredFilter
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    Resume Required
                </button>
            </div>

            {/* Grid */}
            {filteredJobs && filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredJobs.map((job, index) => (
                        <div
                            key={job.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <JobCard
                                job={job}
                                onApply={() => setSelectedJob(job)}
                                onClick={(job) => setSelectedJob(job)}
                                hasApplied={appliedJobIds.has(job.id)}
                                isBookmarked={bookmarkedJobIds.has(job.id)}
                                onBookmark={handleBookmark}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card p-12 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No gigs found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                        We couldn't find any gigs. Be the first to post one!
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Post the First Gig
                    </button>
                </div>
            )}

            <CreateJobModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <JobDetailModal
                job={selectedJob}
                isOpen={!!selectedJob}
                onClose={() => setSelectedJob(null)}
            />
        </div>
    )
}

