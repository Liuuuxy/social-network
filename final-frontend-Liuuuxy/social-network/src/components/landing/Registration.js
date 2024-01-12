import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { url } from "../../config";

function RegistrationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: "",
    displayName: "",
    email: "",
    phone: "",
    dob: "",
    zipcode: "",
    password: "",
    passwordConfirmation: "",
  });
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleReset() {
    setErrors({});
  }

  function validateForm() {
    const newErrors = {};

    const validEmailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    const validuserNameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/;
    const validPhoneRegex = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
    const validZipRegex = /^[0-9]{5}$/;

    function isAgeUnder18() {
      const birthday = new Date(formData.dob);
      if (new Date().getFullYear() - birthday.getFullYear() < 18) {
        return true;
      } else if (new Date().getFullYear() - birthday.getFullYear() === 18) {
        if (new Date().getMonth() < birthday.getMonth()) {
          return true;
        } else if (new Date().getMonth() === birthday.getMonth()) {
          if (new Date().getDate() < birthday.getDate()) {
            return true;
          }
        }
      }
      return false;
    }

    if (!validEmailRegex.test(formData.email))
      newErrors["email"] = "Invalid email format.";
    if (!validPhoneRegex.test(formData.phone))
      newErrors["phone"] =
        "Invalid phone number format. Expected: xxx-xxx-xxxx";
    if (isAgeUnder18())
      newErrors["dob"] =
        "Only individuals 18 years of age or older can register.";
    if (!validZipRegex.test(formData.zipcode))
      newErrors["zip"] = "Zipcode should be five digits.";
    if (!validuserNameRegex.test(formData.userName))
      newErrors["userName"] =
        "Account name can only contain upper or lower case letters and numbers, and may not start with a number.";
    if (formData.password !== formData.passwordConfirmation)
      newErrors["pwd"] = "Password and password confirmation do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (validateForm()) {
      const registrationData = {
        username: formData.userName,
        phone: formData.phone,
        email: formData.email,
        dob: formData.dob,
        zipcode: formData.zipcode,
        password: formData.password
      };
      console.log("Registration data:", registrationData);

      const registrationEndpoint = url + '/register';

      try {
        const response = await fetch(registrationEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Registration successful:', data);
          navigate("/");
        } else {
          console.error('Registration error:', data);
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    }
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f3ec78, #af4261)",
      }}
    >
      <Container
        style={{
          maxWidth: "600px",
          boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.2)",
          padding: "30px 40px",
          backgroundColor: "white",
          borderRadius: "15px",
        }}
      >
        <h1 className="text-center mb-5" style={{ fontWeight: "bold" }}>
          Registration
        </h1>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label htmlFor="userName">Account Name</Form.Label>
                <Form.Control
                  id="userName"
                  type="text"
                  name="userName"
                  placeholder="lilyDoe123"
                  onChange={handleChange}
                  isInvalid={errors["userName"]}
                  required
                />

                <Form.Control.Feedback type="invalid">
                  {errors["userName"]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label htmlFor="displayName">
                  Display Name (Optional)
                </Form.Label>
                <Form.Control
                  id="displayName"
                  type="text"
                  name="displayName"
                  placeholder="Lily Doe"
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group>
                <Form.Label htmlFor="email">Email</Form.Label>
                <Form.Control
                  id="email"
                  type="email"
                  name="email"
                  placeholder="e.g. lilydoe@example.com"
                  onChange={handleChange}
                  isInvalid={errors["email"]}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors["email"]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label htmlFor="phone">Phone Number</Form.Label>
                <Form.Control
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="e.g. 123-456-7890"
                  onChange={handleChange}
                  isInvalid={errors["phone"]}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors["phone"]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group>
                <Form.Label htmlFor="dob">Date of Birth</Form.Label>
                <Form.Control
                  id="dob"
                  type="date"
                  name="dob"
                  onChange={handleChange}
                  isInvalid={errors["dob"]}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors["dob"]}
                </Form.Control.Feedback>
                {/* <Form.Text className="text-danger">{errors["dob"]}</Form.Text> */}
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label htmlFor="zipcode">Zipcode</Form.Label>
                <Form.Control
                  id="zipcode"
                  type="text"
                  name="zipcode"
                  placeholder="e.g. 77005"
                  onChange={handleChange}
                  isInvalid={errors["zip"]}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors["zip"]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Form.Group>
              <Form.Label htmlFor="password">Password</Form.Label>
              <Form.Control
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Row>

          <Row>
            <Form.Group>
              <Form.Label htmlFor="conpwd">Confirm Password</Form.Label>
              <Form.Control
                id="conpwd"
                type="password"
                name="passwordConfirmation"
                placeholder="Re-enter your password"
                onChange={handleChange}
                isInvalid={errors["pwd"]}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors["pwd"]}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <div className="mt-4 d-flex flex-column flex-md-row justify-content-center">
            <Button
              type="submit"
              className="mb-2 mb-md-0"
              style={{
                marginRight: "10px",
                background: "#af4261",
                borderColor: "#af4261",
                borderRadius: "20px",
                fontWeight: "bold",
                padding: "10px 25px",
              }}
            >
              Register
            </Button>
            <Button
              type="reset"
              variant="secondary"
              onClick={handleReset}
              style={{
                borderRadius: "20px",
                fontWeight: "bold",
                padding: "10px 25px",
              }}
            >
              Clear
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/"
              style={{ color: "#836096", textDecoration: "underline" }}
            >
              Already registered? Log in here.
            </Link>
          </div>
        </Form>
      </Container>
    </div>
  );
}

export default RegistrationForm;
