import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Loader2, ArrowRight, Briefcase, User, Mail, Lock, Sparkles } from 'lucide-react'

export default function AuthPage() {
    const navigate = useNavigate()
    const { signInWithEmail, signUpWithEmail } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState('')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        try {
            if (isLogin) {
                await signInWithEmail(email, password)
                navigate('/')
            } else {
                await signUpWithEmail(email, password, username)
                alert('Check your email for confirmation!')
            }
        } catch (error: any) {
            setError(error.message || 'Authentication failed')
        } finally {
            setIsLoading(false)
        }
    }

    const toggleMode = () => {
        setIsLogin(!isLogin)
        setError('')
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

            {/* Floating gradient orbs */}
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-300/10 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                {/* Glassmorphism Card */}
                <div
                    className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl shadow-orange-500/10 p-8 transition-all duration-500 hover:shadow-orange-500/20"
                    style={{
                        animation: 'fadeInUp 0.6s ease-out'
                    }}
                >
                    {/* Logo with glow effect */}
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-orange-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                                    <Briefcase className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                GigSchool
                            </span>
                        </div>
                    </div>

                    {/* Title with animation */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium mb-4">
                            <Sparkles className="w-3 h-3" />
                            {isLogin ? 'Welcome back!' : 'Join the community'}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-all duration-300">
                            {isLogin ? 'Sign in to your account' : 'Create your account'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            {isLogin ? 'Enter your credentials to continue' : 'Start your freelancing journey today'}
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-fade-in flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username field - only for signup */}
                        <div
                            className={`transition-all duration-500 overflow-hidden ${!isLogin ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Username
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="text"
                                    required={!isLogin}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-300 text-gray-900 dark:text-white placeholder:text-gray-400"
                                    placeholder="johndoe"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-300 text-gray-900 dark:text-white placeholder:text-gray-400"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-orange-500 focus:bg-white dark:focus:bg-gray-700 outline-none transition-all duration-300 text-gray-900 dark:text-white placeholder:text-gray-400"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative w-full py-4 rounded-xl font-semibold text-white overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 mt-2"
                        >
                            {/* Button gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:from-orange-600 group-hover:to-orange-700 transition-all duration-300" />

                            {/* Shine effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </div>

                            {/* Button content */}
                            <span className="relative flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {isLogin ? 'Signing in...' : 'Creating account...'}
                                    </>
                                ) : (
                                    <>
                                        {isLogin ? 'Sign in' : 'Create account'}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">OR</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
                    </div>

                    {/* Toggle */}
                    <div className="text-center">
                        <button
                            onClick={toggleMode}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-300"
                        >
                            {isLogin ? (
                                <>Don't have an account? <span className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">Sign up free</span></>
                            ) : (
                                <>Already have an account? <span className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">Sign in</span></>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
                    By continuing, you agree to our{' '}
                    <a href="#" className="text-orange-600 dark:text-orange-400 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-orange-600 dark:text-orange-400 hover:underline">Privacy Policy</a>
                </p>
            </div>

            {/* CSS for custom animation */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}

