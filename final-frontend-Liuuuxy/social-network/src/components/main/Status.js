import React, { useState, useEffect } from "react";
import { Button, FormControl } from "react-bootstrap";
import { url } from "../../config";

function Status({ }) {
  const [status, setStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch the current headline
    fetch(url + `/headline`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        setStatus(data.headline);
      })
      .catch(error => console.error('Error fetching headline:', error));
  }, []);

  const handleUpdateStatus = () => {
    fetch(url + '/headline', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ headline: status }),
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        setStatus(data.headline);
        setIsEditing(false);
      })
      .catch(error => console.error('Error updating headline:', error));
  };

  return (
    <div className="mb-5">
      {isEditing ? (
        <>
          <FormControl
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <Button
            className="outlineBtn mt-1"
            onClick={handleUpdateStatus}
          >
            Update
          </Button>
        </>
      ) : (
        <>
          <p>{status}</p>
          <Button className="linkBtn mt-1" onClick={() => setIsEditing(true)}>
            Edit Status
          </Button>
        </>
      )}
    </div>
  );
}

export default Status;
