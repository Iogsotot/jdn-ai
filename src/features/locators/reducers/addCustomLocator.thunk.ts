import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { ILocator, LocatorsState, ValidationStatus } from '../types/locator.types';
import { generateId, getElementFullXpath } from '../../../common/utils/helpers';
import { addLocatorToPageObj } from '../../pageObjects/pageObject.slice';
import { addLocators, setActiveSingle, setScrollToLocator } from '../locators.slice';
import { evaluateLocator, evaluateXpath, generateSelectorByHash, getLocatorValidationStatus } from '../utils/utils';
import { sendMessage } from '../../../pageServices/connector';
import { locatorsAdapter } from '../selectors/locators.selectors';
import { LocatorType } from '../../../common/types/common';

export const addCustomLocator = createAsyncThunk(
  'locators/addCustomLocator',
  async (payload: { newLocatorData: ILocator & { locatorFormValue: string } }, thunkAPI) => {
    const { newLocatorData } = payload;
    const { message, locatorValue, locatorType, pageObj: pageObjectId, locatorFormValue } = newLocatorData;

    const isXPathLocator = locatorType === LocatorType.xPath;
    const isStandardLocator: boolean =
      [
        LocatorType.cssSelector,
        LocatorType.className,
        LocatorType.id,
        LocatorType.linkText,
        LocatorType.name,
        LocatorType.tagName,
      ].includes(locatorType) || locatorType.startsWith('data-');

    let foundHash;
    let foundElementText;
    let cssSelector = '';
    let fullXpath = '';
    // ToDo: fix legacy naming
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const element_id = `${generateId()}_${pageObjectId}`;

    if (getLocatorValidationStatus(message) === ValidationStatus.SUCCESS) {
      try {
        if ((isXPathLocator && locatorValue.xPath) || (isStandardLocator && locatorFormValue)) {
          const locatorData = await (isXPathLocator && locatorValue.xPath
            ? evaluateXpath(locatorValue.xPath, element_id)
            : evaluateLocator(locatorFormValue, locatorType, element_id));

          ({ foundHash, foundElementText } = JSON.parse(locatorData));
        }

        if (!foundHash) {
          foundHash = element_id.split('_')[0];
          await sendMessage
            .assignJdnHash({
              jdnHash: foundHash,
              ...{ locatorValue: isStandardLocator ? locatorFormValue : locatorValue.xPath ?? '' },
              isCSSLocator: isStandardLocator,
            })
            .then((res) => {
              if (res === 'success') return res;
              else throw new Error('Failed to assign jdnHash');
            })
            .catch((err) => {
              console.warn(err);
            });
        }

        if (isXPathLocator) {
          ({ cssSelector } = await generateSelectorByHash(element_id, foundHash));
        }

        if (isStandardLocator) {
          fullXpath = await getElementFullXpath(foundHash);
        }
      } catch (err) {
        console.warn(err);
      }
    }

    const newLocator: ILocator = {
      ...newLocatorData,
      element_id,
      locatorValue: {
        ...newLocatorData.locatorValue,
        ...(isStandardLocator ? { xPath: fullXpath } : { cssSelector }),
      },
      elemText: foundElementText || '',
      jdnHash: foundHash,
    };

    const dispatch = thunkAPI.dispatch;
    dispatch(addLocators([newLocator]));
    dispatch(addLocatorToPageObj({ pageObjId: pageObjectId, locatorId: newLocator.element_id }));
    dispatch(setActiveSingle(newLocator));
    dispatch(setScrollToLocator(newLocator.element_id));

    return newLocator;
  },
);

export const addCustomLocatorReducer = (builder: ActionReducerMapBuilder<LocatorsState>) => {
  return builder
    .addCase(addCustomLocator.fulfilled, (state, { payload }) => {
      // @ts-ignore
      locatorsAdapter.addOne(state, payload);
    })
    .addCase(addCustomLocator.rejected, (state, { error }) => {
      throw new Error(error.stack);
    });
};
