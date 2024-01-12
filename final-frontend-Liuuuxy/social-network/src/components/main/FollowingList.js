import React, { useState, useEffect } from "react";
import { ListGroup, Button, FormControl, Row, Col } from "react-bootstrap";
import LittleProfile from "./LittleProfile";
import { useUserInfo } from "../../UserContext";
import { url } from "../../config";

function FollowingList({ followed, onFollowChange }) {
  const [newFollower, setNewFollower] = useState("");
  const [hint, setHint] = useState("");
  const { user, pwdLen } = useUserInfo();

  function handleUnfollow(username) {
    fetch(`${url}/following/${username}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then(() => {
        onFollowChange();
      })
      .catch((error) => console.error("Error removing user from followed list:", error));
  }

  function handleAddFollower() {
    if (newFollower) {
      if (newFollower === user) { // Make sure to compare with the username property
        setHint("You cannot follow yourself.");
        return;
      }
      else {
        fetch(`${url}/following/${newFollower}`, {
          method: 'PUT',
          credentials: 'include',
        })
          .then((res) => {
            if (!res.ok) {
              return res.json().then(data => Promise.reject(data.error));
            }
            return res.json();
          })
          .then(() => {
            setNewFollower("");
            setHint("");
            onFollowChange(); // Update the parent state and refetch posts
          })
          .catch((error) => {
            console.error("Error adding user to followed list:", error);
            setHint(error);
          });
      }
    }
  }

  return (
    <div className="mb-4 followList">
      <div className="mb-4 mt-3 addFollow">
        <Row>
          <Col md={9}>
            <FormControl
              value={newFollower}
              placeholder="Add follower by name"
              onChange={(e) => setNewFollower(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Button className="primaryBtn " onClick={handleAddFollower}>
              Add
            </Button>
          </Col>
        </Row>
      </div>

      {hint && <p className="hint">{hint}</p>}

      <ListGroup>
        {followed.map((user) => {
          return (
            <ListGroup.Item key={user.username} className="listgroup-item">
              <LittleProfile userName={user.username} status={user.headline} avatarUrl={user.avatar} />
              <div className="text-center">
                <Button
                  data-testid={`unfollow-${user.username}`}
                  className="custom-unfollow-button"
                  onClick={() => handleUnfollow(user.username)}
                >
                  Unfollow
                </Button>
              </div>
            </ListGroup.Item>
          )
        })}
      </ListGroup>
    </div>
  );
}

export default FollowingList;
