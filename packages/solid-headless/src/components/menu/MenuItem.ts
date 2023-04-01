import {
  onCleanup,
  createEffect,
  JSX,
  mergeProps,
  createComponent,
} from 'solid-js';
import {
  omitProps,
} from 'solid-use/props';
import createDynamic from '../../utils/create-dynamic';
import {
  DynamicProps,
  HeadlessPropsWithRef,
  ValidConstructor,
  createForwardRef,
} from '../../utils/dynamic-prop';
import { createOwnerAttribute } from '../../utils/focus-navigator';
import {
  createDisabled,
} from '../../utils/state-props';
import {
  MenuChildProps,
  MenuChild,
} from './MenuChild';
import {
  useMenuContext,
} from './MenuContext';
import { MENU_ITEM_TAG } from './tags';

export type MenuItemProps<T extends ValidConstructor = 'li'> =
  HeadlessPropsWithRef<T, MenuChildProps>;

export function MenuItem<T extends ValidConstructor = 'li'>(
  props: MenuItemProps<T>,
): JSX.Element {
  const context = useMenuContext('Menu');

  const [internalRef, setInternalRef] = createForwardRef(props);

  let characters = '';
  let timeout: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  createEffect(() => {
    const ref = internalRef();
    if (ref instanceof HTMLElement) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (!props.disabled) {
          switch (e.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
              e.preventDefault();
              context.setPrevChecked(ref);
              break;
            case 'ArrowDown':
            case 'ArrowRight':
              e.preventDefault();
              context.setNextChecked(ref);
              break;
            case ' ':
            case 'Enter':
              if (ref.tagName === 'BUTTON') {
                e.preventDefault();
              }
              ref.click();
              break;
            case 'Home':
              e.preventDefault();
              context.setFirstChecked();
              break;
            case 'End':
              e.preventDefault();
              context.setLastChecked();
              break;
            default:
              if (e.key.length === 1) {
                characters = `${characters}${e.key}`;
                if (timeout) {
                  clearTimeout(timeout);
                }
                timeout = setTimeout(() => {
                  context.setFirstMatch(characters);
                  characters = '';
                }, 100);
              }
              break;
          }
        }
      };

      ref.addEventListener('keydown', onKeyDown);
      onCleanup(() => {
        ref.removeEventListener('keydown', onKeyDown);
      });
    }
  });

  return createDynamic(
    () => props.as || ('div' as T),
    mergeProps(
      omitProps(props, [
        'as',
        'disabled',
        'ref',
        'children',
      ]),
      MENU_ITEM_TAG,
      createOwnerAttribute(context.getId()),
      {
        role: 'menuitem',
        tabindex: -1,
        ref: setInternalRef,
      },
      createDisabled(() => props.disabled),
      {
        get children() {
          return createComponent(MenuChild, {
            get disabled() {
              return props.disabled;
            },
            get children() {
              return props.children;
            },
          });
        },
      },
    ) as DynamicProps<T>,
  );
}
