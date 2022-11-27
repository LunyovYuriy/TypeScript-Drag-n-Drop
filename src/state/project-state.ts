import { Project, ProjectStatus } from '../models/project.js';

type Listener<ListenerItemType> = (item: ListenerItemType[]) => void;

class State<ListenerItemType> {
  protected listeners: Listener<ListenerItemType>[] = [];

  addListener(listenerFn: Listener<ListenerItemType>) {
    this.listeners.push(listenerFn);
  }
}

export class ProjectState extends State<Project> {
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

export const projectState = ProjectState.getInstance();
