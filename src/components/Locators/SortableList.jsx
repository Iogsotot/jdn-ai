import { find } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { ReactSortable } from "react-sortablejs";

export const SortableList = ({ items, selectedItems, renderList, onChange }) => {
  const _items = items.map((item) => ({
    ...item,
  }));
  const [list, setList] = useState(_items);
  const [choosingIsActive, setChoosing] = useState(false);

  useEffect(() => {
    setList(_items);
  }, [items]);

  const content = useMemo(() => renderList(items, selectedItems), [items]);

  const changeHandler = (event) => {
    const { item, newIndex, oldIndex } = event;
    const beforeItem = list[newIndex - 1];
    const nextItem = list[newIndex + 1];
    onChange(find(list, ["element_id", item.dataset.id]), newIndex, oldIndex, beforeItem, nextItem);
  };

  return (
    <ReactSortable
      {...{ list, setList }}
      onEnd={changeHandler}
      onChoose={() => setChoosing(true)}
      onUnchoose={() => setChoosing(false)}
      handle=".jdn__buttons--drag-handle"
      className={choosingIsActive ? "jdn__sortable--choosing" : ""}
    >
      {content}
    </ReactSortable>
  );
};
