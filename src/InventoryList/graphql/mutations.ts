import { gql } from "@apollo/client";

export const CREATE_NEW_ITEM = gql`
  mutation CREATE_ITEM(
    $name: String
    $condition: String
    $quantity_in_stock: Int
    $reorder_threshold: Int
    $is_high_value: Boolean
    $brand: String
    $expiry_date: DateTime
    $manufacturing_date: DateTime
    $price: Decimal
    $barcode: String
    $categoryId: String
    $locationId: String
  ) {
    createItem(
      itemCreateInput: {
        name: $name
        condition: $condition
        quantity_in_stock: $quantity_in_stock
        reorder_threshold: $reorder_threshold
        is_high_value: $is_high_value
        brand: $brand
        expiry_date: $expiry_date
        manufacturing_date: $manufacturing_date
        price: $price
        barcode: $barcode
        category: { connect: { categoryId: $categoryId } }
        location: { connect: { locationId: $locationId } }
      }
    ) {
      name
      brand
      itemId
      expiry_date
      manufacturing_date
      category {
        name
      }
      location {
        location_name
      }
    }
  }
`;

export const UPDATE_ITEM = gql`
  mutation UpdateItem(
    $itemID: String!
    $name: String
    $condition: String
    $quantity_in_stock: Int
    $reorder_threshold: Int
    $is_high_value: Boolean
    $brand: String
    $barcode: String
    $categoryId: String
    $locationId: String
    $price: Decimal
  ) {
    updateItem(
      itemID: $itemID
      itemUpdateInput: {
        name: { set: $name }
        condition: { set: $condition }
        quantity_in_stock: { set: $quantity_in_stock }
        reorder_threshold: { set: $reorder_threshold }
        is_high_value: { set: $is_high_value }
        brand: { set: $brand }
        barcode: { set: $barcode }
        category: { connect: { categoryId: $categoryId } }
        location: { connect: { locationId: $locationId } }
        price: { set: $price }
      }
    ) {
      name
      brand
      price
      condition
      quantity_in_stock
      reorder_threshold
      is_high_value
      barcode
      category {
        name
      }
      location {
        location_name
      }
    }
  }
`;

export const DELETE_ITEM = gql`
  mutation removeItem($itemID: String!) {
    removeItem(itemID: $itemID) {
      name
    }
  }
`;

export const CHECK_IN_ITEM = gql`
  mutation CHECK_IN_ITEM(
    $userId: String!
    $itemId: String!
    $quantity: Float!
  ) {
    checkIn(userId: $userId, itemId: $itemId, quantity: $quantity) {
      transactionId
      transaction_type
      quantity
      transaction_date
      user {
        userId
        username
      }
      transactionItems {
        item {
          itemId
          name
        }
      }
    }
  }
`;

export const CHECK_OUT_ITEM = gql`
  mutation CHECK_OUT_ITEM(
    $userId: String!
    $itemId: String!
    $quantity: Float!
  ) {
    checkOut(userId: $userId, itemId: $itemId, quantity: $quantity) {
      transactionId
      transaction_type
      quantity
      transaction_date
      user {
        userId
        username
      }
      transactionItems {
        item {
          itemId
          name
        }
      }
    }
  }
`;
