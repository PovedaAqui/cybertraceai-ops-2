import { useCopyToClipboard } from 'usehooks-ts';
import { toast } from 'sonner';

type MessagePart =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: string; // other part types
    };

export interface CopyableMessage {
  parts?: readonly MessagePart[];
  content?: string;
}

export const useCopyMessageHandler = (message: CopyableMessage) => {
  const [, copy] = useCopyToClipboard();

  const handleCopy = () => {
    let textToCopy = '';

    if (message.parts && message.parts.length > 0) {
      textToCopy = message.parts
        .filter(
          (part): part is { type: 'text'; text: string } => part.type === 'text',
        )
        .map(part => part.text)
        .join('\n');
    } else if (message.content) {
      textToCopy = message.content;
    }

    if (textToCopy) {
      copy(textToCopy)
        .then(() => {
          toast.success('Copied to clipboard!');
        })
        .catch(error => {
          console.error('Failed to copy text: ', error);
          toast.error('Failed to copy to clipboard.');
        });
    } else {
      toast.error("There's no text to copy!");
    }
  };

  return { handleCopy };
}; 