import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DocumentCategory = 'proposal' | 'report' | 'budget' | 'contract' | 'other'

export interface Document {
  id: string
  name: string
  category: DocumentCategory
  projectId: string
  projectName: string
  size: number
  type: string
  uploadedBy: string
  uploadedAt: string
  url: string
  description?: string
}

export const useDocumentsStore = defineStore('documents', () => {
  // State
  const documents = ref<Document[]>([])
  const isLoading = ref(false)

  // Actions
  const fetchDocuments = async (projectId?: string) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data
      documents.value = [
        {
          id: '1',
          name: 'Project Proposal.pdf',
          category: 'proposal',
          projectId: '1',
          projectName: 'Digital Transformation Initiative',
          size: 2500000,
          type: 'application/pdf',
          uploadedBy: 'Juan Dela Cruz',
          uploadedAt: '2024-01-15T10:30:00',
          url: '#',
          description: 'Initial project proposal document'
        },
        {
          id: '2',
          name: 'Q1 Progress Report.docx',
          category: 'report',
          projectId: '1',
          projectName: 'Digital Transformation Initiative',
          size: 1800000,
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          uploadedBy: 'Maria Santos',
          uploadedAt: '2024-01-18T14:20:00',
          url: '#',
          description: 'First quarter progress report'
        },
        {
          id: '3',
          name: 'Budget Breakdown.xlsx',
          category: 'budget',
          projectId: '1',
          projectName: 'Digital Transformation Initiative',
          size: 950000,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          uploadedBy: 'Pedro Garcia',
          uploadedAt: '2024-01-12T09:15:00',
          url: '#',
          description: 'Detailed budget allocation'
        },
        {
          id: '4',
          name: 'Research Framework.pdf',
          category: 'proposal',
          projectId: '2',
          projectName: 'Research and Development Program',
          size: 3200000,
          type: 'application/pdf',
          uploadedBy: 'Alice Tan',
          uploadedAt: '2024-01-20T11:45:00',
          url: '#'
        },
        {
          id: '5',
          name: 'Contract Agreement.pdf',
          category: 'contract',
          projectId: '2',
          projectName: 'Research and Development Program',
          size: 1500000,
          type: 'application/pdf',
          uploadedBy: 'Admin',
          uploadedAt: '2024-01-10T16:30:00',
          url: '#',
          description: 'Signed contract with vendors'
        }
      ]

      if (projectId) {
        documents.value = documents.value.filter(d => d.projectId === projectId)
      }

      return { success: true }
    } catch (error) {
      console.error('Fetch documents error:', error)
      return { success: false, error: 'Failed to fetch documents' }
    } finally {
      isLoading.value = false
    }
  }

  const uploadDocument = async (documentData: Omit<Document, 'id' | 'uploadedAt' | 'url'>) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call for file upload
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newDocument: Document = {
        ...documentData,
        id: Date.now().toString(),
        uploadedAt: new Date().toISOString(),
        url: '#' // In real app, this would be the uploaded file URL
      }
      
      documents.value.push(newDocument)
      
      return { success: true, data: newDocument }
    } catch (error) {
      console.error('Upload document error:', error)
      return { success: false, error: 'Failed to upload document' }
    } finally {
      isLoading.value = false
    }
  }

  const deleteDocument = async (id: string) => {
    isLoading.value = true
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = documents.value.findIndex(d => d.id === id)
      if (index !== -1) {
        documents.value.splice(index, 1)
        return { success: true }
      }
      
      return { success: false, error: 'Document not found' }
    } catch (error) {
      console.error('Delete document error:', error)
      return { success: false, error: 'Failed to delete document' }
    } finally {
      isLoading.value = false
    }
  }

  const downloadDocument = async (id: string) => {
    const document = documents.value.find(d => d.id === id)
    if (document) {
      // TODO: In real app, this would download the actual file
      console.log('Downloading:', document.name)
      // Simulate download
      alert(`Downloading: ${document.name}`)
      return { success: true }
    }
    return { success: false, error: 'Document not found' }
  }

  return {
    // State
    documents,
    isLoading,
    // Actions
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    downloadDocument
  }
})