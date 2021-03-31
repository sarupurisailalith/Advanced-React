import { useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import React from 'react';

const ADD_TO_CART = gql`
  mutation ADD_TO_CART($id: ID!) {
    addToCart(productId: $id) {
      id
    }
  }
`;

export default function AddToCart({ id }) {
  const [addToCart, { loading }] = useMutation(ADD_TO_CART, {
    variables: {
      id,
    },
  });
  return <button type="button">Add To Cart 🛒</button>;
}
