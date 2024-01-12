import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { url } from "../../config";

function DisplayInfo() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    username: "",
    email: "",
    phone: "",
    zipcode: "",
    dob: "",
    password: "",
  });
  const [updatedUser, setUpdatedUser] = useState({ ...user });
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const pwdLen = 5;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const endpoints = ['username', 'email', 'phone', 'zipcode', 'dob'];
    try {
      const responses = await Promise.all(
        endpoints.map(endpoint => fetch(`${url}/${endpoint}`, { credentials: 'include' }))
      );
      const userData = await Promise.all(responses.map(res => res.json()));
      const userProfile = userData.reduce((acc, data) => ({ ...acc, ...data }), {});
      if (userProfile.dob) {
        const date = new Date(userProfile.dob);
        userProfile.dob = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      setUser(userProfile);
      setUpdatedUser(userProfile);
      setIsGoogleLinked(userProfile.googleId ? true : false);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const validate = () => {
    let tempErrors = {};

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (user.email !== updatedUser.email && !emailRegex.test(updatedUser.email))
      tempErrors.email = "Invalid email address.";

    const phoneRegex = /^\d{3}-\d{3}-\d{4}( x\d{5})?$/;
    if (user.phone !== updatedUser.phone && !phoneRegex.test(updatedUser.phone))
      tempErrors.phone =
        "Phone number must be in 'ddd-ddd-dddd' or 'ddd-ddd-dddd xddddd' format.";

    const zipcodeRegex = /^\d{5}(-\d{4})?$/;
    if (
      user.zipcode !== updatedUser.zipcode &&
      !zipcodeRegex.test(updatedUser.zipcode)
    )
      tempErrors.zipcode =
        "Zipcode must be 5 digits or 5 digits with extension (xxxxx-xxxx).";

    if (password || passwordConfirmation) {
      if (password !== passwordConfirmation)
        tempErrors.pwd = "Password and password confirmation do not match.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUpdatedUser((prevState) => ({ ...prevState, [name]: value }));
  };

  const updateField = async (field, value, endpoint) => {
    try {
      const response = await fetch(`${url}/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [field]: value }),
      });
      if (!response.ok) throw new Error(`Failed to update ${field}`);
      return response.json();
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      throw error;
    }
  };

  const updatePassword = async () => {
    if (password !== passwordConfirmation) {
      setErrors({ ...errors, pwd: "Passwords do not match." });
      return;
    }

    try {
      const response = await fetch(`${url}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (!response.ok) throw new Error('Failed to change password');
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const updates = [];
      if (user.email !== updatedUser.email) {
        updates.push(updateField('email', updatedUser.email, 'email'));
      }
      if (user.phone !== updatedUser.phone) {
        updates.push(updateField('phone', updatedUser.phone, 'phone'));
      }
      if (user.zipcode !== updatedUser.zipcode) {
        updates.push(updateField('zipcode', updatedUser.zipcode, 'zipcode'));
      }
      if (password && password === passwordConfirmation) {
        updates.push(updatePassword());
      }

      await Promise.all(updates);
      setIsEditing(false);
      setPassword("");
      setPasswordConfirmation("");
      fetchUserData();
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleLinkGoogleAccount = () => {
    //`${url}/auth/google`
    window.location.href = url + '/link-google'; // Your server route that starts the Google OAuth process
  };

  const handleUnlinkGoogleAccount = async () => {
    try {
      const response = await fetch('/unlink-google', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to unlink Google account');
      }

      const result = await response.json();
      console.log(result); // Or handle the result in your UI
    } catch (error) {
      console.error('Error unlinking Google account:', error);
    }
  };


  const handleToggleGoogleLink = async () => {
    if (isGoogleLinked) {
      // Call function to unlink the Google account
      await handleUnlinkGoogleAccount();
    } else {
      // Call function to link the Google account
      await handleLinkGoogleAccount();
    }
    // Update the link status
    setIsGoogleLinked(!isGoogleLinked);
  };

  return (
    <Container data-testid="display-info" className="mt-5">
      <Row>
        <Col xs={12}>
          {!isEditing ? (
            <>
              <h2>{user.username}</h2>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone}
              </p>
              <p>
                <strong>Zipcode:</strong> {user.zipcode}
              </p>
              <p>
                <strong>Date of Birth:</strong> {user.dob}
              </p>
              <p>
                <strong>Password:</strong> {"*".repeat(pwdLen)}
              </p>
              {/* <div className="d-flex align-items-center mb-3">
                <span style={{ fontSize: '1.2rem', color: '#666', marginRight: '1rem' }}>
                  <strong>Link Google:</strong>
                </span>
                <Form.Check
                  type="switch"
                  id="google-link-toggle"
                  checked={isGoogleLinked}
                  onChange={handleToggleGoogleLink}
                  className="mb-0"
                />
              </div> */}
              <Button className="linkBtn mt-2" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </>

          ) : (
            <Form onSubmit={handleSave}>
              {/* ... existing Form Groups for user info editing ... */}
              <Form.Group>
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={updatedUser.username}
                  disabled
                />
              </Form.Group>

              <Form.Group>
                <Form.Label htmlFor="email">Email</Form.Label>
                <Form.Control
                  type="email"
                  id="email"
                  name="email"
                  value={updatedUser.email}
                  onChange={handleInputChange}
                  isInvalid={errors["email"]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors["email"]}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Label htmlFor="phone">Phone</Form.Label>
                <Form.Control
                  type="tel"
                  id="phone"
                  name="phone"
                  value={updatedUser.phone}
                  onChange={handleInputChange}
                  isInvalid={errors["phone"]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors["phone"]}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Label htmlFor="zipcode">Zipcode</Form.Label>
                <Form.Control
                  type="text"
                  id="zipcode"
                  name="zipcode"
                  value={updatedUser.zipcode}
                  onChange={handleInputChange}
                  isInvalid={errors["zipcode"]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors["zipcode"]}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Label htmlFor="dob">Date of Birth</Form.Label>
                <Form.Control
                  type="text"
                  id="dob"
                  name="dateOfBirth"
                  value={updatedUser.dob || "Not provided"}
                  disabled
                />
              </Form.Group>

              {/* Password change form */}
              <Form.Group>
                <Form.Label htmlFor="password">New Password</Form.Label>
                <Form.Control
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label htmlFor="confirmPassword">Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  id="confirmPassword"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  isInvalid={!!errors.pwd}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.pwd}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Submit buttons */}
              <Button type="submit" className="saveBtn">Save</Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default DisplayInfo;
