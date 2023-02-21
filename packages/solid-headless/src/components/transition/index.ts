import {
  createComponent,
  createContext,
  createEffect,
  createSignal,
  JSX,
  mergeProps,
  splitProps,
  useContext,
} from 'solid-js';
import {
  omitProps,
} from 'solid-use';
import assert from '../../utils/assert';
import createDynamic from '../../utils/create-dynamic';
import {
  createRef,
  DynamicNode,
  DynamicProps,
  HeadlessPropsWithRef,
  ValidConstructor,
} from '../../utils/dynamic-prop';
import { createUnmountable } from '../../utils/Unmountable';

interface TransitionRootContext {
  show: boolean;
}

interface TransitionCounter {
  register(): void;
  unregister(): void;
  done(): boolean;
}

const TransitionRootContext = createContext<TransitionRootContext>();
const TransitionCounterContext = createContext<TransitionCounter>();

function useTransitionRootContext(componentName: string): TransitionRootContext {
  const context = useContext(TransitionRootContext);
  assert(context, new Error(`<${componentName}> must be used inside a <Transition>`));
  return context;
}

function createTransitionCounter(): TransitionCounter {
  // Set of currently transitioning TransitionChilds nested within a TransitionChild
  const [size, setSize] = createSignal(0);

  return {
    // Reactive set
    register() {
      setSize((c) => c + 1);
    },
    unregister() {
      setSize((c) => c - 1);
    },
    done() {
      return size() === 0;
    },
  };
}

interface TransitionBaseChildProps {
  unmount?: boolean;
  appear?: boolean;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  entered?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  beforeEnter?: () => void;
  afterEnter?: () => void;
  beforeLeave?: () => void;
  afterLeave?: () => void;
}

function getClassList(classes?: string): string[] {
  return classes ? classes.split(' ') : [];
}

function addClassList(ref: HTMLElement, classes: string[]) {
  const filtered = classes.filter((value) => value);
  if (filtered.length) {
    ref.classList.add(...filtered);
  }
}
function removeClassList(ref: HTMLElement, classes: string[]) {
  const filtered = classes.filter((value) => value);
  if (filtered.length) {
    ref.classList.remove(...filtered);
  }
}

export type TransitionChildProps<T extends ValidConstructor = 'div'> =
  HeadlessPropsWithRef<T, TransitionBaseChildProps>;

export function TransitionChild<T extends ValidConstructor = 'div'>(
  props: TransitionChildProps<T>,
): JSX.Element {
  const values = useTransitionRootContext('TransitionChild');
  // Transitions pending on parent
  const transitionParent = useContext(TransitionCounterContext);
  // Transitions pending underneath element
  const transitionChildren = createTransitionCounter();

  const [visible, setVisible] = createSignal(values.show);
  const [ref, setRef] = createSignal<DynamicNode<T>>();
  let initial = true;

  function transition(element: HTMLElement, shouldEnter: boolean): void {
    if (shouldEnter) {
      if (initial) {
        const enter = getClassList(props.enter);
        const enterFrom = getClassList(props.enterFrom);
        const enterTo = getClassList(props.enterTo);
        const entered = getClassList(props.entered);

        const endTransition = () => {
          removeClassList(element, enter);
          removeClassList(element, enterTo);
          addClassList(element, entered);
          if (props.afterEnter) {
            props.afterEnter();
          }
        };

        if (props.beforeEnter) {
          props.beforeEnter();
        }
        addClassList(element, enter);
        addClassList(element, enterFrom);

        requestAnimationFrame(() => {
          removeClassList(element, enterFrom);
          addClassList(element, enterTo);
          element.addEventListener('transitionend', endTransition, { once: true });
          element.addEventListener('animationend', endTransition, { once: true });
        });
      }
    } else {
      const leave = getClassList(props.leave);
      const leaveFrom = getClassList(props.leaveFrom);
      const leaveTo = getClassList(props.leaveTo);
      const entered = getClassList(props.entered);
      if (props.beforeLeave) {
        props.beforeLeave();
      }
      removeClassList(element, entered);
      addClassList(element, leave);
      addClassList(element, leaveFrom);
      requestAnimationFrame(() => {
        removeClassList(element, leaveFrom);
        addClassList(element, leaveTo);
      });
      const endTransition = () => {
        removeClassList(element, leave);
        removeClassList(element, leaveTo);
        setVisible(false);
        if (props.afterLeave) {
          props.afterLeave();
        }
      };
      element.addEventListener('transitionend', endTransition, { once: true });
      element.addEventListener('animationend', endTransition, { once: true });
    }
  }

  createEffect(() => {
    const shouldShow = values.show;
    if (shouldShow) {
      setVisible(true);
    }
    const internalRef = ref();
    if (internalRef instanceof HTMLElement) {
      transition(internalRef, shouldShow);
    } else {
      // Ref is missing, reset initial
      initial = true;
    }
  });

  return createComponent(TransitionCounterContext.Provider, {
    value: transitionChildren,
    get children() {
      return createUnmountable(
        props,
        visible,
        () => createDynamic(
          () => props.as ?? ('div' as T),
          mergeProps(
            omitProps(props, [
              'as',
              'enter',
              'enterFrom',
              'enterTo',
              'leave',
              'leaveFrom',
              'leaveTo',
              'unmount',
              'afterEnter',
              'afterLeave',
              'appear',
              'beforeEnter',
              'beforeLeave',
              'entered',
              'ref',
            ]),
            {
              ref: createRef(props, (e) => {
                setRef(() => e);
              }),
            },
          ) as DynamicProps<T>,
        ),
      );
    },
  });
}

export type TransitionProps<T extends ValidConstructor = 'div'> =
  TransitionRootContext & TransitionChildProps<T>;

export function Transition<T extends ValidConstructor = 'div'>(
  props: TransitionProps<T>,
): JSX.Element {
  const [local, others] = splitProps(props, [
    'show',
  ]);
  return createComponent(TransitionRootContext.Provider, {
    value: local,
    get children() {
      return createComponent(TransitionChild, others);
    },
  });
}
