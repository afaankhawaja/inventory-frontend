import React from "react";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";
import { useQuery } from "@apollo/client";
import {
  FETCH_ALL_ITEMS,
  FETCH_ITEMS_BY_TODAY,
  FETCH_ITEMS_BY_YESTERDAY,
} from "../graphql/queries";
import styled from "styled-components";

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px 10px;
  font-weight: 600;
`;

const PlusContainer = styled.div`
  display: flex;
  justify-content: end;
`;

const InventoryValuationCards: React.FC = () => {
  const { data, loading, error } = useQuery(FETCH_ALL_ITEMS);
  const { data: yesterdayData } = useQuery(FETCH_ITEMS_BY_YESTERDAY);
  const { data: todayData } = useQuery(FETCH_ITEMS_BY_TODAY);

  const yesterdayItems = yesterdayData?.yesterdayItems?.length;
  const todayItems = todayData?.todayItems?.length;
  const differ = todayItems - yesterdayItems;
  const itemsData = data?.items?.items;
  const total = data?.items?.total;
  const icon = differ > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  const color = differ > 0 ? "#3f8600" : "#cf1322";
  if (!itemsData) return; //@ts-expect-error curr
  const totalInventory = itemsData.reduce((acc: number, curr) => {
    return acc + curr.price * curr.quantity_in_stock;
  }, 0);

  //@ts-expect-error curr
  const totalInventoryStock = itemsData.reduce((acc: number, curr) => {
    return acc + curr.quantity_in_stock;
  }, 0); //@ts-expect-error curr
  const highValueAsset = itemsData.reduce((acc: number, curr) => {
    if (curr.is_high_value) return acc + 1;
    return acc;
  }, 0);
  if (error) return <div>{error.message}</div>;

  const totalInventoryValueToday = todayData?.todayItems?.reduce(
    //@ts-expect-error curr
    (acc: number, curr) => {
      return acc + curr.price * curr.quantity_in_stock;
    },
    0,
  );
  const totalInventoryValueYesterday = yesterdayData?.yesterdayItems?.reduce(
    //@ts-expect-error curr
    (acc: number, curr) => {
      return acc + curr.price * curr.quantity_in_stock;
    },
    0,
  );
  const totalInventoryStockYesterday = yesterdayData?.yesterdayItems?.reduce(
    //@ts-expect-error curr
    (acc: number, curr) => {
      return acc + curr.quantity_in_stock;
    },
    0,
  );
  const totalInventoryStockToday = todayData?.todayItems?.reduce(
    //@ts-expect-error curr
    (acc: number, curr) => {
      return acc + curr.quantity_in_stock;
    },
    0,
  );
  const highValueAssetToday = todayData?.todayItems?.reduce(
    //@ts-expect-error curr
    (acc: number, curr) => {
      if (curr.is_high_value) return acc + 1;
      return acc;
    },
    0,
  );
  const highValueAssetYesterday = yesterdayData?.yesterdayItems?.reduce(
    //@ts-expect-error curr
    (acc: number, curr) => {
      if (curr.is_high_value) return acc + 1;
      return acc;
    },
    0,
  );

  const inventoryValueDifference =
    totalInventoryValueToday - totalInventoryValueYesterday;
  const inventoryStockDifference =
    totalInventoryStockToday - totalInventoryStockYesterday;
  const highValueAssetDifference =
    highValueAssetToday - highValueAssetYesterday;

  return (
    <Wrapper>
      {loading ? (
        <div>loading...</div>
      ) : (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Card hoverable>
                <PlusContainer>
                  {" "}
                  {differ > 0 ? `+ ${differ}` : ` ${differ}`}
                </PlusContainer>
                <Statistic
                  title="Total Items"
                  value={total}
                  precision={0}
                  valueStyle={{ color: color }}
                  prefix={<ArrowUpOutlined />}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card hoverable>
                <PlusContainer>
                  {" "}
                  {inventoryValueDifference > 0
                    ? `+ ${inventoryValueDifference}`
                    : `${inventoryValueDifference}`}
                </PlusContainer>
                <Statistic
                  title="Inventory Value"
                  value={totalInventory}
                  precision={2}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={icon}
                  suffix="$"
                />
              </Card>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Card hoverable>
                <PlusContainer>
                  {" "}
                  {inventoryStockDifference > 0
                    ? `+ ${inventoryStockDifference}`
                    : `${inventoryStockDifference}`}
                </PlusContainer>
                <Statistic
                  title="Total Inventory Stock"
                  value={totalInventoryStock}
                  precision={0}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<ArrowUpOutlined />}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card hoverable>
                <PlusContainer>
                  {" "}
                  {highValueAssetDifference > 0
                    ? `+ ${highValueAssetDifference}`
                    : `${highValueAssetDifference}`}
                </PlusContainer>
                <Statistic
                  title="High Value Asset"
                  value={highValueAsset}
                  precision={0}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<ArrowUpOutlined />}
                  suffix=""
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Wrapper>
  );
};

export default InventoryValuationCards;
