import { gql } from "@apollo/client";

export const GET_MAINTENANCE_SCHEDULES = gql`
  query maintenanceSchedules {
    maintenanceSchedules {
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
          user{
          username}
      }
      total
    }
  }
`;