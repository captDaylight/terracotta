import {
  createComponent,
  createEffect,
  createMemo,
  JSX,
  mergeProps,
  onCleanup,
} from 'solid-js';
import {
  omitProps,
} from 'solid-use/props';
import {
  createForwardRef,
  DynamicProps,
  HeadlessPropsWithRef,
  ValidConstructor,
} from '../../utils/dynamic-prop';
import {
  createSelectOptionFocusNavigator,
  SelectContext,
} from './SelectContext';
import createDynamic from '../../utils/create-dynamic';
import {
  createARIADisabledState,
  createDisabledState,
  createHasActiveState,
  createHasSelectedState,
} from '../../utils/state-props';
import { SELECT_TAG } from './tags';
import {
  createSingleSelectState,
  SingleSelectStateControlledOptions,
  SingleSelectStateUncontrolledOptions,
  SelectStateProvider,
  SelectStateRenderProps,
  MultipleSelectStateUncontrolledOptions,
  MultipleSelectStateControlledOptions,
  createMultipleSelectState,
} from '../../states/create-select-state';
import { Prettify } from '../../utils/types';
import { SELECTED_NODE } from '../../utils/namespace';
import createTypeAhead from '../../utils/create-type-ahead';

export interface SelectBaseProps {
  horizontal?: boolean;
}

export type SingleSelectControlledBaseProps<V> = Prettify<
  & SelectBaseProps
  & SingleSelectStateControlledOptions<V>
  & SelectStateRenderProps<V>
>;

export type SingleSelectControlledProps<V, T extends ValidConstructor = 'ul'> =
  HeadlessPropsWithRef<T, SingleSelectControlledBaseProps<V>>;

export type SingleSelectUncontrolledBaseProps<V> = Prettify<
  & SelectBaseProps
  & SingleSelectStateUncontrolledOptions<V>
  & SelectStateRenderProps<V>
>;

export type SingleSelectUncontrolledProps<V, T extends ValidConstructor = 'ul'> =
  HeadlessPropsWithRef<T, SingleSelectUncontrolledBaseProps<V>>;

export type SingleSelectProps<V, T extends ValidConstructor = 'ul'> =
  | SingleSelectControlledProps<V, T>
  | SingleSelectUncontrolledProps<V, T>

export type MultipleSelectControlledBaseProps<V> = Prettify<
  & SelectBaseProps
  & MultipleSelectStateControlledOptions<V>
  & SelectStateRenderProps<V>
>;

export type MultipleSelectControlledProps<V, T extends ValidConstructor = 'ul'> =
  HeadlessPropsWithRef<T, MultipleSelectControlledBaseProps<V>>;

export type MultipleSelectUncontrolledBaseProps<V> = Prettify<
  & SelectBaseProps
  & MultipleSelectStateUncontrolledOptions<V>
  & SelectStateRenderProps<V>
>;

export type MultipleSelectUncontrolledProps<V, T extends ValidConstructor = 'ul'> =
  HeadlessPropsWithRef<T, MultipleSelectUncontrolledBaseProps<V>>;

export type MultipleSelectProps<V, T extends ValidConstructor = 'ul'> =
  | MultipleSelectControlledProps<V, T>
  | MultipleSelectUncontrolledProps<V, T>;

export type SelectProps<V, T extends ValidConstructor = 'ul'> =
  | SingleSelectProps<V, T>
  | MultipleSelectProps<V, T>;

function isSelectMultiple<V, T extends ValidConstructor = 'ul'>(
  props: SelectProps<V, T>,
): props is MultipleSelectProps<V, T> {
  return !!props.multiple;
}

function isSelectUncontrolled<V, T extends ValidConstructor = 'ul'>(
  props: SelectProps<V, T>,
): props is SingleSelectUncontrolledProps<V, T> | MultipleSelectUncontrolledProps<V, T> {
  return 'defaultValue' in props;
}

export function Select<V, T extends ValidConstructor = 'ul'>(
  props: SelectProps<V, T>,
): JSX.Element {
  return createMemo(() => {
    const controller = createSelectOptionFocusNavigator();
    const [ref, setRef] = createForwardRef(props);
    const state = isSelectMultiple(props)
      ? createMultipleSelectState(props)
      : createSingleSelectState(props);

    const pushCharacter = createTypeAhead((value) => {
      controller.setFirstMatch(value);
    });

    createEffect(() => {
      const current = ref();
      if (current instanceof HTMLElement) {
        controller.setRef(current);
        onCleanup(() => {
          controller.clearRef();
        });

        const onKeyDown = (e: KeyboardEvent) => {
          if (!state.disabled()) {
            switch (e.key) {
              case 'ArrowUp':
                if (!props.horizontal) {
                  e.preventDefault();
                  controller.setPrevChecked(true);
                }
                break;
              case 'ArrowLeft':
                if (props.horizontal) {
                  e.preventDefault();
                  controller.setPrevChecked(true);
                }
                break;
              case 'ArrowDown':
                if (!props.horizontal) {
                  e.preventDefault();
                  controller.setNextChecked(true);
                }
                break;
              case 'ArrowRight':
                if (props.horizontal) {
                  e.preventDefault();
                  controller.setNextChecked(true);
                }
                break;
              case 'Home':
                e.preventDefault();
                controller.setFirstChecked();
                break;
              case 'End':
                e.preventDefault();
                controller.setLastChecked();
                break;
              case ' ':
              case 'Enter':
                e.preventDefault();
                break;
              default:
                if (e.key.length === 1) {
                  pushCharacter(e.key);
                }
                break;
            }
          }
        };
        const onFocus = () => {
          if (state.hasSelected()) {
            controller.setFirstChecked(SELECTED_NODE);
          } else {
            controller.setFirstChecked();
          }
        };

        current.addEventListener('keydown', onKeyDown);
        current.addEventListener('focus', onFocus);
        onCleanup(() => {
          current.removeEventListener('keydown', onKeyDown);
          current.removeEventListener('focus', onFocus);
        });
      }
    });

    return createComponent(SelectContext.Provider, {
      value: {
        controller,
        get horizontal() {
          return !!props.horizontal;
        },
      },
      get children() {
        return createDynamic(
          () => props.as || ('ul' as T),
          mergeProps(
            isSelectUncontrolled(props)
              ? omitProps(props, [
                'as',
                'by',
                'children',
                'defaultValue',
                'disabled',
                'horizontal',
                'multiple',
                'onChange',
                'ref',
                'toggleable',
              ])
              : omitProps(props, [
                'as',
                'by',
                'children',
                'value',
                'disabled',
                'horizontal',
                'multiple',
                'onChange',
                'ref',
                'toggleable',
              ]),
            SELECT_TAG,
            {
              id: controller.getId(),
              role: 'listbox',
              get 'aria-multiselectable'() {
                return props.multiple;
              },
              ref: setRef,
              get 'aria-orientation'() {
                return props.horizontal ? 'horizontal' : 'vertical';
              },
              get tabindex() {
                return state.hasActive() ? -1 : 0;
              },
            },
            createDisabledState(() => state.disabled()),
            createARIADisabledState(() => state.disabled()),
            createHasSelectedState(() => state.hasSelected()),
            createHasActiveState(() => state.hasActive()),
            {
              get children() {
                return createComponent(SelectStateProvider, {
                  state,
                  get children() {
                    return props.children;
                  },
                });
              },
            },
          ) as DynamicProps<T>,
        );
      },
    });
  }) as unknown as JSX.Element;
}
