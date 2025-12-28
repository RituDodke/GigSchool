import axios from 'axios'

const API_URL = 'http://localhost:8000/api/v1'

const api = axios.create({
    baseURL: API_URL,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export interface Review {
    id: string
    job_id: string
    reviewer_id: string
    reviewee_id: string
    rating: number
    comment: string | null
    created_at: string
}

export interface ReviewCreate {
    job_id: string
    reviewee_id: string
    rating: number
    comment: string
}

export interface UserStats {
    average_rating: number
    total_reviews: number
}

export const reviewsApi = {
    getUserReviews: async (userId: string) => {
        const response = await api.get<Review[]>(`/reviews/users/${userId}`)
        return response.data
    },

    getUserStats: async (userId: string) => {
        const response = await api.get<UserStats>(`/reviews/users/${userId}/stats`)
        return response.data
    },

    createReview: async (data: ReviewCreate) => {
        const response = await api.post<Review>('/reviews/', data)
        return response.data
    }
}
