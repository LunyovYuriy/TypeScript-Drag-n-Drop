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

class ProjectInput {
  templateElement: HTMLTemplateElement | undefined;

  hostElement: HTMLDivElement | undefined;

  element: HTMLFormElement | undefined;

  titleInputElement: HTMLInputElement | undefined;

  descriptionInputElement: HTMLInputElement | undefined;

  peopleInputElement: HTMLInputElement | undefined;

  constructor() {
    const templateElement = document.getElementById('project-input');
    const hostElement = document.getElementById('app');

    let importedNode;

    if (templateElement) {
      this.templateElement = <HTMLTemplateElement>templateElement;
      importedNode = document.importNode(this.templateElement.content, true);
    }
    if (hostElement) {
      this.hostElement = <HTMLDivElement>hostElement;
    }
    if (importedNode) {
      this.element = <HTMLFormElement>importedNode.firstElementChild;
      this.element.id = 'user-input';
    }

    if (this.element) {
      const titleInputElement = this.element.querySelector('#title');
      const descriptionInputElement = this.element.querySelector('#description');
      const peopleInputElement = this.element.querySelector('#people');

      if (titleInputElement) {
        this.titleInputElement = <HTMLInputElement>titleInputElement;
      }
      if (descriptionInputElement) {
        this.descriptionInputElement = <HTMLInputElement>descriptionInputElement;
      }
      if (peopleInputElement) {
        this.peopleInputElement = <HTMLInputElement>peopleInputElement;
      }
    }

    this.configure();
    this.render();
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    if (this.titleInputElement) {
      console.log(this.titleInputElement.value);
    }
  }

  private configure() {
    if (this.element) {
      this.element.addEventListener('submit', this.submitHandler);
    }
  }

  private render() {
    if (this.element) {
      this.hostElement?.insertAdjacentElement('afterbegin', this.element);
    }
  }
}

const projectInput = new ProjectInput();
