import ProjectStateInstance from '../state/ProjectState';
import { IValidatable, validate } from '../utils/validation';
import autobind from '../decorators/autobind';
import Component from './Component';

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
      // eslint-disable-next-line no-alert
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

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();

    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      ProjectStateInstance.addProject(title, desc, people);

      this.clearInputs();
    }
  }
}

export default ProjectInput;
