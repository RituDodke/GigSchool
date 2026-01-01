import { Bell, Moon, Sun, Shield, ChevronRight, Settings, AlertTriangle, Trash2 } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'

export default function SettingsPage() {
    const { theme, toggleTheme } = useThemeStore()

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="px-1">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
                        <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your app preferences</p>
                    </div>
                </div>
            </div>

            {/* Main Settings Card */}
            <div className="card divide-y divide-gray-100 dark:divide-gray-700/50 overflow-hidden">
                {/* Notifications */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage notification preferences</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all duration-200" />
                </div>

                {/* Dark Mode Toggle */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/30 flex items-center justify-center">
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
                        className={`relative w-14 h-8 rounded-full transition-all duration-300 shadow-inner ${theme === 'dark'
                                ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                                : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        <span
                            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                                }`}
                        >
                            {theme === 'dark' ? (
                                <Moon className="w-3.5 h-3.5 text-purple-500" />
                            ) : (
                                <Sun className="w-3.5 h-3.5 text-amber-500" />
                            )}
                        </span>
                    </button>
                </div>

                {/* Privacy */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Privacy & Security</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Control your account security</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all duration-200" />
                </div>
            </div>

            {/* Danger Zone */}
            <div className="card overflow-hidden border-red-200/50 dark:border-red-900/30">
                <div className="bg-red-50/50 dark:bg-red-900/10 px-4 py-3 border-b border-red-100 dark:border-red-900/30">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
                        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                    </div>
                </div>
                <div className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 font-medium text-sm group">
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    )
}
