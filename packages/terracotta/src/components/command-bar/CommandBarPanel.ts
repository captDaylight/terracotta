import type { JSX } from 'solid-js';
import {
  createEffect,
  mergeProps,
  createComponent,
} from 'solid-js';
import {
  omitProps,
} from 'solid-use/props';
import createDynamic from '../../utils/create-dynamic';
import type {
  DynamicProps,
  HeadlessPropsWithRef,
  ValidConstructor,
} from '../../utils/dynamic-prop';
import {
  createForwardRef,
} from '../../utils/dynamic-prop';
import { focusFirst, lockFocus } from '../../utils/focus-navigation';
import getFocusableElements from '../../utils/focus-query';
import {
  useCommandBarContext,
} from './CommandBarContext';
import { COMMAND_BAR_PANEL_TAG } from './tags';
import type { DisclosureStateRenderProps } from '../../states/create-disclosure-state';
import {
  DisclosureStateChild,
  useDisclosureState,
} from '../../states/create-disclosure-state';
import {
  createDisabledState,
  createExpandedState,
} from '../../utils/state-props';
import useEventListener from '../../utils/use-event-listener';

export type CommandBarPanelProps<T extends ValidConstructor = 'div'> =
  HeadlessPropsWithRef<T, DisclosureStateRenderProps>;

export function CommandBarPanel<T extends ValidConstructor = 'div'>(
  props: CommandBarPanelProps<T>,
): JSX.Element {
  const context = useCommandBarContext('CommandBarPanel');
  const state = useDisclosureState();

  const [internalRef, setInternalRef] = createForwardRef(props);

  createEffect(() => {
    const current = internalRef();
    if (current instanceof HTMLElement) {
      if (state.isOpen()) {
        focusFirst(getFocusableElements(current), false);

        useEventListener(current, 'keydown', (e) => {
          if (!props.disabled) {
            switch (e.key) {
              case 'Tab':
                e.preventDefault();
                lockFocus(current, e.shiftKey, false);
                break;
              case 'Escape':
                state.close();
                break;
              default:
                break;
            }
          }
        });
      }
    }
  });

  return createDynamic(
    () => props.as || ('div' as T),
    mergeProps(
      omitProps(props, [
        'as',
        'children',
        'ref',
      ]),
      COMMAND_BAR_PANEL_TAG,
      {
        id: context.panelID,
        ref: setInternalRef,
        get children() {
          return createComponent(DisclosureStateChild, {
            get children() {
              return props.children;
            },
          });
        },
      },
      createDisabledState(() => state.disabled()),
      createExpandedState(() => state.isOpen()),
    ) as DynamicProps<T>,
  );
}
