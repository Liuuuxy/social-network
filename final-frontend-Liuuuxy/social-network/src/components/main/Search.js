import React from "react";
import { InputGroup, FormControl } from "react-bootstrap";

function Search({ onSearch }) {
  return (
    <InputGroup className="mb-4">
      <FormControl
        placeholder="Search articles by text or author"
        onChange={(e) => onSearch(e.target.value)}
      />
    </InputGroup>
  );
}

export default Search;
