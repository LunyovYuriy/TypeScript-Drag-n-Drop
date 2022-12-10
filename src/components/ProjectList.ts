import { Project, ProjectStatus } from '../models/project';
import ProjectStateInstance from '../state/ProjectState';
import IDragTarget from '../interfaces/IDragTarget';
import autobind from '../decorators/autobind';
import Component from './Component';
import ProjectItem from './ProjectItem';

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements IDragTarget {
  assignedProjects?: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);

    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent) {
    if (event?.dataTransfer && event?.dataTransfer?.types?.[0] === 'text/plain') {
      event.preventDefault();
      const listElement = this.element.querySelector('ul');
      listElement?.classList.add('droppable');
    }
  }

  @autobind
  dropHandler(event: DragEvent) {
    const projectId = event?.dataTransfer?.getData('text/plain');

    if (projectId) {
      ProjectStateInstance.moveProject(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }
  }

  @autobind
  dragLeaveHandler() {
    const listElement = this.element.querySelector('ul');
    listElement?.classList.remove('droppable');
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    ProjectStateInstance.addListener((projects: Project[]) => {
      const relevantProjects = projects
        .filter((project) => {
          if (this.type === 'active') {
            return project.status === ProjectStatus.Active;
          }
          return project.status === ProjectStatus.Finished;
        });

      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const titleElement = this.element.querySelector('h2');
    if (titleElement) {
      titleElement.textContent = `${this.type} projects`.toUpperCase();
    }

    const listElement = this.element.querySelector('ul');
    const listId = `${this.type}-projects-list`;

    if (listElement) {
      listElement.id = listId;
    }
  }

  private renderProjects() {
    const listElement = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`);
    listElement.innerHTML = '' ?? null;

    const ulElementId = this.element.querySelector('ul')?.id;

    this.assignedProjects?.forEach((projectItem) => {
      if (ulElementId) {
        (() => new ProjectItem(ulElementId, projectItem))();
      }
    });
  }
}

export default ProjectList;
