import React from "react";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { MoreOutlined } from "@ant-design/icons";

export interface RowAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}

interface RowActionsProps {
  actions: RowAction[];
}

/**
 * Single neutral "more" button that opens a menu of row actions.
 * Destructive actions are separated and are the only ones coloured (red).
 */
const RowActions: React.FC<RowActionsProps> = ({ actions }) => {
  if (!actions.length) return null;

  const safe = actions.filter((a) => !a.danger);
  const danger = actions.filter((a) => a.danger);

  const toItem = (a: RowAction) => ({
    key: a.key,
    label: a.label,
    icon: a.icon,
    danger: a.danger,
    onClick: () => a.onClick(),
  });

  const items: MenuProps["items"] = [
    ...safe.map(toItem),
    ...(safe.length && danger.length ? [{ type: "divider" as const }] : []),
    ...danger.map(toItem),
  ];

  return (
    <span onClick={(e) => e.stopPropagation()}>
      <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
        <Button
          type="text"
          shape="circle"
          aria-label="Row actions"
          icon={<MoreOutlined style={{ fontSize: 18 }} />}
        />
      </Dropdown>
    </span>
  );
};

export default RowActions;
