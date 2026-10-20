import type { SelectOption } from '@padel-cantabria/database';
import type { Page } from 'puppeteer';

export const PHASE_PLACEHOLDERS = ['0'];
export const CATEGORY_PLACEHOLDERS = ['-'];
const SELECT_OPTIONS_TIMEOUT_MS = 10_000;

export async function readSelectOptions(
  page: Page,
  selector: string,
  placeholders: string[],
): Promise<SelectOption[]> {
  return page.evaluate(
    (selectSelector, placeholderValues) => {
      const select = document.querySelector<HTMLSelectElement>(selectSelector);

      if (!select) {
        return [];
      }

      return Array.from(select.options)
        .map((option) => ({
          value: option.value,
          label: option.textContent?.trim() ?? '',
        }))
        .filter(
          (option) =>
            option.value.length > 0
            && option.label.length > 0
            && !placeholderValues.includes(option.value),
        );
    },
    selector,
    placeholders,
  );
}

async function waitForSelectOptions(
  page: Page,
  selector: string,
  placeholders: string[],
): Promise<void> {
  try {
    await page.waitForFunction(
      (selectSelector, placeholderValues) => {
        const select = document.querySelector<HTMLSelectElement>(selectSelector);

        if (!select) {
          return false;
        }

        return Array.from(select.options).some((option) => {
          const label = option.textContent?.trim() ?? '';

          return (
            option.value.length > 0
            && label.length > 0
            && !placeholderValues.includes(option.value)
          );
        });
      },
      { timeout: SELECT_OPTIONS_TIMEOUT_MS },
      selector,
      placeholders,
    );
  } catch {
    // Select may legitimately have no options after reload.
  }
}

export async function triggerSelectReload(
  page: Page,
  selectId: string,
  value: string,
  reloadFnName: 'cargargenero' | 'cargarfase',
  dependentSelector: string,
  dependentPlaceholders: string[],
): Promise<void> {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('Liga_Calendario') && response.ok(),
    { timeout: 30_000 },
  );

  await page.evaluate(
    (id, nextValue, fnName) => {
      const select = document.querySelector<HTMLSelectElement>(`#${id}`);

      if (!select) {
        throw new Error(`Select #${id} not found`);
      }

      select.value = nextValue;

      const reloadFn = (window as unknown as Record<string, () => void>)[fnName];

      if (typeof reloadFn !== 'function') {
        throw new TypeError(`${fnName} is not available`);
      }

      reloadFn();
    },
    selectId,
    value,
    reloadFnName,
  );

  await responsePromise;

  await page.waitForFunction(() => {
    const mandando = document.getElementById('mandando');
    return !mandando || mandando.style.display === 'none';
  });

  await waitForSelectOptions(page, dependentSelector, dependentPlaceholders);
}
