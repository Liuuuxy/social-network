import React from "react";
import {
  act,
  screen,
  render,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { getFollowListForUser } from "../components/main/uitls";
import MainView from "../components/main/Main";
import Comments from "../components/main/Comments";

global.fetch = jest.fn();

const user = {
  id: 1,
  username: "User 1",
  company: {
    catchPhrase: "Headline 1",
  },
};

const users = [
  {
    id: 1,
    username: "User 1",
    address: {
      street: "Address 1",
    },
    company: {
      catchPhrase: "Headline 1",
    },
  },
  {
    id: 2,
    username: "User 2",
    address: {
      street: "Address 2",
    },
    company: {
      catchPhrase: "Headline 2",
    },
  },
  {
    id: 3,
    username: "User 3",
    address: {
      street: "Address 3",
    },
    company: {
      catchPhrase: "Headline 3",
    },
  },
  {
    id: 4,
    username: "User 4",
    address: {
      street: "Address 4",
    },
    company: {
      catchPhrase: "Headline 4",
    },
  },
  {
    id: 5,
    username: "User 5",
    address: {
      street: "Address 5",
    },
    company: {
      catchPhrase: "Headline 5",
    },
  },
];

const posts = [
  {
    userId: 1,
    id: 1,
    title: "Test Post 1",
    body: "This is a test post",
  },
  {
    userId: 2,
    id: 2,
    title: "Test Post 2",
    body: "This is test post 2",
  },
  {
    userId: 3,
    id: 3,
    title: "Test Post 3",
    body: "This is a test post 3",
  },
  {
    userId: 4,
    id: 4,
    title: "Test Post 4",
    body: "This is test post 4",
  },
  {
    userId: 5,
    id: 5,
    title: "Test Post 5",
    body: "This is test post 5",
  },
];

const setupFetchMock = () => {
  fetch.mockImplementation((url) => {
    switch (url) {
      case "https://jsonplaceholder.typicode.com/users":
        return Promise.resolve({
          json: () => Promise.resolve(users),
        });
      case "https://jsonplaceholder.typicode.com/posts":
        return Promise.resolve({
          json: () => Promise.resolve(posts),
        });
      default:
        return Promise.reject(new Error("Unknown URL"));
    }
  });
};

const renderMainView = () => {
  return render(
    <MemoryRouter>
      <MainView />
    </MemoryRouter>
  );
};

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify(user));
});

afterEach(() => {
  localStorage.clear();
});

describe("MainView", () => {
  it("should fetch posts and users, and display posts for the current logged-in user and their followed users", async () => {
    setupFetchMock();

    const { getByText } = renderMainView();

    await waitFor(() => {
      const followedUsers = getFollowListForUser(user.id, users);
      const expectedPosts = posts.filter(
        (post) =>
          post.userId === user.id ||
          followedUsers.some((followedUser) => followedUser.id === post.userId)
      );

      expectedPosts.forEach((post) => {
        expect(getByText(post.body)).toBeInTheDocument();
      });
    });
  });

  it("should fetch subset of articles for current logged in user given search keyword", async () => {
    setupFetchMock();

    const { getByPlaceholderText, getByText } = renderMainView();

    const searchInput = getByPlaceholderText(
      "Search articles by text or author"
    );

    act(() => {
      fireEvent.change(searchInput, {
        target: { value: "This is a test post" },
      });
    });

    await waitFor(() => {
      expect(getByText("This is a test post")).toBeInTheDocument();
      expect(getByText("This is a test post 3")).toBeInTheDocument();
      expect(() => getByText("This is test post 2")).toThrow();
    });

    act(() => {
      fireEvent.change(searchInput, { target: { value: "User 1" } });
    });

    await waitFor(() => {
      expect(getByText("This is a test post")).toBeInTheDocument();
    });
  });

  it("should add articles when adding a follower (posts state is larger)", async () => {
    setupFetchMock();

    const { getByPlaceholderText, getByText, container } = renderMainView();

    const addUserButton = getByText("Add");

    await waitFor(() => {
      const followedUsers = getFollowListForUser(user.id, users);
      const expectedPosts = posts.filter(
        (post) =>
          post.userId === user.id ||
          followedUsers.some((followedUser) => followedUser.id === post.userId)
      );
      const initialArticles = expectedPosts.length;

      const newFollowerName = "User 5";
      const addFollowerInput = getByPlaceholderText("Add follower by name");
      fireEvent.change(addFollowerInput, {
        target: { value: newFollowerName },
      });
      fireEvent.click(addUserButton);

      expect(getByText("This is test post 5")).toBeInTheDocument();

      const postDivs = container.querySelectorAll('[data-testid="post"]');
      const numberOfPosts = postDivs.length;
      expect(numberOfPosts).toBeGreaterThan(initialArticles);
    });
  });

  it("should remove articles when removing a follower", async () => {
    setupFetchMock();

    const { container } = renderMainView();

    await waitFor(() => {
      const postDivs = container.querySelectorAll('[data-testid="post"]');
      expect(postDivs.length).toBeGreaterThan(0);
    });

    let followedUsers = [];
    let initialArticles = 0;

    await waitFor(() => {
      followedUsers = getFollowListForUser(user.id, users);
      const expectedPosts = posts.filter(
        (post) =>
          post.userId === user.id ||
          followedUsers.some((followedUser) => followedUser.id === post.userId)
      );
      initialArticles = expectedPosts.length;
    });

    const firstUserId = followedUsers[0].id;

    const firstUnfollowButton = screen.queryByTestId(`unfollow-${firstUserId}`);
    fireEvent.click(firstUnfollowButton);

    await waitFor(() => {
      const postDivs = container.querySelectorAll('[data-testid="post"]');
      const numberOfPosts = postDivs.length;
      expect(numberOfPosts).toBeLessThan(initialArticles);
    });
  });

  it("displays the initial status and allows editing", () => {
    const { getByText, getByDisplayValue } = renderMainView();

    expect(getByText(user.company.catchPhrase)).toBeInTheDocument();

    const editButton = getByText("Edit Status");
    act(() => {
      fireEvent.click(editButton);
    });

    const statusInput = getByDisplayValue(user.company.catchPhrase);
    expect(statusInput).toBeInTheDocument();

    act(() => {
      fireEvent.change(statusInput, { target: { value: "newStatusPhrase" } });
      fireEvent.click(getByText("Update"));
    });

    expect(getByText("newStatusPhrase")).toBeInTheDocument();
    expect(localStorage.getItem("status1")).toBe("newStatusPhrase");
  });

  it("should allow creating a new post and displays it", async () => {
    setupFetchMock();
    const { getByPlaceholderText, getByText } = renderMainView();
    const bodyInput = getByPlaceholderText("Add new article");

    fireEvent.change(bodyInput, { target: { value: "New post content" } });
    fireEvent.click(getByText("Post"));

    await waitFor(() => {
      expect(getByText("New post content")).toBeInTheDocument();
    });

    fireEvent.click(getByText("Cancel"));

    expect(bodyInput.value).toBe("");
  });
});

const mockPostId = 1;
const mockInitialComments = [
  { id: 1, postId: mockPostId, text: "First Comment", author: "User1" },
  { id: 2, postId: mockPostId, text: "Second Comment", author: "User2" },
  { id: 3, postId: mockPostId, text: "Thrid Comment", author: "User3" },
];
const mockUsers = [];

describe("Comments Component", () => {
  it("renders a maximum of two comments by default", () => {
    const { queryAllByRole } = render(
      <Comments
        postId={mockPostId}
        initialComments={mockInitialComments}
        users={mockUsers}
      />
    );

    const listItems = queryAllByRole("listitem");
    expect(listItems.length).toBe(2);
  });

  it("displays comments when IconButton is clicked", async () => {
    const { getByTestId } = render(
      <Comments
        postId={mockPostId}
        initialComments={mockInitialComments}
        users={mockUsers}
      />
    );

    expect(getByTestId(`comment-for-post${mockPostId}`)).toHaveTextContent(
      "First Comment"
    );
    expect(getByTestId(`comment-for-post${mockPostId}`)).not.toHaveTextContent(
      "Thrid Comment"
    );

    act(() => {
      fireEvent.click(getByTestId(`comment-display-${mockPostId}`));
    });

    await waitFor(() => {
      expect(getByTestId(`comment-for-post${mockPostId}`)).toHaveTextContent(
        "Thrid Comment"
      );
    });
  });

  it("should collapse comments when clicked outside", () => {
    const { getByTestId, container } = render(
      <Comments
        postId={mockPostId}
        initialComments={mockInitialComments}
        users={mockUsers}
      />
    );

    act(() => {
      fireEvent.click(getByTestId(`comment-display-${mockPostId}`));
      fireEvent.mouseDown(container);
    });

    expect(getByTestId(`comment-for-post${mockPostId}`)).not.toHaveTextContent(
      "Thrid Comment"
    );
  });

  it("should add a new comment", async () => {
    const { getByTestId, getByPlaceholderText, getByText } = render(
      <Comments
        postId={mockPostId}
        initialComments={mockInitialComments}
        users={mockUsers}
      />
    );

    act(() => {
      fireEvent.click(getByTestId(`comment-display-${mockPostId}`));
    });

    const textField = getByPlaceholderText("Add a comment...");
    const addButton = getByText("Add Comment");

    await act(async () => {
      fireEvent.change(textField, { target: { value: "New Test Comment" } });
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(getByTestId(`comment-for-post${mockPostId}`)).toHaveTextContent(
        "New Test Comment"
      );
      expect(textField.value).toBe("");
    });
  });
});
