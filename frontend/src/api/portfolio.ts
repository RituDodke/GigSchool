import { api } from './client'

export interface PortfolioItem {
    id: string
    user_id: string
    title: string
    description: string | null
    link: string | null
    file_url: string | null
    file_type: 'image' | 'pdf' | 'link'
    created_at: string
}

export interface PortfolioItemCreate {
    title: string
    description?: string
    link?: string
    file_url?: string
    file_type: 'image' | 'pdf' | 'link'
}

export const portfolioApi = {
    getUserPortfolio: async (userId: string) => {
        const response = await api.get<PortfolioItem[]>(`/users/${userId}/portfolio`)
        return response.data
    },

    createItem: async (data: PortfolioItemCreate) => {
        const response = await api.post<PortfolioItem>('/portfolio', data)
        return response.data
    },

    deleteItem: async (itemId: string) => {
        const response = await api.delete(`/portfolio/${itemId}`)
        return response.data
    }
}
