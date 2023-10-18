import React, { useState, useEffect } from 'react';
import { Jumbotron, Container, Col, Form, Button, Card } from 'react-bootstrap';
import { useLazyQuery, useMutation } from '@apollo/client';
import { SEARCH_BOOKS, SAVE_BOOK } from '../utils/queries';
import Auth from '../utils/auth';
import { GET_ME } from '../utils/queries';

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState([]);

  const [searchBooks, { loading, data }] = useLazyQuery(SEARCH_BOOKS, {
    onCompleted: (data) => {
      setSearchedBooks(data.searchBooks);
    },
  });
  const [saveBook] = useMutation(SAVE_BOOK);

  useEffect(() => {
    if (data) {
      setSearchedBooks(data.searchBooks);
    }
  }, [data]);

  useEffect(() => {
    setSavedBookIds(Auth.getSavedBookIds());
  }, []);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      searchBooks({ variables: { searchTerm: searchInput } });
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await saveBook({
        variables: { book: { bookId } },
        update: (cache, { data }) => {
          const { me } = cache.readQuery({ query: GET_ME });
          cache.writeQuery({
            query: GET_ME,
            data: { me: { ...me, savedBooks: [...me.savedBooks, data.saveBook] } },
          });
        },
      });

      setSavedBookIds([...savedBookIds, data.saveBook.bookId]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Form.Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Form.Row>
          </Form>
        </Container>
      </Jumbotron>

      <Container>
        <h2>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <div className='card-columns'>
          {searchedBooks.map((book) => (
            <Card key={book.bookId} border='dark'>
              {book.image && <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />}
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <p className='small'>Authors: {book.authors.join(', ')}</p>
                <Card.Text>{book.description}</Card.Text>
                {Auth.loggedIn() && (
                  <Button
                    disabled={savedBookIds.includes(book.bookId)}
                    className='btn-block btn-info'
                    onClick={() => handleSaveBook(book.bookId)}>
                    {savedBookIds.includes(book.bookId)
                      ? 'This book has been saved!'
                      : 'Save this Book!'}
                  </Button>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      </Container>
    </>
  );
};

export default SearchBooks;
