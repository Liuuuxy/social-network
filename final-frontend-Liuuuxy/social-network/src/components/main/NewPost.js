import React, { useState, useRef } from "react";
import { InputGroup, FormControl, Button } from "react-bootstrap";
import { url } from "../../config"; // Ensure this is the correct path to your config

function NewPost({ onPost }) {
  const fileInputRef = useRef(null);
  const [newArticle, setNewArticle] = useState("");

  function handleNewPost() {
    if (!newArticle.trim()) {
      // Optionally handle empty input case
      return;
    }

    const formData = new FormData();
    formData.append('text', newArticle);

    if (fileInputRef.current && fileInputRef.current.files[0]) {
      formData.append('image', fileInputRef.current.files[0]);
    }

    fetch(`${url}/article`, {
      method: 'POST',
      credentials: 'include',
      body: formData, // Send form data
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to post article');
        }
        return response.json();
      })
      .then(data => {
        // Assuming the API returns the newly created article
        onPost(data.articles[0]);
        setNewArticle("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      })
      .catch(error => {
        console.error("Error posting new article:", error);
        // Optionally update UI to show error
      });
  }

  return (
    <div className="mb-4">
      <InputGroup>
        <FormControl
          as="textarea"
          placeholder="Add new article"
          value={newArticle}
          onChange={(e) => setNewArticle(e.target.value)}
        />
      </InputGroup>

      <input
        ref={fileInputRef}
        className="form-control"
        type="file"
        id="formFile"
        onChange={(e) => { /* Handle Image Upload */ }}
      />
      <div className="mt-2 postBtnGroup">
        <Button onClick={handleNewPost} className="mr-3 primaryBtn">
          Post
        </Button>
        <Button variant="secondary" className="Btn" onClick={() => setNewArticle("")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default NewPost;
