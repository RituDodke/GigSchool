import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi, Job } from '@/api/jobs'
import { JobCard } from './JobCard'
import { CreateJobModal } from './CreateJobModal'
import { JobDetailModal } from './JobDetailModal'
import { Plus, Search, Briefcase, ArrowUpDown, FileText, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const CATEGORIES = ['all', 'coding', 'tutoring', 'design', 'writing', 'general', 'other'] as const
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
] as const

// Loading skeleton component for cards
function JobCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 animate-pulse">
            {/* Header skeleton */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 ml-3" />
            </div>
            {/* Creator skeleton */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
            {/* Description skeleton */}
            <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            </div>
            {/* Tags skeleton */}
            <div className="flex gap-1.5 mb-4">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-14" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-16" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-12" />
            </div>
            {/* Footer skeleton */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24" />
            </div>
        </div>
    )
}

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
            <div className="space-y-6">
                {/* Skeleton for actions bar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full sm:w-80 animate-pulse" />
                    <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse" />
                </div>
                {/* Skeleton for filters */}
                <div className="flex flex-wrap items-center gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse" />
                    ))}
                </div>
                {/* Skeleton grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <JobCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800/90 rounded-2xl border border-red-100 dark:border-red-900/30 p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to load gigs</h3>
                <p className="text-red-600 dark:text-red-400 text-sm">Something went wrong. Please try again later.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                {/* Enhanced Search */}
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search gigs by title, description, or tags..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 dark:focus:border-orange-500 transition-all duration-200 shadow-sm"
                    />
                </div>

                {/* Enhanced CTA Button */}
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                    Post a Gig
                </button>
            </div>

            {/* Enhanced Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
                {CATEGORIES.map(category => (
                    <button
                        key={category}
                        onClick={() => setCategoryFilter(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${categoryFilter === category
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:text-orange-600 dark:hover:text-orange-400'
                            }`}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}

                {/* Divider */}
                <div className="w-px h-7 bg-gray-200 dark:bg-gray-700 mx-1" />

                {/* Enhanced Sort Dropdown */}
                <div className="relative">
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                        className="appearance-none pl-9 pr-4 py-2 rounded-full text-sm font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-200"
                    >
                        {SORT_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Resume Required Filter */}
                <button
                    onClick={() => setResumeRequiredFilter(!resumeRequiredFilter)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${resumeRequiredFilter
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:text-orange-600 dark:hover:text-orange-400'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    Resume Required
                </button>
            </div>

            {/* Results Count */}
            {filteredJobs && filteredJobs.length > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredJobs.length}</span> gig{filteredJobs.length !== 1 ? 's' : ''}
                    {categoryFilter !== 'all' && (
                        <span> in <span className="font-medium text-orange-600 dark:text-orange-400">{categoryFilter}</span></span>
                    )}
                </div>
            )}

            {/* Grid */}
            {filteredJobs && filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                <div className="bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center shadow-lg shadow-orange-500/10">
                        <Sparkles className="w-8 h-8 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No gigs found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                        {search || categoryFilter !== 'all'
                            ? "Try adjusting your filters or search terms to find what you're looking for."
                            : "Be the first to post a gig and connect with talented students!"
                        }
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
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

