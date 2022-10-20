import { createAsyncThunk } from "@reduxjs/toolkit";
import { isNil } from "lodash";

import { runGenerationHandler } from "../../services/locatorGenerationController";
import { selectLocatorByJdnHash, selectPageObjById } from "../selectors/pageObjectSelectors";
import { Locator } from "../slices/locatorSlice.types";
import { failGeneration, updateLocator } from "../slices/locatorsSlice";
import { MaxGenerationTime } from "../slices/mainSlice.types";
import { RootState } from "../store";

interface Meta {
  generationData: Locator[];
  maxGenerationTime?: MaxGenerationTime;
}

export const runXpathGeneration = createAsyncThunk("locators/scheduleGeneration", async (meta: Meta, thunkAPI) => {
  const { generationData, maxGenerationTime } = meta;
  const state = thunkAPI.getState() as RootState;
  const { xpathConfig } = state.main;
  const pageObject =
    !isNil(state.pageObject.present.currentPageObject) &&
    selectPageObjById(state, state.pageObject.present.currentPageObject);
  await runGenerationHandler(
      generationData,
      { ...xpathConfig, maximum_generation_time: maxGenerationTime || xpathConfig.maximum_generation_time },
      (el: Locator) => {
        const { element_id, jdnHash } = el;
        let foundId;
        if (!element_id) {
          foundId = selectLocatorByJdnHash(state, jdnHash)?.element_id;
        }
        thunkAPI.dispatch(updateLocator({ ...el, element_id: element_id || foundId }));
      },
      (ids: string[]) => thunkAPI.dispatch(failGeneration(ids)),
      pageObject
  );
  return generationData;
});
