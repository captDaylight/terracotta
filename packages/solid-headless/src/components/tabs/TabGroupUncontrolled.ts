import {
  JSX,
  mergeProps,
  createComponent,
  createUniqueId,
} from 'solid-js';
import {
  omitProps,
} from 'solid-use';
import {
  createHeadlessSelectRootSingleUncontrolledProps,
  HeadlessSelectRootChildren,
  HeadlessSelectSingleUncontrolledOptions,
} from '../../headless/select';
import createDynamic from '../../utils/create-dynamic';
import {
  DynamicProps,
  HeadlessPropsWithRef,
  ValidConstructor,
} from '../../utils/dynamic-prop';
import {
  createDisabled,
} from '../../utils/state-props';
import {
  TabGroupContext,
} from './TabGroupContext';
import { TAB_GROUP_TAG } from './tags';

interface TabGroupUncontrolledBaseProps<V>
  extends HeadlessSelectSingleUncontrolledOptions<V>, HeadlessSelectRootChildren<V> {
    horizontal: boolean;
  }

export type TabGroupUncontrolledProps<V, T extends ValidConstructor = 'div'> =
  HeadlessPropsWithRef<T, TabGroupUncontrolledBaseProps<V>>;

export function TabGroupUncontrolled<V, T extends ValidConstructor = 'div'>(
  props: TabGroupUncontrolledProps<V, T>,
): JSX.Element {
  const ownerID = createUniqueId();

  let id = 0;
  const ids = new Map<V, number>();

  return createComponent(TabGroupContext.Provider, {
    value: {
      get horizontal() {
        return props.horizontal ?? true;
      },
      getId(kind: string, value: V): string {
        let currentID = ids.get(value);
        if (!currentID) {
          currentID = id;
          ids.set(value, currentID);
          id += 1;
        }
        return `${ownerID}__${kind}-${currentID}`;
      },
    },
    get children() {
      return createDynamic(
        () => props.as ?? ('div' as T),
        mergeProps(
          omitProps(props, [
            'as',
            'children',
            'defaultValue',
            'disabled',
            'onChange',
            'ref',
          ]),
          TAB_GROUP_TAG,
          createDisabled(() => props.disabled),
          createHeadlessSelectRootSingleUncontrolledProps(props),
        ) as DynamicProps<T>,
      );
    },
  });
}
