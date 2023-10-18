import React from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME, REMOVE_BOOK } from '../utils/queries';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  const { loading, data } = useQuery(GET_ME);
  const [deleteBook] = useMutation(REMOVE_BOOK);
  const userData = data?.me || {};

  if (!userData?.username) {
    return (
      <h4>
        You need to be logged in to see this page. Use the navigation links above to sign up or log in!
      </h4>
    );
  }

  const handleDeleteBook = async (bookId) => {
    try {
      const token = Auth.loggedIn() ? Auth.getToken() : null;
      if (!token) {
        return false;
      }

      await deleteBook({
        variables: { bookId: bookId },
        update: (cache) => {
          const existingData = cache.readQuery({ query: GET_ME });
          const updatedData = {
            me: {
              ...existingData.me,
              savedBooks: existingData.me.savedBooks.filter((book) => book.bookId !== bookId),
            },
          };
          cache.writeQuery({ query: GET_ME, data: updatedData });
        },
      });

      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {userData.savedBooks.map((book) => (
            <Card key={book.bookId} border='dark'>
              {book.image && <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />}
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <p className='small'>Authors: {book.authors}</p>
                {book.link && <Card.Text><a href={book.link} target="_blank" rel="noopener noreferrer">More Information on Google Books</a></Card.Text>}
                <Card.Text>{book.description}</Card.Text>
                <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                  Delete this Book
                </Button>
              </Card.Body>
            </Card>
          ))}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;
