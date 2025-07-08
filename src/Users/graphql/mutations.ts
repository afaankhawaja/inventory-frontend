import { gql } from "@apollo/client";

export const CREATE_USER_WITH_ROLE = gql`
  mutation CreateUser(
    $username: String
    $first_name: String
    $last_name: String
    $age: Int
    $cnic: String
    $password_hash: String
    $email: String
    $role: String
  ) {
    createUser(
      createUserInput: {
        username: $username
        first_name: $first_name
        last_name: $last_name
        age: $age
        cnic: $cnic
        password_hash: $password_hash
        email: $email
        role: { create: { name: $role } }
      }
    ) {
      userId
      username
      role {
        name
      }
    }
  }
`;
