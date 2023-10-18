import { gql } from "@apollo/client";

export const GET_ME = gql`
  query me {
    // Your GraphQL query for getting user data
  }
`;

export const REMOVE_BOOK = gql`
  mutation removeBook($bookId: ID!) {
    // Your GraphQL mutation for removing a book
  }
`;

// Add more queries and mutations as needed
