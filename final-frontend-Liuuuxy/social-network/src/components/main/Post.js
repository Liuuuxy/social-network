import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, Avatar, CardMedia, Typography, IconButton, TextField, Button } from "@mui/material";
import { PencilSquare } from "react-bootstrap-icons";
import Comments from "./Comments";
import { url } from "../../config";

function Post({ article, onPostUpdate, currentUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(article.text);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    fetchAvatar(article.author).catch(console.error);
  }, [article.author]);


  async function fetchAvatar(author) {
    try {
      const response = await fetch(`${url}/avatar/${author}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error("Failed to fetch avatar");
      }
      const data = await response.json();
      setAvatar(data.avatar);
    } catch (error) {
      console.error("Error fetching avatar:", error);
    }
  }

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setEditedText(article.text);
    }
  };

  const handleCommentUpdate = (updatedComments) => {
    const updatedArticle = { ...article, comments: updatedComments };
    onPostUpdate(updatedArticle);
  };

  async function handleSavePost() {
    const payload = {
      text: editedText,
    };

    try {
      const response = await fetch(`${url}/articles/${article.pid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update article');
      }
      const updatedArticle = await response.json();
      setIsEditing(false);
      onPostUpdate(updatedArticle.articles[0]);
    } catch (error) {
      console.error('Error updating article:', error);
    }
  }


  return (
    <Card data-testid="post" variant="outlined" className="mb-4">
      <CardHeader
        avatar={<Avatar src={avatar} />}
        title={article.author}
        subheader={new Date(article.date).toLocaleString() || "Unknown Date"}
        action={
          article.author === currentUser && (
            <IconButton aria-label="edit" onClick={toggleEdit}>
              <PencilSquare />
            </IconButton>
          )
        }
      />

      {article.image && (
        <CardMedia
          component="img"
          height="200"
          width="200"
          image={article.image}
          alt="postImage"
          style={{ objectFit: "contain" }}
        />
      )}

      <CardContent>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            variant="outlined"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {article.text}
          </Typography>
        )}
      </CardContent>

      {isEditing && (
        <>
          <Button onClick={handleSavePost} style={{ marginLeft: '10px', color: '#836096', font: 'bolder' }}>Save</Button>
          <Button onClick={toggleEdit} style={{ marginLeft: '10px', color: '#836096', font: 'bolder' }}>Cancel</Button>
        </>
      )
      }


      <Comments
        postId={article.pid}
        initialComments={article.comments}
        onCommentsUpdate={handleCommentUpdate}
        currentUser={currentUser}
      />
    </Card >
  );

}

export default Post;
