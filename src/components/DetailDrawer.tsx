import React from "react";
import { Descriptions, Drawer } from "antd";
import styled from "styled-components";

/** Clickable table title: looks like text, underlines on hover. */
export const TitleLink = styled.a`
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: inherit;
  cursor: pointer;
  &:hover {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

export interface DetailField {
  label: string;
  value: React.ReactNode;
}

interface DetailDrawerProps {
  open: boolean;
  title: React.ReactNode;
  fields: DetailField[];
  onClose: () => void;
  extra?: React.ReactNode;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({
  open,
  title,
  fields,
  onClose,
  extra,
}) => (
  <Drawer
    open={open}
    title={title}
    onClose={onClose}
    width={420}
    destroyOnClose
  >
    <Descriptions column={1} bordered size="small" labelStyle={{ width: 150 }}
      contentStyle={{ minWidth: 0, overflowWrap: "anywhere", wordBreak: "break-word" }}
      style={{ tableLayout: "fixed", width: "100%" }}
    >
      {fields.map((f) => (
        <Descriptions.Item key={f.label} label={f.label}>
          {f.value ?? "—"}
        </Descriptions.Item>
      ))}
    </Descriptions>
    {extra}
  </Drawer>
);

export default DetailDrawer;
