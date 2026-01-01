import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PortfolioItem, portfolioApi } from '@/api/portfolio'

import { Trash2, ExternalLink, FileText, X, Eye, FolderOpen } from 'lucide-react'

interface PortfolioGridProps {
    items: PortfolioItem[]
    isOwner: boolean
}

export function PortfolioGrid({ items, isOwner }: PortfolioGridProps) {
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
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 flex items-center justify-center mb-4">
                    <FolderOpen className="w-10 h-10 text-orange-400 dark:text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No portfolio items yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                    {isOwner ? "Add your first project to showcase your work and skills!" : "This user hasn't added any portfolio items yet."}
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                    <div
                        key={item.id}
                        className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5 dark:hover:shadow-orange-500/10 hover:-translate-y-1"
                        onClick={() => setSelectedItem(item)}
                    >
                        {/* Aspect Ratio Box */}
                        <div className="aspect-video bg-gray-50 dark:bg-gray-900 relative flex items-center justify-center overflow-hidden">
                            {item.file_type === 'image' && item.file_url ? (
                                <img
                                    src={item.file_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : item.file_type === 'pdf' ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                                        <FileText className="w-8 h-8 text-red-400 dark:text-red-500" />
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">PDF Document</span>
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
                                        <ExternalLink className="w-6 h-6 text-blue-400 dark:text-blue-500" />
                                    </div>
                                    <span className="text-xs text-blue-500 dark:text-blue-400 block truncate max-w-[200px] font-medium">{item.link}</span>
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 text-sm font-medium rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <Eye className="w-4 h-4" /> View Details
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="flex justify-between items-start gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate flex-1">{item.title}</h4>
                                {isOwner && (
                                    <button
                                        onClick={(e) => handleDelete(item.id, e)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {item.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox / Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-backdrop"
                        onClick={() => setSelectedItem(null)}
                    />

                    <div className="relative max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-modal-in">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{selectedItem.title}</h3>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900 flex-1 flex flex-col items-center justify-center min-h-[300px] modal-scrollbar">
                            {selectedItem.file_type === 'image' && selectedItem.file_url ? (
                                <img
                                    src={selectedItem.file_url}
                                    alt={selectedItem.title}
                                    className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg"
                                />
                            ) : selectedItem.file_type === 'pdf' && selectedItem.file_url ? (
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
                                        <FileText className="w-12 h-12 text-red-400 dark:text-red-500" />
                                    </div>
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
                                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
                                            <ExternalLink className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium break-all mb-6">{selectedItem.link}</p>
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
                                <div className="mt-8 text-center max-w-2xl bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedItem.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
