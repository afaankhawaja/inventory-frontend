import { gql } from "@apollo/client";

export const UPDATE_STATUS = gql`
  mutation updateMaintenanceSchedule(
    $maintenance_schedule_ID: String!
    $statusCheck: String!
    $status: String
    $userId: String
  ) {
    updateMaintenanceSchedule(
      maintenance_schedule_ID: $maintenance_schedule_ID
      statusCheck: $statusCheck
      updateMaintenanceScheduleInput: {
        status: { set: $status }
        item: { update: { data: { condition: { set: $statusCheck } } } }
        user: { connect: { userId: $userId } }
      }
    ) {
      status
    }
  }
`;
