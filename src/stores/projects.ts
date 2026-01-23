import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api";

export type ProjectStatus =
  | "draft"
  | "active"
  | "on-hold"
  | "completed"
  | "archived";
export type ProjectPriority = "low" | "medium" | "high" | "critical";

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  projectManager: string;
  department: string;
  teamMembers: string[];
  createdAt: string;
  updatedAt: string;
}

export const useProjectsStore = defineStore("projects", () => {
  // State
  const projects = ref<Project[]>([]);
  const isLoading = ref(false);
  const currentProject = ref<Project | null>(null);

  // Getters
  const activeProjects = computed(() =>
    projects.value.filter((p) => p.status === "active"),
  );

  const completedProjects = computed(() =>
    projects.value.filter((p) => p.status === "completed"),
  );

  const projectsByStatus = computed(() => {
    const grouped: Record<ProjectStatus, Project[]> = {
      draft: [],
      active: [],
      "on-hold": [],
      completed: [],
      archived: [],
    };

    projects.value.forEach((project) => {
      grouped[project.status].push(project);
    });

    return grouped;
  });

  const totalBudget = computed(() =>
    projects.value.reduce((sum, p) => sum + p.budget, 0),
  );

  const totalSpent = computed(() =>
    projects.value.reduce((sum, p) => sum + p.spent, 0),
  );

  // Helper function to map API response to frontend format
  const mapProject = (apiProject: any): Project => ({
    id: apiProject.id?.toString() || "",
    title: apiProject.title || "",
    description: apiProject.description || "",
    status: apiProject.status || "draft",
    priority: apiProject.priority || "medium",
    startDate: apiProject.start_date || "",
    endDate: apiProject.end_date || "",
    budget: parseFloat(apiProject.budget) || 0,
    spent: parseFloat(apiProject.spent) || 0,
    progress: apiProject.progress ?? 0,
    projectManager: apiProject.project_manager || "",
    department: apiProject.department || "",
    teamMembers: Array.isArray(apiProject.team_members)
      ? apiProject.team_members
      : [],
    createdAt: apiProject.created_at || "",
    updatedAt: apiProject.updated_at || "",
  });

  // Actions
  const fetchProjects = async () => {
    isLoading.value = true;
    try {
      const response = await api.get("/projects");
      projects.value = response.data.map(mapProject);
      return { success: true };
    } catch (error: any) {
      console.error("Fetch projects error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch projects",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const fetchProjectById = async (id: string) => {
    isLoading.value = true;
    currentProject.value = null;
    try {
      const response = await api.get(`/projects/${id}`);
      // Handle both direct response and nested data response
      const projectData = response.data.data || response.data;
      currentProject.value = mapProject(projectData);
      return { success: true, data: currentProject.value };
    } catch (error: any) {
      console.error("Fetch project error:", error);
      currentProject.value = null;
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch project",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const createProject = async (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">,
  ) => {
    isLoading.value = true;
    try {
      const payload = {
        title: projectData.title,
        description: projectData.description,
        status: projectData.status,
        priority: projectData.priority,
        start_date: projectData.startDate,
        end_date: projectData.endDate,
        budget: projectData.budget,
        spent: projectData.spent,
        progress: projectData.progress,
        project_manager: projectData.projectManager,
        department: projectData.department,
        team_members: projectData.teamMembers,
      };

      const response = await api.post("/projects", payload);
      const newProject = mapProject(response.data);
      projects.value.push(newProject);

      return { success: true, data: newProject };
    } catch (error: any) {
      console.error("Create project error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create project",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    isLoading.value = true;
    try {
      const payload: any = {};

      if (updates.title) payload.title = updates.title;
      if (updates.description) payload.description = updates.description;
      if (updates.status) payload.status = updates.status;
      if (updates.priority) payload.priority = updates.priority;
      if (updates.startDate) payload.start_date = updates.startDate;
      if (updates.endDate) payload.end_date = updates.endDate;
      if (updates.budget !== undefined) payload.budget = updates.budget;
      if (updates.spent !== undefined) payload.spent = updates.spent;
      if (updates.progress !== undefined) payload.progress = updates.progress;
      if (updates.projectManager)
        payload.project_manager = updates.projectManager;
      if (updates.department) payload.department = updates.department;
      if (updates.teamMembers) payload.team_members = updates.teamMembers;

      const response = await api.put(`/projects/${id}`, payload);
      const updatedProject = mapProject(response.data);

      const index = projects.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        projects.value[index] = updatedProject;
      }

      return { success: true, data: updatedProject };
    } catch (error: any) {
      console.error("Update project error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update project",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const deleteProject = async (id: string) => {
    isLoading.value = true;
    try {
      await api.delete(`/projects/${id}`);

      const index = projects.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        projects.value.splice(index, 1);
      }

      return { success: true };
    } catch (error: any) {
      console.error("Delete project error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete project",
      };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // State
    projects,
    isLoading,
    currentProject,
    // Getters
    activeProjects,
    completedProjects,
    projectsByStatus,
    totalBudget,
    totalSpent,
    // Actions
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
  };
});
