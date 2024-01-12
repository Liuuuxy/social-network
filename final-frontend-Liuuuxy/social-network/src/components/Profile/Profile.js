import React from "react";
import UserProfilePhoto from "./UserProfilePhoto";
import DisplayInfo from "./DisplayInfo";
import NavBar from "../NavBar";
import { Card, Row, Col } from "react-bootstrap";

function Profile() {
  return (
    <div className="profile-container">
      <NavBar />
      <div className="d-flex justify-content-center align-items-center container mt-4">
        <Card className="profile-card">
          <Card.Body>
            <Row className="justify-content-center mb-4">
              <Col xs={12} className="text-center">
                <UserProfilePhoto />
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col xs={12}>
                <DisplayInfo />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default Profile;
