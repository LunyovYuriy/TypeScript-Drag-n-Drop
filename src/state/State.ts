type Listener<ListenerItemType> = (item: ListenerItemType[]) => void;

class State<ListenerItemType> {
  protected listeners: Listener<ListenerItemType>[] = [];

  addListener(listenerFn: Listener<ListenerItemType>) {
    this.listeners.push(listenerFn);
  }
}

export default State;
