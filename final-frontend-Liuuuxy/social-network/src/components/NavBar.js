import React from "react";
import { Container, Navbar } from "react-bootstrap";
import { HouseFill } from "react-bootstrap-icons";

function NavBar() {
  // const defaultPhoto = "https://rb.gy/ckdw1"; // Replace this with your default image path.
  // const [photo, setPhoto] = useState(
  //   localStorage.getItem("userPhoto") || defaultPhoto
  // );

  return (
    <Navbar data-testid="navbar" className="p-3 mb-3 fixed-top w-100">
      <Container fluid>
        <Navbar.Brand href="/main">
          <HouseFill className="house-icon" size={40} />
        </Navbar.Brand>
        {/* <Dropdown>
          <Dropdown.Toggle
            as={Image}
            src={photo}
            alt="mdo"
            width="40"
            height="40"
            className="rounded-circle"
          />

          <Dropdown.Menu size="sm">
            <Dropdown.Item href="/profile">Profile</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item href="#">Sign out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown> */}
      </Container>
    </Navbar>
  );
}

export default NavBar;
