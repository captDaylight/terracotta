import { JSX } from 'solid-js';
import { CircularButton } from './CircularButton';
import { ClipboardIcon } from './Icons';

export interface BashSnippetProps {
  code: string;
}

export default function BashSnippet(props: BashSnippetProps): JSX.Element {
  return (
    <div class="w-full rounded-md flex items-center justify-between bg-gray-800 border-2 border-gray-800 dark:border-gray-50 p-2">
      <div class="font-mono text-sm whitespace-pre text-gray-50 mx-2">
        {props.code}
      </div>
      <CircularButton>
        <span class="sr-only">Copy to clipboard</span>
        <ClipboardIcon class="w-10 h-10 p-2" />
      </CircularButton>
    </div>
  );
}
