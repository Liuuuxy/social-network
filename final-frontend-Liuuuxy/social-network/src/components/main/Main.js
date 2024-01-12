import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import "./main.css";
import NewPost from "./NewPost";
import Search from "./Search";
import Status from "./Status";
import FollowingList from "./FollowingList";
import Post from "./Post";
import LittleProfile from "./LittleProfile";
import { url } from "../../config";

function MainView() {
  const navigate = useNavigate();

  const [allPosts, setAllPosts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [followedUsers, setFollowedUsers] = useState([]);
  const [user, setUser] = useState({ username: "", headline: "", avatar: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const [postAdded, setPostAdded] = useState(false); // New state variable
  const imgUrl = "https://t.ly/8jQ5N";

  useEffect(() => {
    fetchUserData();
    fetchFollowedUsers();
    fetchPosts(currentPage, pageSize);
    if (postAdded) {
      setPostAdded(false);
    }
  }, [currentPage, postAdded]);

  const fetchUserData = async () => {
    try {
      const responses = await Promise.all([
        fetch(`${url}/username`, { credentials: 'include' }),
        fetch(`${url}/headline`, { credentials: 'include' }),
        fetch(`${url}/avatar`, { credentials: 'include' }),
      ]);

      const userData = await Promise.all(responses.map(res => res.json()));
      const userProfile = userData.reduce((acc, data) => ({ ...acc, ...data }), {});
      setUser(userProfile);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchFollowedUsers = () => {
    fetch(url + "/following", {
      method: 'GET',
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => setFollowedUsers(data.following))
      .catch((error) => console.error("Error fetching followed users:", error));
  };

  const fetchPosts = (page, limit) => {
    fetch(`${url}/filtered?page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
    })
      .then(res => res.json())
      .then(response => {
        setAllPosts(response.articles);
        setTotalPages(Math.ceil(response.totalCount / pageSize)); // Assuming the response has a totalCount field
      })
      .catch(error => console.error("Error fetching filtered posts:", error));
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value); // Update current page
  };


  function handleLogout() {
    fetch(url + "/logout", {
      method: 'PUT',
      credentials: 'include'
    })
      .then(response => {
        if (response.ok) {
          localStorage.removeItem("user");
          navigate("/");
        } else {
          console.error('Logout failed');
        }
      })
      .catch(error => {
        console.error('Error during logout:', error);
      });
  }

  const handlePostUpdate = (updatedPost) => {
    const updatedPosts = allPosts.map(post => {
      if (post.pid === updatedPost.pid) {
        return updatedPost;
      }
      return post;
    });
    setAllPosts(updatedPosts);
  };


  const onFollowChange = () => {
    fetchFollowedUsers();
    fetchPosts();
  };

  const filterPostsBySearchText = (post) => {
    const searchTextLower = searchText.toLowerCase();
    const inBody = post.text.toLowerCase().includes(searchTextLower);
    const inAuthor = post.author.toLowerCase().includes(searchTextLower);

    return inBody || inAuthor;
  };

  return (
    <div>
      <Container fluid className="root">
        <Row className="justify-content-center">
          <Col xs={12} md={4} lg={3} className="contentBox sideBar">
            <h2 className="profileHeader">Profile & Followers</h2>

            <div className="nav-links">
              <Link to="/profile" className="linkBtn btn">
                Profile Page
              </Link>
              <button onClick={handleLogout} className="linkBtn btn">
                Logout
              </button>
            </div>

            <LittleProfile userName={user.username} avatarUrl={user.avatar} />
            <Status />
            <FollowingList
              followed={followedUsers || []}
              onFollowChange={onFollowChange}
            />
          </Col>

          <Col xs={12} md={7} lg={8} className="contentBox">
            <h2 className="articleHeader">Posts</h2>
            <NewPost
              onPost={(newPost) => {
                setAllPosts([newPost, ...allPosts]);
                setPostAdded(true);
              }}
            />
            <Search onSearch={setSearchText} />
            {allPosts.filter(filterPostsBySearchText).map((post) => (
              <Post
                key={post.pid}
                article={post}
                onPostUpdate={handlePostUpdate}
                currentUser={user.username}
              />
            ))}


            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default MainView;
