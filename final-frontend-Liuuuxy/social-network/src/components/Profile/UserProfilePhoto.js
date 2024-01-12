import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Pencil, CheckCircle, XCircle } from "react-bootstrap-icons";
import { url } from "../../config";

function UserProfilePhoto() {
  const defaultPhoto = "https://rb.gy/ckdw1"; // Default photo URL
  const [photo, setPhoto] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetch(`${url}/avatar`, { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        if (data.avatar) {
          setPhoto(data.avatar);
        }
      })
      .catch(error => console.error('Error fetching avatar:', error));
  }, []);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${url}/avatar`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setPhoto(data.avatar);
    } catch (error) {
      console.error('Error during upload:', error);
    } finally {
      setSelectedFile(null);
    }
  }

  function handleCancel() {
    setPhoto(defaultPhoto);
    setSelectedFile(null);
  }

  return (
    <div data-testid="user-profile-photo" className="user-photo">
      <img src={photo} alt="User" className="pp-profile-image" />
      <div className="edit-icon">
        <Button variant="light" size="sm" onClick={() => document.getElementById("photoInput").click()}>
          <Pencil />
        </Button>
      </div>
      <input
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="photoInput"
      />
      {selectedFile && (
        <div className="icon-actions">
          <Button variant="link" onClick={handleUpload}>
            <CheckCircle />
          </Button>
          <Button variant="link" onClick={handleCancel}>
            <XCircle />
          </Button>
        </div>
      )}
    </div>
  );
}

export default UserProfilePhoto;
