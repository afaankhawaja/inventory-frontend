import { gql } from "@apollo/client";

export const UPDATE_USER = gql`
  mutation updateCurrentUser(
    $userID: String!
    $username: String
    $first_name: String
    $last_name: String
    $age: Int
    $cnic: String
    $email: String
    $is_active: Boolean
    $phone: String
    $image_path: String
  ) {
    updateCurrentUser(
      userID: $userID
      updateUserInput: {
        first_name: { set: $first_name }
        last_name: { set: $last_name }
        age: { set: $age }
        username: { set: $username }
        email: { set: $email }
        cnic: { set: $cnic }
        is_active: { set: $is_active }
        phone: { set: $phone }
        image_path: { set: $image_path }
      }
    ) {
      username
      first_name
      last_name
      age
      email
    }
  }
`;
