import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Avatar,
  ListItemAvatar,
  ListItemText,
  IconButton
} from "@mui/material";
import { Box } from "@mui/system";
import { ChevronDown, ChevronUp, Pencil } from "react-bootstrap-icons";
import { url } from "../../config";

function Comments({ postId, initialComments, onCommentsUpdate, currentUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const commentsRef = useRef(null);
  const [avatars, setAvatars] = useState({});

  useEffect(() => {
    fetchAllAvatars();
  }, [comments]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commentsRef.current && !commentsRef.current.contains(event.target)) {
        setShowAllComments(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [commentsRef]);

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
      return data.avatar;
    } catch (error) {
      console.error("Error fetching avatar:", error);
    }
  }

  const fetchAllAvatars = async () => {
    const avatarPromises = comments.map((comment) =>
      fetchAvatar(comment.author).then(avatar => ({ author: comment.author, avatar }))
    );
    try {
      const avatarResults = await Promise.all(avatarPromises);
      const avatarMap = avatarResults.reduce((acc, { author, avatar }) => {
        acc[author] = avatar;
        return acc;
      }, {});
      setAvatars(avatarMap);
      // console.log(avatars);
    } catch (error) {
      console.error('Error fetching avatars:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const payload = {
        text: newComment,
        commentId: -1
      };

      const response = await fetch(`${url}/articles/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to add comment');
      const updatedArticle = await response.json();
      setComments(updatedArticle.articles[0].comments);
      setNewComment("");
      onCommentsUpdate(updatedArticle.articles[0].comments);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  function toggleComments() {
    setShowAllComments((prev) => !prev);
  }

  const toggleEdit = (comment) => {
    if (isEditing && editedComment === comment.id) {
      setIsEditing(false);
      setEditedComment(null);
      setEditedText('');
    } else {
      setIsEditing(true);
      setEditedComment(comment.id);
      setEditedText(comment.text);
    }
  };

  const handleSaveEdit = async (commentId) => {
    if (!editedText.trim()) return;

    try {
      const payload = {
        text: editedText,
        commentId: commentId,
      };

      const response = await fetch(`${url}/articles/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to update comment');
      const updatedArticle = await response.json();
      setComments(updatedArticle.articles[0].comments);
      setIsEditing(false);
      setEditedComment(null);
      onCommentsUpdate(updatedArticle.articles[0].comments);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };


  return (
    <Card
      variant="outlined"
      ref={commentsRef}
      sx={{
        border: "none",
        borderTop: "1px solid rgba(0, 0, 0, 0.12)",
        boxShadow: "none",
        borderRadius: 0,
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color="text.secondary">
            Comments
          </Typography>
          <IconButton
            data-testid={`comment-display-${postId}`}
            onClick={toggleComments}
            sx={{ p: 0 }}
          >
            {showAllComments ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </Box>
        <List dense data-testid={`comment-for-post${postId}`}>
          {showAllComments
            ? comments.map((comment) => (
              <ListItem key={comment.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={avatars[comment.author]} />
                </ListItemAvatar>
                <ListItemText
                  primary={comment.author}
                  secondary={comment.text}
                />
              </ListItem>
            ))
            : comments.slice(0, 2).map((comment) => (
              <ListItem key={comment.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={avatars[comment.author]} />
                </ListItemAvatar>
                {isEditing && editedComment === comment.id ? (
                  <>
                    <TextField
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                    />
                    <Button style={{ marginLeft: '10px', color: '#836096', font: 'bolder' }} onClick={() => handleSaveEdit(comment.id)}>Save</Button>
                    <Button style={{ marginLeft: '10px', color: '#836096', font: 'bolder' }} onClick={() => toggleEdit(comment)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <ListItemText
                      primary={comment.author}
                      secondary={comment.text}
                    />
                    {currentUser === comment.author && (
                      <IconButton aria-label="edit" onClick={() => toggleEdit(comment)}>
                        <Pencil />
                      </IconButton>
                    )}
                  </>
                )}
              </ListItem>
            ))}
        </List>
        {showAllComments && (
          <TextField
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        )}
        <Box display="flex" justifyContent="flex-end">
          <Button
            onClick={handleAddComment}
            className="commentBtn"
            variant="contained"
            color="primary"
            sx={{ mt: 1 }}
            style={{ display: showAllComments ? "block" : "none" }}
          >
            Add Comment
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Comments;
