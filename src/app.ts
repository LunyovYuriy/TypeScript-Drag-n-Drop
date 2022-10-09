// Project Type
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

/* ProjectList start */
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects?: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);

    this.configure();
    this.renderContent();
  }

  configure() {
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
    const titleElement = this.element ? this.element.querySelector('h2') : undefined;
    if (titleElement) {
      titleElement.textContent = `${this.type} projects`.toUpperCase();
    }

    const listElement = this.element ? this.element.querySelector('ul') : undefined;
    const listId = `${this.type}-projects-list`;

    if (listElement) {
      listElement.id = listId;
    }
  }

  private renderProjects() {
    const listElement = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`);
    listElement.innerHTML = '' ?? null;

    this.assignedProjects?.forEach((projectItem) => {
      const listItem = document.createElement('li');
      listItem.textContent = projectItem.title;
      listElement?.appendChild(listItem);
    });
  }
}

const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
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
    const enteredTitle = this.titleInputElement ? this.titleInputElement.value : undefined;
    const enteredDescription = this.descriptionInputElement
      ? this.descriptionInputElement.value : undefined;
    const enteredPeople = this.peopleInputElement ? this.peopleInputElement.value : undefined;

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

const projectInput = new ProjectInput();
/* ProjectInput end */
