import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PortfolioItem, portfolioApi } from '@/api/portfolio'
import { useAuthStore } from '@/stores/authStore'
import { Trash2, ExternalLink, FileText, X, Eye } from 'lucide-react'

interface PortfolioGridProps {
    items: PortfolioItem[]
    isOwner: boolean
}

export function PortfolioGrid({ items, isOwner }: PortfolioGridProps) {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)

    const deleteMutation = useMutation({
        mutationFn: portfolioApi.deleteItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolio'] })
        }
    })

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirm('Are you sure you want to delete this item?')) {
            deleteMutation.mutate(id)
        }
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No portfolio items yet.</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                    <div
                        key={item.id}
                        className="group relative bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                    >
                        {/* Aspect Ratio Box */}
                        <div className="aspect-video bg-gray-50 relative flex items-center justify-center overflow-hidden">
                            {item.file_type === 'image' && item.file_url ? (
                                <img
                                    src={item.file_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : item.file_type === 'pdf' ? (
                                <FileText className="w-12 h-12 text-gray-300" />
                            ) : (
                                <div className="text-center p-4">
                                    <ExternalLink className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <span className="text-xs text-blue-500 block truncate max-w-[200px]">{item.link}</span>
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <span className="text-white text-sm font-medium flex items-center gap-1">
                                    <Eye className="w-4 h-4" /> View
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-gray-900 truncate pr-4">{item.title}</h4>
                                {isOwner && (
                                    <button
                                        onClick={(e) => handleDelete(item.id, e)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {item.description && (
                                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox / Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedItem(null)} />

                    <div className="relative max-w-4xl w-full bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fade-in">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="font-semibold text-lg">{selectedItem.title}</h3>
                            <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-gray-50 flex-1 flex flex-col items-center justify-center min-h-[300px]">
                            {selectedItem.file_type === 'image' && selectedItem.file_url ? (
                                <img
                                    src={selectedItem.file_url}
                                    alt={selectedItem.title}
                                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm"
                                />
                            ) : selectedItem.file_type === 'pdf' && selectedItem.file_url ? (
                                <div className="text-center">
                                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <a
                                        href={selectedItem.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary inline-flex items-center gap-2"
                                    >
                                        View PDF <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            ) : selectedItem.link ? (
                                <div className="text-center w-full max-w-lg">
                                    <div className="bg-white p-6 rounded-xl border shadow-sm mb-4">
                                        <ExternalLink className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                                        <p className="text-gray-900 font-medium break-all mb-4">{selectedItem.link}</p>
                                        <a
                                            href={selectedItem.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary inline-flex items-center gap-2"
                                        >
                                            Visit Link <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            ) : null}

                            {selectedItem.description && (
                                <div className="mt-8 text-center max-w-2xl bg-white p-4 rounded-lg shadow-sm border">
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedItem.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
