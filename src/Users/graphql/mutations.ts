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
    $phone: String
    $is_active: Boolean
  ) {
    createUser(
      createUserInput: {
        username: $username
        first_name: $first_name
        last_name: $last_name
        age: $age
        cnic: $cnic
        phone: $phone
        password_hash: $password_hash
        email: $email
        role: { create: { name: $role } }
        is_active: $is_active
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

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $userID: String!
    $username: String
    $first_name: String
    $last_name: String
    $age: Int
    $cnic: String
    $email: String
    $is_active: Boolean
    $phone: String
  ) {
    updateUser(
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

export const DELETE_USER = gql`
  mutation DeleteUser($userID: String!) {
    removeUser(userID: $userID) {
      username
    }
  }
`;
