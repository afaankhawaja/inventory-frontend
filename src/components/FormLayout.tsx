import styled, { css } from "styled-components";
import { Button } from "antd";

export const GAP = 15;

export const formStyles = css`
  width: 100%;

  .ant-form-item {
    margin-bottom: 0;
  }
  .ant-form-item-label {
    padding-bottom: 6px;
  }
  .ant-form-item-label > label {
    font-size: 13px;
    font-weight: 500;
  }
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${GAP}px;

  &:not(:first-child) {
    margin-top: ${GAP + 10}px;
    padding-top: ${GAP + 10}px;
    border-top: 1px solid rgba(128, 128, 128, 0.18);
  }
`;

export const SectionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
`;

export const SectionHint = styled.div`
  font-size: 12px;
  opacity: 0.55;
  margin-top: 2px;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${GAP}px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const FullRow = styled.div`
  grid-column: 1 / -1;
`;

export const SwitchRow = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${GAP}px;
  padding: 12px ${GAP}px;
  border-radius: 10px;
  background: rgba(128, 128, 128, 0.08);

  .ant-form-item {
    margin: 0;
  }
`;

export const SwitchText = styled.div`
  font-size: 14px;
  font-weight: 500;

  small {
    display: block;
    font-size: 12px;
    font-weight: 400;
    opacity: 0.6;
    margin-top: 2px;
  }
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: ${GAP}px;
  margin-top: ${GAP + 10}px;
  padding-top: ${GAP + 5}px;
  border-top: 1px solid rgba(128, 128, 128, 0.18);
`;

export const SubmitButton = styled(Button)`
  width: auto !important;
  min-width: 110px;
  border: none;
  box-shadow: none;
`;
