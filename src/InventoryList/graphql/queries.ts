import { gql } from "@apollo/client";

export const FETCH_ALL_ITEMS = gql`
  query findItems {
    items {
      itemId
      name
      expiry_date
      price
      condition
      quantity_in_stock
      reorder_threshold
      is_high_value
      brand
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
