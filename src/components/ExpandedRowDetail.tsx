import { useCallback, useState } from "react";
import styled from "styled-components";

export const ExpandableCell = styled.span`
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.45;
`;

export function useInlineRowExpand<T>(getRowKey: (record: T) => string) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggleRow = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const getRowProps = useCallback(
    (record: T) => {
      const key = getRowKey(record);
      return {
        onClick: () => toggleRow(key),
      };
    },
    [getRowKey, toggleRow],
  );

  const getRowClassName = useCallback(
    (record: T) => {
      const key = getRowKey(record);
      return expandedKeys.has(key)
        ? "row-inline-expanded"
        : "row-inline-collapsed";
    },
    [expandedKeys, getRowKey],
  );

  return {
    expandedKeys,
    toggleRow,
    getRowProps,
    getRowClassName,
  };
}

export const SingleLineCell = ExpandableCell;
