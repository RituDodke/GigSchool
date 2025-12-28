import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { usersApi } from '@/api/users'
import { jobsApi, Job, Application } from '@/api/jobs'
import { supabase } from '@/lib/supabase'
import { JobDetailModal } from '@/components/jobs/JobDetailModal'
import { User, Mail, Calendar, Edit2, Camera, Loader2, Check, X, Briefcase, Send, Eye } from 'lucide-react'

export default function ProfilePage() {
    const { user, profile, refreshProfile } = useAuthStore()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [username, setUsername] = useState(profile?.username || '')
    const [activeTab, setActiveTab] = useState<'gigs' | 'applications'>('gigs')
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

    const handleSave = async () => {
        if (!user) return
        setIsSaving(true)
        try {
            await usersApi.updateUser(user.id, { username })
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
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative group">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-2xl font-semibold">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            {isUploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </div>
                    <div className="flex-1">
                        {isEditing ? (
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-clean text-xl font-semibold"
                                placeholder="Enter username"
                            />
                        ) : (
                            <h2 className="text-xl font-semibold text-gray-900">{displayName}</h2>
                        )}
                        <p className="text-sm text-gray-500">Student</p>
                    </div>
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button onClick={handleSave} disabled={isSaving} className="btn-primary flex items-center gap-2">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Save
                            </button>
                            <button onClick={() => { setIsEditing(false); setUsername(profile?.username || '') }} className="btn-secondary">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2">
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </button>
                    )}
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
            <div className="grid grid-cols-3 gap-4">
                <div className="card p-4 text-center">
                    <p className="text-2xl font-semibold text-gray-900">{myGigs.length}</p>
                    <p className="text-sm text-gray-500">Gigs Posted</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-semibold text-gray-900">{myApplications.length}</p>
                    <p className="text-sm text-gray-500">Applications</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-semibold text-gray-900">{completedGigs}</p>
                    <p className="text-sm text-gray-500">Completed</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="card overflow-hidden">
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('gigs')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'gigs' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Briefcase className="w-4 h-4 inline mr-2" />
                        My Gigs ({myGigs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'applications' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Send className="w-4 h-4 inline mr-2" />
                        My Applications ({myApplications.length})
                    </button>
                </div>

                <div className="p-4">
                    {activeTab === 'gigs' ? (
                        myGigs.length > 0 ? (
                            <div className="space-y-3">
                                {myGigs.map(gig => (
                                    <div key={gig.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{gig.title}</h4>
                                            <p className="text-sm text-gray-500">{gig.category} • {new Date(gig.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`tag text-xs ${gig.status === 'OPEN' ? 'tag-orange' : gig.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
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
                            <div className="text-center py-8 text-gray-500">
                                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>You haven't posted any gigs yet</p>
                            </div>
                        )
                    ) : (
                        myApplications.length > 0 ? (
                            <div className="space-y-3">
                                {myApplications.map(app => (
                                    <div key={app.id} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-700 line-clamp-2">{app.pitch}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(app.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`tag text-xs ${app.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                                                app.status === 'ACCEPTED' ? 'bg-green-50 text-green-700' :
                                                    'bg-red-50 text-red-700'
                                                }`}>{app.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Send className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>You haven't applied to any gigs yet</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            <JobDetailModal
                job={selectedGig}
                isOpen={!!selectedGig}
                onClose={() => setSelectedGig(null)}
            />
        </div>
    )
}
