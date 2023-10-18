import './App.css';
import { Outlet } from 'react-router-dom';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';

import Navbar from './components/Navbar';

// Create an Apollo Client instance
const client = new ApolloClient({
  uri: '/graphql', // Set the GraphQL endpoint
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;
