import { useAuthStore } from '@/stores/authStore'
import { User, Mail, Calendar, Edit2 } from 'lucide-react'

export default function ProfilePage() {
    const { user } = useAuthStore()

    return (
        <div className="max-w-2xl mx-auto">
            <div className="card p-6">
                {/* Avatar & Name */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-2xl font-semibold">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{user?.email?.split('@')[0]}</h2>
                        <p className="text-sm text-gray-500">Student</p>
                    </div>
                    <button className="ml-auto btn-secondary flex items-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                </div>

                {/* Info */}
                <div className="space-y-4 pt-6 border-t border-gray-100">
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

                    <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">User ID</p>
                            <p className="text-gray-900 text-sm font-mono">{user?.id}</p>
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
