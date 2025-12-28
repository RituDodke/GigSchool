import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { portfolioApi } from '@/api/portfolio'
import { supabase } from '@/lib/supabase' // Assuming this exists, verify later
import { Loader2, Upload, FileText, Link as LinkIcon, Image as ImageIcon, X } from 'lucide-react'
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

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Add Portfolio Item</h3>

            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setType('image')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border ${type === 'image' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    Image
                </button>
                <button
                    onClick={() => setType('pdf')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border ${type === 'pdf' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    PDF
                </button>
                <button
                    onClick={() => setType('link')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border ${type === 'link' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <LinkIcon className="w-4 h-4" />
                    Link
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="input-clean"
                        placeholder="Project Title"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="input-clean resize-none"
                        rows={3}
                        placeholder="Brief description..."
                    />
                </div>

                {type === 'link' ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
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
                                <div className="flex items-center justify-center gap-2 text-green-600">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm font-medium">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setFile(null)
                                        }}
                                        className="p-1 hover:bg-green-100 rounded-full"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm">Click to upload {type === 'image' ? 'image' : 'PDF'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex gap-2 pt-2">
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
                        Save Item
                    </button>
                </div>
            </form>
        </div>
    )
}
