import React from "react";
import { act, render, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import fetchMock from "jest-fetch-mock";
import "@testing-library/jest-dom/extend-expect";
import Login from "../components/landing/Login";
import MainView from "../components/main/Main";
import RegistrationForm from "../components/landing/Registration";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

fetchMock.enableMocks();

const users = [
  {
    id: 1,
    username: "Antonette",
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
];

beforeEach(() => {
  localStorage.clear();
  fetchMock.resetMocks();
});

describe("Login", () => {
  const setup = (responses) => {
    fetch.mockResponseOnce(JSON.stringify(responses));

    const utils = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = utils.getByLabelText(/username/i);
    const passwordInput = utils.getByLabelText(/password/i);
    const loginButton = utils.getByText(/login/i);

    return {
      usernameInput,
      passwordInput,
      loginButton,
      ...utils,
    };
  };

  it("should log in a previously registered user", async () => {
    const { usernameInput, passwordInput, loginButton } = setup([
      { username: "Antonette", address: { street: "Victor Plains" } },
    ]);

    fireEvent.change(usernameInput, { target: { value: "Antonette" } });
    fireEvent.change(passwordInput, { target: { value: "Victor Plains" } });

    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(localStorage.getItem("user")).toEqual(
        JSON.stringify({
          username: "Antonette",
          address: { street: "Victor Plains" },
          password: "Victor Plains",
        })
      );
    });
  });

  it("should not log in an invalid user", async () => {
    const { usernameInput, passwordInput, loginButton } = setup([
      { username: "Antonette", address: { street: "Victor Plains" } },
    ]);

    fireEvent.change(usernameInput, { target: { value: "invalidUser" } });
    fireEvent.change(passwordInput, { target: { value: "invalidPassword" } });

    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  it("should not log in a user with the wrong password", async () => {
    const { usernameInput, passwordInput, loginButton } = setup([
      { username: "Antonette", address: { street: "Victor Plains" } },
    ]);

    fireEvent.change(usernameInput, { target: { value: "Antonette" } });
    fireEvent.change(passwordInput, { target: { value: "wrongPassword" } });

    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  it("should display user does not exist message for invalid username", async () => {
    const { usernameInput, passwordInput, loginButton, findByText } = setup([
      { username: "Antonette", address: { street: "Victor Plains" } },
    ]);

    fireEvent.change(usernameInput, { target: { value: "InvalidUser" } });
    fireEvent.change(passwordInput, { target: { value: "Victor Plains" } });

    await act(async () => {
      fireEvent.click(loginButton);
    });

    const userNotExistMessage = await findByText("User does not exist!");
    expect(userNotExistMessage).toBeInTheDocument();
  });

  it("should display password does not match username message for invalid password", async () => {
    const { usernameInput, passwordInput, loginButton, findByText } = setup([
      { username: "Antonette", address: { street: "Victor Plains" } },
    ]);

    fireEvent.change(usernameInput, { target: { value: "Antonette" } });
    fireEvent.change(passwordInput, { target: { value: "InvalidPassword" } });

    await act(async () => {
      fireEvent.click(loginButton);
    });

    const passwordNotMatchMessage = await findByText(
      "Password does not match username!"
    );
    expect(passwordNotMatchMessage).toBeInTheDocument();
  });
});

describe("MainView", () => {
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
      body: "This is another test post",
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
      body: "This is another test post 4",
    },
  ];

  beforeEach(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, username: "Antonette" })
    );
    localStorage.setItem("userPhoto", "testPhoto");
  });

  afterEach(() => {
    localStorage.clear();
    fetchMock.resetMocks();
  });

  it("should log out a user (login state should be cleared)", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(users),
      })
    );
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(posts),
      })
    );

    const { getByText } = render(
      <MemoryRouter>
        <MainView />
      </MemoryRouter>
    );

    expect(localStorage.getItem("user")).not.toBeNull();

    const logoutButton = getByText("Logout");
    act(() => {
      fireEvent.click(logoutButton);
    });

    await waitFor(() => {
      expect(localStorage.getItem("user")).toBeNull();
      expect(localStorage.getItem("userPhoto")).toBeNull();
    });
  });
});

function waitForLocationChange() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 0);
  });
}

describe("RegistrationForm", () => {
  afterEach(() => {
    mockNavigate.mockReset();
  });

  it("should render correctly", () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <RegistrationForm />
      </MemoryRouter>
    );

    expect(getByLabelText("Account Name")).toBeInTheDocument();
    expect(getByLabelText("Display Name (Optional)")).toBeInTheDocument();
    expect(getByLabelText("Email")).toBeInTheDocument();
    expect(getByLabelText("Phone Number")).toBeInTheDocument();
    expect(getByLabelText("Date of Birth")).toBeInTheDocument();
    expect(getByLabelText("Zipcode")).toBeInTheDocument();
    expect(getByLabelText("Password")).toBeInTheDocument();
    expect(getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("shows error message when username is taken", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(users),
      })
    );
    const { getByLabelText, getByText, findByText } = render(
      <MemoryRouter>
        <RegistrationForm />
      </MemoryRouter>
    );

    const userNameInput = getByLabelText("Account Name");
    fireEvent.change(userNameInput, { target: { value: "Antonette" } });

    const registerButton = getByText("Register");
    await act(async () => {
      fireEvent.click(registerButton);
    });

    const errorMessage = await findByText("This username is already taken.");
    expect(errorMessage).toBeInTheDocument();
  });

  it("submits the form when valid data is entered", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(users),
      })
    );
    const { getByLabelText, getByText } = render(
      <MemoryRouter initialEntries={["/registration"]}>
        <RegistrationForm />
      </MemoryRouter>
    );

    fireEvent.change(getByLabelText("Account Name"), {
      target: { value: "NewUser" },
    });
    fireEvent.change(getByLabelText("Email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(getByLabelText("Phone Number"), {
      target: { value: "123-456-7890" },
    });
    fireEvent.change(getByLabelText("Date of Birth"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByLabelText("Zipcode"), { target: { value: "12345" } });
    fireEvent.change(getByLabelText("Password"), {
      target: { value: "password" },
    });
    fireEvent.change(getByLabelText("Confirm Password"), {
      target: { value: "password" },
    });

    const registerButton = getByText("Register");
    await act(async () => {
      fireEvent.click(registerButton);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/main");
    });

    const userData = JSON.parse(localStorage.getItem("user"));
    // console.log(userData);
    expect(userData).toEqual(
      expect.objectContaining({
        username: "NewUser",
        email: "newuser@example.com",
        phone: "123-456-7890",
        dob: "2000-01-01",
        address: expect.objectContaining({
          zipcode: "12345",
        }),
        password: "password",
      })
    );
  });

  it("shows an error message for invalid inputs", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve(users),
      })
    );
    const { getByLabelText, getByText, findByText } = render(
      <MemoryRouter>
        <RegistrationForm />
      </MemoryRouter>
    );

    const emailInput = getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "12@1.v" } });

    const passwordInput = getByLabelText("Password");
    fireEvent.change(passwordInput, { target: { value: "password1" } });

    const confirmPasswordInput = getByLabelText("Confirm Password");
    fireEvent.change(confirmPasswordInput, { target: { value: "password2" } });

    const phoneNumberInput = getByLabelText("Phone Number");
    fireEvent.change(phoneNumberInput, {
      target: { value: "invalid-phone-number" },
    });

    const zipcodeInput = getByLabelText("Zipcode");
    fireEvent.change(zipcodeInput, { target: { value: "invalid-zipcode" } });

    const userNameInput = getByLabelText("Account Name");
    fireEvent.change(userNameInput, { target: { value: "Antonette1" } });

    const dobInput = getByLabelText("Date of Birth");
    fireEvent.change(dobInput, { target: { value: "2010-01-01" } });

    const registerButton = getByText("Register");
    await act(async () => {
      fireEvent.click(registerButton);
    });

    const emailErrorMessage = await findByText("Invalid email format.");
    expect(emailErrorMessage).toBeInTheDocument();

    const passwordErrorMessage = await findByText(
      "Password and password confirmation do not match."
    );
    expect(passwordErrorMessage).toBeInTheDocument();

    const phoneErrorMessage = await findByText(
      "Invalid phone number format. Expected: xxx-xxx-xxxx"
    );
    expect(phoneErrorMessage).toBeInTheDocument();

    const zipcodeErrorMessage = await findByText(
      "Zipcode should be five digits."
    );
    expect(zipcodeErrorMessage).toBeInTheDocument();

    const dobErrorMessage = await findByText(
      "Only individuals 18 years of age or older can register."
    );
    expect(dobErrorMessage).toBeInTheDocument();
  });
});
