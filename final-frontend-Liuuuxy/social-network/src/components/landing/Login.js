import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { Google } from "react-bootstrap-icons";
import { url } from "../../config";
import { useUserInfo } from "../../UserContext";

function Login() {
  const [state, setState] = useState({
    username: null,
    password: null,
    hint1: "",
    hint2: "",
  });

  const navigate = useNavigate();
  const { setUser, setPwdLen } = useUserInfo();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const loginEndpoint = url + '/login';

    fetch(loginEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: state.username,
        password: state.password,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Login failed');
        }
        return res.json();
      })
      .then((data) => {
        setUser(data.username);
        setPwdLen(state.password.length);
      })
      .then(() => {
        // console.log("logged in");
        navigate("/main");
      })
      .catch((error) => {
        console.error('Error:', error);
        setState((prevState) => ({
          ...prevState,
          hint1: "Invalid username or password",
        }));
      });
  };

  const handleGoogleLogin = () => {
    window.location.href = `${url}/auth/google`;
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #f3ec78, #af4261)",
      }}
    >
      <Card
        style={{
          maxWidth: "30rem",
          width: "90%",
          padding: "20px 30px",
          boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Card.Body>
          <Card.Title
            className="text-center mb-5"
            style={{ fontSize: "2rem", fontWeight: "bold" }}
          >
            Welcome Back
          </Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group
              as={Row}
              className="mb-4"
              controlId="formHorizontalUsername"
            >
              <Form.Label column sm={4}>
                Username
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="text"
                  name="username"
                  onChange={handleChange}
                  isInvalid={!!state.hint1}
                  placeholder="Enter username"
                />
                <Form.Control.Feedback type="invalid">
                  {state.hint1}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            <Form.Group
              as={Row}
              className="mb-5"
              controlId="formHorizontalPassword"
            >
              <Form.Label column sm={4}>
                Password
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="password"
                  name="password"
                  onChange={handleChange}
                  isInvalid={!!state.hint2}
                  placeholder="Enter password"
                />
                <Form.Control.Feedback type="invalid">
                  {state.hint2}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            <div className="d-flex justify-content-center align-items-center mb-5">
              <Button
                variant="primary"
                type="submit"
                className="w-100 w-md-auto"
                style={{
                  background: "#af4261",
                  borderColor: "#af4261",
                  padding: "10px 30px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                }}
              >
                Login
              </Button>
            </div>
          </Form>
          <div className="mt-2 text-center">
            <Link
              to="/register"
              style={{ color: "#836096", textDecoration: "underline" }}
            >
              New user? Register here.
            </Link>
          </div>

          {/* Divider */}
          <div className="text-center my-3">
            <hr style={{ border: "none", height: "1px", color: "#ddd", backgroundColor: "#ddd", margin: "20px 0" }} />
            <p style={{ color: "#bbb", fontWeight: "normal", fontSize: "0.8rem", marginBottom: "20px" }}>OR LOGIN WITH</p>
          </div>

          {/* Google Login Button */}
          <div className="d-flex justify-content-center align-items-center mb-3">
            <Button
              variant="light"
              className="w-100 w-md-auto"
              style={{ boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)", borderColor: "#ddd", display: "flex", alignItems: "center", justifyContent: "center" }}
              onClick={handleGoogleLogin}
            >
              <Google style={{ marginRight: 10, height: 20 }} />
              Continue with Google
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Login;
