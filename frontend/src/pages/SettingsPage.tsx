import { Bell, Moon, Sun, Shield, ChevronRight } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'

export default function SettingsPage() {
    const { theme, toggleTheme } = useThemeStore()

    return (
        <div className="max-w-2xl mx-auto">
            <div className="card divide-y divide-gray-100 dark:divide-gray-700">
                {/* Notifications */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage notification preferences</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Dark Mode Toggle */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                            {theme === 'dark' ? (
                                <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            ) : (
                                <Sun className="w-5 h-5 text-purple-600" />
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`relative w-14 h-8 rounded-full transition-colors ${theme === 'dark' ? 'bg-orange-500' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>

                {/* Privacy */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Privacy & Security</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Control your account security</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            {/* Danger Zone */}
            <div className="card p-4 mt-6 border-red-100 dark:border-red-900/30">
                <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
                <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 font-medium">
                    Delete Account
                </button>
            </div>
        </div>
    )
}
