import { DATA_SET_NAMESPACE } from './namespace';

export default function queryNodes<T extends Element>(
  el: T,
  tag: string,
  ownerID: string,
): NodeListOf<HTMLElement> {
  return el.querySelectorAll(`[${DATA_SET_NAMESPACE}-${tag}="${ownerID}"]`);
}

const ACCORDION_BUTTON = 'accordion-button';

export function queryAccordionButtons<E extends Element>(
  el: E,
  ownerID: string,
): NodeListOf<HTMLElement> {
  return queryNodes(el, ACCORDION_BUTTON, ownerID);
}

const LISTBOX_OPTION = 'listbox-option';

export function queryListboxOptions<E extends Element>(
  el: E,
  ownerID: string,
): NodeListOf<HTMLElement> {
  return queryNodes(el, LISTBOX_OPTION, ownerID);
}

const MENU_ITEM = 'menu-item';

export function queryMenuItems<E extends Element>(
  el: E,
  ownerID: string,
): NodeListOf<HTMLElement> {
  return queryNodes(el, MENU_ITEM, ownerID);
}

const RADIO = 'radio';

export function queryRadios<E extends Element>(
  el: E,
  ownerID: string,
): NodeListOf<HTMLElement> {
  return queryNodes(el, RADIO, ownerID);
}

const SELECT_OPTION = 'select-option';

export function querySelectOptions<E extends Element>(
  el: E,
  ownerID: string,
): NodeListOf<HTMLElement> {
  return queryNodes(el, SELECT_OPTION, ownerID);
}

const FEED_ARTICLE = 'feed-article';

export function queryFeedArticles<E extends Element>(
  el: E,
  ownerID: string,
): NodeListOf<HTMLElement> {
  return queryNodes(el, FEED_ARTICLE, ownerID);
}
