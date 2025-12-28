import { api } from './client'

export interface Creator {
    id: string
    email: string
    username: string | null
    avatar_url: string | null
}

export interface Job {
    id: string
    creator_id: string
    title: string
    description: string
    tags: string[]
    category: string
    resume_required: boolean
    group_id: string
    status: string
    created_at: string
    payload?: any
    creator?: Creator
}

export interface CreateJobData {
    title: string
    description: string
    tags: string[]
    category: string
    resume_required: boolean
    group_id: string
    creator_id: string
}

export interface UpdateJobData {
    title?: string
    description?: string
    tags?: string[]
    category?: string
    resume_required?: boolean
    status?: string
}

export interface Application {
    id: string
    job_id: string
    applicant_id: string
    pitch: string
    status: string
    created_at: string
}

export const jobsApi = {
    getAll: async (groupId?: string) => {
        const params = groupId ? { group_id: groupId } : {}
        const response = await api.get<Job[]>('/jobs/', { params })
        return response.data
    },

    getByCreator: async (creatorId: string) => {
        const response = await api.get<Job[]>('/jobs/', { params: { creator_id: creatorId } })
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

    update: async (id: string, data: UpdateJobData) => {
        const response = await api.patch<Job>(`/jobs/${id}`, data)
        return response.data
    },

    delete: async (id: string) => {
        const response = await api.delete(`/jobs/${id}`)
        return response.data
    },

    apply: async (jobId: string, applicantId: string, pitch: string) => {
        const response = await api.post<Application>(`/jobs/${jobId}/apply`, {
            job_id: jobId,
            applicant_id: applicantId,
            pitch,
            status: 'PENDING'
        })
        return response.data
    },

    getApplications: async (jobId: string) => {
        const response = await api.get<Application[]>(`/jobs/${jobId}/applications`)
        return response.data
    },

    getUserApplications: async (userId: string) => {
        const response = await api.get<Application[]>(`/auth/${userId}/applications`)
        return response.data
    },

    updateApplicationStatus: async (applicationId: string, status: 'ACCEPTED' | 'REJECTED') => {
        const response = await api.patch<Application>(`/jobs/applications/${applicationId}`, { status })
        return response.data
    }
}

