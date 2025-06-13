import { Quill } from 'quill';

declare module 'quill' {
  interface Quill {
    history: {
      undo: () => void;
      redo: () => void;
      clear: () => void;
      cutoff: () => void;
    };
  }
}
