import { useState, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { usersApi } from '@/api/users'
import { supabase } from '@/lib/supabase'
import { User, Mail, Calendar, Edit2, Camera, Loader2, Check, X } from 'lucide-react'

export default function ProfilePage() {
    const { user, profile, refreshProfile } = useAuthStore()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [username, setUsername] = useState(profile?.username || '')
    const fileInputRef = useRef<HTMLInputElement>(null)

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
            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop()
            const filePath = `avatars/${user.id}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Update user profile
            await usersApi.updateUser(user.id, { avatar_url: publicUrl })
            await refreshProfile()
        } catch (error) {
            console.error('Failed to upload avatar:', error)
            alert('Failed to upload avatar. Make sure the "avatars" bucket exists in Supabase Storage.')
        } finally {
            setIsUploading(false)
        }
    }

    const displayName = profile?.username || user?.email?.split('@')[0] || 'User'
    const avatarUrl = profile?.avatar_url

    return (
        <div className="max-w-2xl mx-auto">
            <div className="card p-6">
                {/* Avatar & Name */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative group">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-16 h-16 rounded-full object-cover"
                            />
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
                            {isUploading ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                                <Camera className="w-5 h-5 text-white" />
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />
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
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="btn-primary flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false)
                                    setUsername(profile?.username || '')
                                }}
                                className="btn-secondary"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </button>
                    )}
                </div>

                {/* Info */}
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
            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="card p-4 text-center">
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                    <p className="text-sm text-gray-500">Gigs Posted</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                    <p className="text-sm text-gray-500">Applications</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                    <p className="text-sm text-gray-500">Completed</p>
                </div>
            </div>
        </div>
    )
}

