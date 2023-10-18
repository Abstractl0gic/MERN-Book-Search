import { useState, useEffect } from 'react';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row,
} from 'react-bootstrap';
import { useLazyQuery, useMutation } from '@apollo/client';
import { SEARCH_BOOKS, SAVE_BOOK } from '../queries'; // Define your GraphQL queries and mutations

import Auth from '../utils/auth';

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState([]);

  // Set up GraphQL query to search for books
  const [searchBooks, { loading, data, error }] = useLazyQuery(SEARCH_BOOKS);

  // Create GraphQL mutation for saving a book
  const [saveBookMutation] = useMutation(SAVE_BOOK);

  useEffect(() => {
    // Fetch and set saved book IDs from localStorage
    setSavedBookIds(Auth.getSavedBookIds());
  }, []);

  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    // Execute the searchBooks query with the searchInput
    searchBooks({ variables: { searchTerm: searchInput } });
  };

  const handleSaveBook = (book) => {
    if (Auth.loggedIn()) {
      // Execute the saveBookMutation to save the book to the user's account
      saveBookMutation({
        variables: {
          bookData: {
            bookId: book.bookId,
            authors: book.authors,
            description: book.description,
            title: book.title,
            image: book.image,
            link: book.link,
          },
        },
      })
        .then((response) => {
          const savedBookId = response.data.saveBook.bookId;

          // Update the savedBookIds state with the newly saved book's ID
          setSavedBookIds([...savedBookIds, savedBookId]);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search for a book"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className="pt-5">
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border="dark">
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant="top"
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className="small">Authors: {book.authors.join(', ')}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={savedBookIds.includes(book.bookId)}
                        className="btn-block btn-info"
                        onClick={() => handleSaveBook(book)}>
                        {savedBookIds.includes(book.bookId)
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
