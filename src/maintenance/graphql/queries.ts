import { gql } from "@apollo/client";

export const GET_MAINTENANCE_SCHEDULES = gql`
  query maintenanceSchedules($skip: Int, $take: Int) {
    maintenanceSchedules(skip: $skip, take: $take) {
      maintenanceSchedules {
        maintenance_schedule_ID
        maintenance_type
        status
        notes
        createdAt
        updatedAt
        item {
          name
          condition
        }
        user {
          username
        }
      }
      total
    }
  }
`;
