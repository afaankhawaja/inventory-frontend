import { gql } from "@apollo/client";

export const FETCH_ALL_PURCHASES = gql`
  query purchase($skip: Int, $take: Int) {
    purchaseHistories(skip: $skip, take: $take) {
      purchases {
        purchaseId
        purchase_date
        quantity
        unit_price
        total_cost
        item {
          name
        }
        vendor {
          name
        }
        created_at
        updated_at
      }
      total
    }
  }
`;
