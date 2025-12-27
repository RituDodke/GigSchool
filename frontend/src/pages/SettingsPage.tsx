import { Bell, Moon, Shield, ChevronRight } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="card divide-y divide-gray-100">
                {/* Notifications */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Notifications</p>
                            <p className="text-sm text-gray-500">Manage notification preferences</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Appearance */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Moon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Appearance</p>
                            <p className="text-sm text-gray-500">Customize how the app looks</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Privacy */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Privacy & Security</p>
                            <p className="text-sm text-gray-500">Control your account security</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            {/* Danger Zone */}
            <div className="card p-4 mt-6 border-red-100">
                <h3 className="text-sm font-medium text-red-600 mb-3">Danger Zone</h3>
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                    Delete Account
                </button>
            </div>
        </div>
    )
}
