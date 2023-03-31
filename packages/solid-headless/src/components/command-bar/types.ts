import {
  HeadlessDisclosureRootChildren,
} from '../../headless/disclosure';
import {
  UnmountableProps,
} from '../../utils/create-unmountable';

export interface CommandBarBaseProps
  extends HeadlessDisclosureRootChildren, UnmountableProps {
  onClose?: () => void;
  onOpen?: () => void;
}
