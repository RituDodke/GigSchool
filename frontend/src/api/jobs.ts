import { api } from './client'

export interface Job {
    id: string
    creator_id: string
    title: string
    description: string
    tags: string[]
    group_id: string
    status: string
    created_at: string
    payload?: any
}

export interface CreateJobData {
    title: string
    description: string
    tags: string[]
    group_id: string
    creator_id: string
}

export const jobsApi = {
    getAll: async (groupId?: string) => {
        const params = groupId ? { group_id: groupId } : {}
        const response = await api.get<Job[]>('/jobs/', { params })
        return response.data
    },

    create: async (data: CreateJobData) => {
        const response = await api.post<Job>('/jobs/', data)
        return response.data
    },

    getOne: async (id: string) => {
        const response = await api.get<Job>(`/jobs/${id}`)
        return response.data
    },

    apply: async (jobId: string, applicantId: string, coverLetter: string) => {
        const response = await api.post(`/jobs/${jobId}/apply`, {
            job_id: jobId,
            applicant_id: applicantId,
            cover_letter: coverLetter,
            status: 'PENDING'
        })
        return response.data
    }
}
