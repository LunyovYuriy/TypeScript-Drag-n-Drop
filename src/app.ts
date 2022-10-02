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
  console.log(validatableInput.minLength, typeof validatableInput.value === 'string');

  if (validatableInput.minLength !== null && typeof validatableInput.value === 'string') {
    console.log('tut');

    if (validatableInput.minLength) {
      isValid = isValid && validatableInput.value.length > validatableInput?.minLength;
    }
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

type TUserInputTuple = [string, string, number] | void;

class ProjectInput {
  templateElement?: HTMLTemplateElement;

  hostElement?: HTMLDivElement;

  element?: HTMLFormElement;

  titleInputElement?: HTMLInputElement;

  descriptionInputElement?: HTMLInputElement;

  peopleInputElement?: HTMLInputElement;

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
      console.log(title, desc, people);
      this.clearInputs();
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
