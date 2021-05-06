import { Ref, ref, watch } from 'vue-demi';

type Overflow = 'auto' | 'hidden' | 'scroll' | 'visible' | 'inherit' | '';

type StyleOverflowProperty = 'overflow' | 'overflow-x' | 'overflow-y';

interface OverflowValues {
  overflow: Ref<Overflow>;
  overflowX: Ref<Overflow>;
  overflowY: Ref<Overflow>;
}

export const defaultDocumentElement = typeof document === 'undefined' ? undefined : document.documentElement;

export const getDefaultOverflows = () => ({
  overflow: ref<Overflow>(''),
  overflowX: ref<Overflow>(''),
  overflowY: ref<Overflow>(''),
});

/**
 * Map: key -> HTMLElement, value -> OverflowValues to store observable html elements
 * @description It's needed to support share global overflow values between multiple components
 */
const documentOverflows = new Map<HTMLElement | undefined, OverflowValues>([
  [defaultDocumentElement, getDefaultOverflows()],
]);

/**
 * Register overflow watcher
 * @param overflowRef - ref to overflow value
 * @param property - Style overflow property
 * @param documentElement
 */
const registerOverflowWatcher = (
  overflowRef: Ref<Overflow>,
  property: StyleOverflowProperty,
  documentElement = defaultDocumentElement,
) => {
  if (!documentElement) return;

  watch(
    () => overflowRef.value,
    () => {
      if (!overflowRef.value) {
        documentElement.style.removeProperty(property); // overflow === ''
      } else {
        documentElement.style.setProperty(property, overflowRef.value);
      }
    },
  );
};

export interface DocumentOverflowOptions {
  documentElement?: HTMLElement;
}

/**
 * Reactive document style overflow.
 *
 * @param options
 */
export const useDocumentOverflow = ({ documentElement = defaultDocumentElement }: DocumentOverflowOptions = {}) => {
  const { overflow, overflowX, overflowY } = documentOverflows.has(documentElement)
    ? documentOverflows.get(documentElement)!
    : documentOverflows.set(documentElement, getDefaultOverflows()).get(documentElement)!;

  // @NOTE: Revalidate current documentElement.style.overflow values
  if (documentElement) {
    overflow.value = documentElement.style.overflow as Overflow;
    overflowX.value = documentElement.style.overflowX as Overflow;
    overflowY.value = documentElement.style.overflowY as Overflow;
  }

  // @NOTE: Add watchers
  registerOverflowWatcher(overflow, 'overflow', documentElement);
  registerOverflowWatcher(overflowX, 'overflow-x', documentElement);
  registerOverflowWatcher(overflowY, 'overflow-y', documentElement);

  /**
   * Set whole element style overflow = 'hidden'
   */
  const hideOverflow = () => {
    overflow.value = 'hidden';
    overflowX.value = 'hidden';
    overflowY.value = 'hidden';
  };

  const hideOverflowX = () => {
    overflowX.value = 'hidden';
  };

  const hideOverflowY = () => {
    overflowX.value = 'hidden';
  };

  /**
   * Set whole element style overflow = '' (style.removeProperty)
   */
  const restoreOverflow = () => {
    overflow.value = '';
    overflowX.value = '';
    overflowY.value = '';
  };

  const restoreOverflowX = () => {
    overflowX.value = '';
  };

  const restoreOverflowY = () => {
    overflowY.value = '';
  };

  return {
    overflow,
    overflowX,
    overflowY,

    hideOverflow,
    hideOverflowX,
    hideOverflowY,

    restoreOverflow,
    restoreOverflowX,
    restoreOverflowY,
  };
};
