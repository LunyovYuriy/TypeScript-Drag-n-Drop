/* Drag & Drop Interfaces start */
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}
/* Drag & Drop Interfaces end */

/* Project Type */
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus,
  ) {}
}

/* Project State Management start */
type Listener<ListenerItemType> = (item: ListenerItemType[]) => void;

class State<ListenerItemType> {
  protected listeners: Listener<ListenerItemType>[] = [];

  addListener(listenerFn: Listener<ListenerItemType>) {
    this.listeners.push(listenerFn);
  }
}

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

const projectState = ProjectState.getInstance();
/* Project State Management end */

/* Validation start */
interface IValidatable {
  value?: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: IValidatable) {
  let isValid = true;

  if (validatableInput.required) {
    isValid = isValid && !!String(validatableInput.value).trim().length;
  }

  if (validatableInput.minLength !== null && typeof validatableInput.value === 'string' && validatableInput.minLength) {
    isValid = isValid && validatableInput.value.length > validatableInput?.minLength;
  }
  if (validatableInput.maxLength !== null && typeof validatableInput.value === 'string' && validatableInput.maxLength) {
    isValid = isValid && validatableInput.value.length < validatableInput.maxLength;
  }
  if (validatableInput.min !== null && typeof validatableInput.value === 'number' && validatableInput.min) {
    isValid = isValid && validatableInput.value > validatableInput.min;
  }
  if (validatableInput.max !== null && typeof validatableInput.value === 'number' && validatableInput.max) {
    isValid = isValid && validatableInput.value < validatableInput.max;
  }

  return isValid;
}
/* Validation end */

/* Decorators start */
function Autobind(_: unknown, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}
/* Decorators end */

/* Component Base Class start */
abstract class Component<HostType extends HTMLElement, ElementType extends HTMLElement> {
  templateElement: HTMLTemplateElement;

  hostElement: HostType;

  element: ElementType;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string,
  ) {
    this.hostElement = <HostType>document.getElementById(hostElementId);
    this.templateElement = <HTMLTemplateElement>document.getElementById(templateId);

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = <ElementType>importedNode.firstElementChild;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.render(insertAtStart);
  }

  private render(insertAtStart: boolean) {
    if (this.element) {
      this.hostElement?.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
    }
  }

  abstract configure(): void;
  abstract renderContent(): void;
}
/* Component Base Class end */

/* ProjectItem Class start */
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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

  @Autobind
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
/* ProjectItem Class end */

/* ProjectList start */
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects?: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);

    this.configure();
    this.renderContent();
  }

  @Autobind
  dragOverHandler(event: DragEvent) {
    if (event?.dataTransfer && event?.dataTransfer?.types?.[0] === 'text/plain') {
      event.preventDefault();
      const listElement = this.element.querySelector('ul');
      listElement?.classList.add('droppable');
    }
  }

  @Autobind
  dropHandler(event: DragEvent) {
    const projectId = event?.dataTransfer?.getData('text/plain');

    if (projectId) {
      projectState.moveProject(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }
  }

  @Autobind
  dragLeaveHandler() {
    const listElement = this.element.querySelector('ul');
    listElement?.classList.remove('droppable');
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    projectState.addListener((projects: Project[]) => {
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

(() => new ProjectList('active'))();
(() => new ProjectList('finished'))();
/* ProjectList end */

/* ProjectInput start */
type TUserInputTuple = [string, string, number] | void;

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;

  descriptionInputElement: HTMLInputElement;

  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');

    this.titleInputElement = <HTMLInputElement> this.element?.querySelector('#title');
    this.descriptionInputElement = <HTMLInputElement> this.element?.querySelector('#description');
    this.peopleInputElement = <HTMLInputElement> this.element?.querySelector('#people');

    this.configure();
  }

  configure() {
    if (this.element) {
      this.element.addEventListener('submit', this.submitHandler);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  renderContent() {}

  private gatherUserInput(): TUserInputTuple {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: IValidatable = {
      value: enteredTitle,
      required: true,
      minLength: 3,
      maxLength: 100,
    };

    const descriptionValidatable: IValidatable = {
      value: enteredDescription,
      required: true,
      minLength: 3,
      maxLength: 300,
    };

    const peopleValidatable: IValidatable = {
      value: enteredPeople,
      required: true,
      min: 1,
      max: 10,
    };

    if (!validate(titleValidatable)
    || !validate(descriptionValidatable)
    || !validate(peopleValidatable)
    ) {
      alert('Invalid input, please try again!');
      throw new Error('invalid input');
    } else {
      return (enteredTitle && enteredDescription && enteredPeople)
        ? [enteredTitle, enteredDescription, +enteredPeople] : undefined;
    }
  }

  private clearInputs() {
    if (this.titleInputElement) {
      this.titleInputElement.value = '';
    }
    if (this.descriptionInputElement) {
      this.descriptionInputElement.value = '';
    }
    if (this.peopleInputElement) {
      this.peopleInputElement.value = '';
    }
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();

    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);

      this.clearInputs();
    }
  }
}

(() => new ProjectInput())();
/* ProjectInput end */
