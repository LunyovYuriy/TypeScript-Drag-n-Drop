import { Project } from '../models/project.js';
import IDraggable from '../interfaces/IDraggable.js';
import autobind from '../decorators/autobind.js';
import Component from './Component.js';

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements IDraggable {
  private project: Project;

  get persons() {
    if (this.project.people === 1) {
      return '1 person';
    }
    return `${this.project.people} persons`;
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent) {
    const { dataTransfer } = event;

    dataTransfer?.setData('text/plain', this.project.id);
    if (dataTransfer?.effectAllowed) {
      dataTransfer.effectAllowed = 'move';
    }
  }

  // eslint-disable-next-line class-methods-use-this
  dragEndHandler() {
    console.log('dragEnd');
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  renderContent() {
    const h2Element = this.element.querySelector('h2') || undefined;
    const h3Element = this.element.querySelector('h3') || undefined;
    const pElement = this.element.querySelector('p') || undefined;

    if (h2Element) {
      h2Element.textContent = this.project.title;
    }
    if (h3Element) {
      h3Element.textContent = `${this.persons} assigned`;
    }
    if (pElement) {
      pElement.textContent = this.project.description;
    }
  }
}

export default ProjectItem;
