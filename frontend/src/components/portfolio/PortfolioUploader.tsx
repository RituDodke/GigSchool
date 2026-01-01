import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { portfolioApi } from '@/api/portfolio'
import { supabase } from '@/lib/supabase'
import { Loader2, Upload, FileText, Link as LinkIcon, Image as ImageIcon, X, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface PortfolioUploaderProps {
    onClose: () => void
}

export function PortfolioUploader({ onClose }: PortfolioUploaderProps) {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [type, setType] = useState<'image' | 'pdf' | 'link'>('image')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [link, setLink] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    const createMutation = useMutation({
        mutationFn: portfolioApi.createItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] })
            onClose()
        }
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0]
            // Validate file type
            if (type === 'image' && droppedFile.type.startsWith('image/')) {
                setFile(droppedFile)
            } else if (type === 'pdf' && droppedFile.type === 'application/pdf') {
                setFile(droppedFile)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        let fileUrl = null

        if (type !== 'link' && file) {
            setUploading(true)
            try {
                const fileExt = file.name.split('.').pop()
                const fileName = `${user.id}/${Date.now()}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('portfolios')
                    .upload(fileName, file)

                if (uploadError) throw uploadError

                const { data } = supabase.storage
                    .from('portfolios')
                    .getPublicUrl(fileName)

                fileUrl = data.publicUrl
            } catch (error) {
                console.error('Upload failed:', error)
                alert(`File upload failed: ${(error as Error).message}`)
                setUploading(false)
                return
            }
            setUploading(false)
        }

        createMutation.mutate({
            title,
            description,
            link: type === 'link' ? link : undefined,
            file_url: fileUrl || undefined,
            file_type: type
        })
    }

    const typeOptions = [
        { value: 'image', label: 'Image', icon: ImageIcon, color: 'green' },
        { value: 'pdf', label: 'PDF', icon: FileText, color: 'red' },
        { value: 'link', label: 'Link', icon: LinkIcon, color: 'blue' },
    ] as const

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Add Portfolio Item</h3>

            {/* Type Selector */}
            <div className="flex gap-2 mb-6">
                {typeOptions.map((option) => {
                    const Icon = option.icon
                    const isActive = type === option.value
                    return (
                        <button
                            key={option.value}
                            onClick={() => setType(option.value)}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 font-medium ${isActive
                                    ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 shadow-sm'
                                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500 dark:text-orange-400' : ''}`} />
                            {option.label}
                        </button>
                    )
                })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                    <input
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="input-clean"
                        placeholder="Project Title"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="input-clean resize-none"
                        rows={3}
                        placeholder="Brief description of your project..."
                    />
                </div>

                {type === 'link' ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">URL</label>
                        <input
                            required
                            type="url"
                            value={link}
                            onChange={e => setLink(e.target.value)}
                            className="input-clean"
                            placeholder="https://..."
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">File</label>
                        <div
                            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragging
                                    ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                                    : file
                                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={type === 'image' ? "image/*" : ".pdf"}
                                className="hidden"
                                onChange={handleFileChange}
                                required={!file}
                            />
                            {file ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="text-left">
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block">{file.name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setFile(null)
                                        }}
                                        className="p-1.5 hover:bg-green-200 dark:hover:bg-green-800/50 rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-gray-500 dark:text-gray-400">
                                    <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                                        <Upload className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {isDragging ? 'Drop your file here' : 'Click or drag to upload'}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                        {type === 'image' ? 'PNG, JPG, GIF up to 10MB' : 'PDF up to 10MB'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={createMutation.isPending || uploading}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                        {(createMutation.isPending || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                        {uploading ? 'Uploading...' : 'Save Item'}
                    </button>
                </div>
            </form>
        </div>
    )
}

