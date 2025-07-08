import { gql } from "@apollo/client";

export const CREATE_NEW_ITEM = gql`
  mutation CREATE_ITEM(
    $name: String
    $condition: String
    $quantity_in_stock: Int
    $reorder_threshold: Int
    $is_high_value: Boolean
    $brand: String
    $barcode: String
    $category_name: String
    $location_name: String
  ) {
    createItem(
      itemCreateInput: {
        name: $name
        condition: $condition
        quantity_in_stock: $quantity_in_stock
        reorder_threshold: $reorder_threshold
        is_high_value: $is_high_value
        brand: $brand
        barcode: $barcode
        category: { create: { name: $category_name } }
        location: { create: { location_name: $location_name } }
      }
    ) {
      name
      brand
      itemId
      category {
        name
      }
      location {
        location_name
      }
    }
  }
`;
