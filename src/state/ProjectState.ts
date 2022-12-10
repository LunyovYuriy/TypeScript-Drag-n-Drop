import { Project, ProjectStatus } from '../models/project';
import State from './State';

class ProjectState extends State<Project> {
  private projects: Project[] = [];

  private static instance: ProjectState;

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      `${Math.random()}-${Math.random()}-${Math.random()}-${Math.random()}`,
      title,
      description,
      people,
      ProjectStatus.Active,
    );

    this.projects.push(newProject);
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const currentProject = this.projects.find((project) => project.id === projectId);
    if (currentProject && currentProject.status !== newStatus) {
      currentProject.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    this.listeners.forEach((listenerFn) => listenerFn([...this.projects]));
  }
}

const ProjectStateInstance = ProjectState.getInstance();
export default ProjectStateInstance;
