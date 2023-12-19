import { Middleware } from '@reduxjs/toolkit';
import { ILocator } from '../types/locator.types';
import { runLocatorsGeneration } from './runLocatorsGeneration.thunk';
import { getNoLocatorsElements, hasAllLocators } from '../utils/utils';
import { selectLocatorsByPageObject } from '../selectors/locatorsByPO.selectors';
import { AUTO_GENERATION_THRESHOLD } from '../utils/constants';

const onSetActiveGroup = (dispatch: any, locators: ILocator[]) => {
  const noLocators: ILocator[] = getNoLocatorsElements(locators);
  console.log('%conSetActiveGroup: ', 'background-color: light-green', noLocators, locators);

  if (noLocators.length) {
    console.log('onSetActiveGroup no locators:', noLocators);

    dispatch(
      runLocatorsGeneration({
        locators: noLocators,
        generateMissingLocator: true,
      }),
    );
  }
};

export const shouldRunGeneration: Middleware = (store) => (next) => (action) => {
  const { type, payload, meta } = action;
  const state = store.getState();
  console.log(type);

  switch (type) {
    case 'locators/setElementGroupGeneration': {
      const { locators, isGenerated } = payload;
      if (isGenerated) {
        onSetActiveGroup(store.dispatch, locators);
      }
      break;
    }
    case 'locators/elementGroupSetActive': {
      onSetActiveGroup(store.dispatch, payload.locators as ILocator[]);
      break;
    }
    case 'locators/setActiveSingle':
    case 'locators/elementSetActive': {
      const noLocators = !hasAllLocators(payload);
      console.log('%celementSetActive', 'background-color: yellow', payload, type);
      console.log('NOLOCATORS: ', noLocators);

      if (noLocators) {
        console.log('%clocators/elementSetActive: ', 'background-color: orange', payload);

        store.dispatch(
          // @ts-ignore
          runLocatorsGeneration({
            locators: [payload],
            generateMissingLocator: true,
          }),
        );
      }
      break;
    }
    case 'filter/toggleClassFilter/fulfilled': {
      const { value, jdiClass, pageObjectId } = meta.arg;
      if (!value) break;

      const locators = selectLocatorsByPageObject(state, pageObjectId).filter((loc) => loc.type === jdiClass);
      const noLocators = getNoLocatorsElements(locators);
      if (noLocators.length < AUTO_GENERATION_THRESHOLD) {
        store.dispatch(
          // @ts-ignore
          runLocatorsGeneration({
            locators: noLocators,
            generateMissingLocator: true,
          }),
        );
      }

      break;
    }
    case 'filter/toggleClassFilterAll/fulfilled': {
      const { value, pageObjectId } = meta.arg;
      if (!value) break;

      const noLocators = getNoLocatorsElements(selectLocatorsByPageObject(state, pageObjectId));
      if (noLocators.length < AUTO_GENERATION_THRESHOLD) {
        store.dispatch(
          // @ts-ignore
          runLocatorsGeneration({
            locators: noLocators,
            generateMissingLocator: true,
          }),
        );
      }

      break;
    }
  }

  return next(action);
};
