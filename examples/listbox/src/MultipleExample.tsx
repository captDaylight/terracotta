import {
  DisclosureStateChild,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from 'terracotta';
import { createSignal, JSX, For } from 'solid-js';
import { CheckIcon, SelectorIcon, classNames } from './utils';

const people = [
  { name: 'Wade Cooper' },
  { name: 'Arlene Mccoy' },
  { name: 'Devon Webb' },
  { name: 'Tom Cook' },
  { name: 'Tanya Fox' },
  { name: 'Hellen Schmidt' },
];

export default function MultipleExample(): JSX.Element {
  const [selected, setSelected] = createSignal(people);

  return (
    <div class="w-72 h-96">
      <span class="text-xl font-semibold">Multi Selection</span>
      <Listbox multiple toggleable defaultOpen value={selected()} onSelectChange={setSelected}>
        <div class="relative mt-1">
          <ListboxButton class="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
            <div class="flex flex-wrap gap-1">
              <For each={selected()} fallback={<span class="block truncate">No selected.</span>}>
                {(item) => (
                  <span class="inline-flex items-center rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                    {item.name}
                  </span>
                )}
              </For>
            </div>
            <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <SelectorIcon
                class="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </ListboxButton>
          <DisclosureStateChild>
            {({ isOpen }) => (
              <Transition
                show={isOpen()}
                enter="transition ease-in duration-100"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition ease-out duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <ListboxOptions unmount={false} class="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <For each={people}>
                    {(person) => (
                      <ListboxOption class="focus:outline-none group" value={person}>
                        {({ isActive, isSelected }) => (
                          <div
                            class={classNames(
                              isActive() ? 'text-amber-900 bg-amber-100' : 'text-gray-900',
                              'group-hover:text-amber-900 group-hover:bg-amber-100',
                              'cursor-default select-none relative py-2 pl-10 pr-4',
                            )}
                          >
                            <span
                              class={classNames(
                                isSelected() ? 'font-medium' : 'font-normal',
                                'block truncate',
                              )}
                            >
                              {person.name}
                            </span>
                            {isSelected() ? (
                              <span
                                class={classNames(
                                  isActive() ? 'text-amber-600' : 'text-amber-600',
                                  'group-hover:text-amber-600',
                                  'absolute inset-y-0 left-0 flex items-center pl-3',
                                )}
                              >
                                <CheckIcon class="w-5 h-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </div>
                        )}
                      </ListboxOption>
                    )}
                  </For>
                </ListboxOptions>
              </Transition>
            )}
          </DisclosureStateChild>
        </div>
      </Listbox>
    </div>
  );
}
