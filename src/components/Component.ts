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

export default Component;
