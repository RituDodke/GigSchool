import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { usersApi } from '@/api/users'
import { jobsApi, Job, Application } from '@/api/jobs'
import { portfolioApi, PortfolioItem } from '@/api/portfolio'
import { supabase } from '@/lib/supabase'
import { JobDetailModal } from '@/components/jobs/JobDetailModal'
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid'
import { PortfolioUploader } from '@/components/portfolio/PortfolioUploader'
import { User, Mail, Calendar, Edit2, Camera, Loader2, Check, X, Briefcase, Send, Eye, Bookmark, LayoutGrid, Plus } from 'lucide-react'

export default function ProfilePage() {
    const { user, profile, refreshProfile } = useAuthStore()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [showPortfolioUploader, setShowPortfolioUploader] = useState(false)
    const [username, setUsername] = useState(profile?.username || '')
    const [activeTab, setActiveTab] = useState<'gigs' | 'applications' | 'saved' | 'portfolio'>('gigs')
    const [selectedGig, setSelectedGig] = useState<Job | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Fetch user's posted gigs
    const { data: myGigs = [] } = useQuery<Job[]>({
        queryKey: ['myGigs', user?.id],
        queryFn: () => jobsApi.getByCreator(user!.id),
        enabled: !!user,
    })

    // Fetch user's applications
    const { data: myApplications = [] } = useQuery<Application[]>({
        queryKey: ['myApplications', user?.id],
        queryFn: () => jobsApi.getUserApplications(user!.id),
        enabled: !!user,
    })

    // Fetch user's bookmarks with job details
    const { data: myBookmarks = [] } = useQuery({
        queryKey: ['bookmarks', user?.id],
        queryFn: () => jobsApi.getBookmarks(user!.id),
        enabled: !!user,
    })

    // Fetch user's portfolio
    const { data: myPortfolio = [] } = useQuery<PortfolioItem[]>({
        queryKey: ['portfolio', user?.id],
        queryFn: () => portfolioApi.getUserPortfolio(user!.id),
        enabled: !!user,
    })

    // Get all jobs to display bookmark details
    const { data: allJobs = [] } = useQuery<Job[]>({
        queryKey: ['jobs'],
        queryFn: () => jobsApi.getAll(),
        enabled: myBookmarks.length > 0,
    })

    const savedJobs = allJobs.filter(job => myBookmarks.some(b => b.job_id === job.id))

    const [bio, setBio] = useState(profile?.bio || '')
    const [skills, setSkills] = useState(profile?.skills?.join(', ') || '')

    // ... (rest of state items are unchanged, but we need to ensure useEffect updates state so keeping it below)

    const handleSave = async () => {
        if (!user) return
        setIsSaving(true)
        try {
            const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s)
            await usersApi.updateUser(user.id, {
                username,
                bio,
                skills: skillsArray
            })
            await refreshProfile()
            setIsEditing(false)
        } catch (error) {
            console.error('Failed to update profile:', error)
            alert('Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const filePath = `avatars/${user.id}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            await usersApi.updateUser(user.id, { avatar_url: publicUrl })
            await refreshProfile()
        } catch (error) {
            console.error('Failed to upload avatar:', error)
            alert('Failed to upload avatar')
        } finally {
            setIsUploading(false)
        }
    }

    const displayName = profile?.username || user?.email?.split('@')[0] || 'User'
    const avatarUrl = profile?.avatar_url

    const completedGigs = myGigs.filter(g => g.status === 'COMPLETED').length

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Card */}
            <div className="card p-6">
                <div className="flex items-start gap-4 mb-6"> {/* Changed items-center to items-start for Bio layout */}
                    <div className="relative group shrink-0">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-3xl font-semibold">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1 w-full">
                                {isEditing ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-200">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Display Name</label>
                                            <input
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="input-clean text-xl font-semibold w-full"
                                                placeholder="Enter username"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Bio</label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                className="input-clean text-sm w-full resize-none"
                                                rows={2}
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Skills (comma separated)</label>
                                            <input
                                                value={skills}
                                                onChange={(e) => setSkills(e.target.value)}
                                                className="input-clean text-sm w-full"
                                                placeholder="e.g. React, Python, Design"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{displayName}</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Student Developer</p>
                                        </div>
                                        {profile?.bio && (
                                            <p className="text-gray-700 dark:text-gray-300 text-sm max-w-2xl leading-relaxed">
                                                {profile.bio}
                                            </p>
                                        )}
                                        {profile?.skills && profile.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {profile.skills.map((skill, index) => (
                                                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-100 dark:border-orange-800/50">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="ml-4 shrink-0">
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <button onClick={handleSave} disabled={isSaving} className="btn-primary flex items-center gap-2 shadow-sm">
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            Save
                                        </button>
                                        <button onClick={() => { setIsEditing(false); setUsername(profile?.username || '') }} className="btn-secondary">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => {
                                        setBio(profile?.bio || '')
                                        setSkills(profile?.skills?.join(', ') || '')
                                        setIsEditing(true)
                                    }} className="btn-secondary flex items-center gap-2">
                                        <Edit2 className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">Username</p>
                            <p className="text-gray-900">{profile?.username || 'Not set'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-gray-900">{user?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">Joined</p>
                            <p className="text-gray-900">{new Date(user?.created_at || '').toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="card p-4 text-center">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{myGigs.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gigs Posted</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{myApplications.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Applications</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{savedJobs.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Saved</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{completedGigs}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="card overflow-hidden">
                <div className="flex border-b border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('gigs')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'gigs' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <Briefcase className="w-4 h-4 inline mr-2" />
                        My Gigs ({myGigs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'applications' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <Send className="w-4 h-4 inline mr-2" />
                        Applications ({myApplications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'saved' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <Bookmark className="w-4 h-4 inline mr-2" />
                        Saved ({savedJobs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('portfolio')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'portfolio' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4 inline mr-2" />
                        Portfolio
                    </button>
                </div>

                <div className="p-4">
                    {activeTab === 'gigs' && (
                        myGigs.length > 0 ? (
                            <div className="space-y-3">
                                {myGigs.map(gig => (
                                    <div key={gig.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{gig.title}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{gig.category} • {new Date(gig.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`tag text-xs ${gig.status === 'OPEN' ? 'tag-orange' : gig.status === 'COMPLETED' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                {gig.status}
                                            </span>
                                            <button
                                                onClick={() => setSelectedGig(gig)}
                                                className="btn-secondary text-sm flex items-center gap-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <p>You haven't posted any gigs yet</p>
                            </div>
                        )
                    )}

                    {activeTab === 'applications' && (
                        myApplications.length > 0 ? (
                            <div className="space-y-3">
                                {myApplications.map(app => (
                                    <div key={app.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{app.pitch}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(app.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`tag text-xs ${app.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                app.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>{app.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Send className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <p>You haven't applied to any gigs yet</p>
                            </div>
                        )
                    )}

                    {activeTab === 'saved' && (
                        savedJobs.length > 0 ? (
                            <div className="space-y-3">
                                {savedJobs.map(job => (
                                    <div key={job.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{job.title}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{job.category} • {new Date(job.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`tag text-xs ${job.status === 'OPEN' ? 'tag-orange' : job.status === 'COMPLETED' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                {job.status}
                                            </span>
                                            <button
                                                onClick={() => setSelectedGig(job)}
                                                className="btn-secondary text-sm flex items-center gap-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Bookmark className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <p>You haven't saved any gigs yet</p>
                            </div>
                        )
                    )}

                    {activeTab === 'portfolio' && (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowPortfolioUploader(true)}
                                    className="btn-primary text-sm flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add Item
                                </button>
                            </div>
                            <PortfolioGrid items={myPortfolio} isOwner={true} />
                        </div>
                    )}
                </div>
            </div>

            <JobDetailModal
                job={selectedGig}
                isOpen={!!selectedGig}
                onClose={() => setSelectedGig(null)}
            />

            {showPortfolioUploader && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowPortfolioUploader(false)} />
                    <div className="relative w-full max-w-lg z-10">
                        <PortfolioUploader onClose={() => setShowPortfolioUploader(false)} />
                    </div>
                </div>
            )}
        </div>
    )
}
