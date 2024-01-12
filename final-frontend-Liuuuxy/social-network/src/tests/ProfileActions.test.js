import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import DisplayInfo from "../components/Profile/DisplayInfo";
import Profile from "../components/Profile/Profile";
import UserProfilePhoto from "../components/Profile/UserProfilePhoto";

const user = {
  username: "TestUser",
  email: "Sincere@april.biz",
  phone: "1-770-736-8031 x56442",
  address: {
    zipcode: "92998-3874",
  },
  password: "Kulas Light",
  dob: "1990-01-01",
};

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify(user));
});

afterEach(() => {
  localStorage.clear();
});

describe("DisplayInfo", () => {
  it("should fetch the logged-in user's profile username", () => {
    render(<DisplayInfo />);
    const usernameElement = screen.getByText("TestUser");
    expect(usernameElement).toBeInTheDocument();
  });

  it("should save user data when 'Save' is clicked", async () => {
    render(<DisplayInfo />);

    fireEvent.click(screen.getByText("Edit Profile"));

    const pwdInput = screen.getByLabelText(
      "Password (Leave blank if no change)"
    );
    fireEvent.change(pwdInput, { target: { value: "new" } });
    const conpwdInput = screen.getByLabelText("Confirm Password");
    fireEvent.change(conpwdInput, { target: { value: "new" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      expect(savedUser.password).toEqual("new");
      expect(screen.getByText("***")).toBeInTheDocument();
    });
  });

  it("should display validation error when email is invalid", async () => {
    render(<DisplayInfo />);

    fireEvent.click(screen.getByText("Edit Profile"));

    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email address.")).toBeInTheDocument();
    });
  });

  it("should display validation error when phone number is invalid", async () => {
    render(<DisplayInfo />);

    fireEvent.click(screen.getByText("Edit Profile"));

    const phoneInput = screen.getByLabelText("Phone");
    fireEvent.change(phoneInput, { target: { value: "invalid-phone" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Phone number must be in 'ddd-ddd-dddd' or 'ddd-ddd-dddd xddddd' format."
        )
      ).toBeInTheDocument();
    });
  });

  it("should display validation error when zipcode is invalid", async () => {
    render(<DisplayInfo />);

    fireEvent.click(screen.getByText("Edit Profile"));

    const zipcodeInput = screen.getByLabelText("Zipcode");
    fireEvent.change(zipcodeInput, { target: { value: "invalid-zipcode" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Zipcode must be 5 digits or 5 digits with extension \(xxxxx-xxxx\)\./
        )
      ).toBeInTheDocument();
    });
  });

  it("should display validation error when password and confirmation do not match", async () => {
    render(<DisplayInfo />);

    fireEvent.click(screen.getByText("Edit Profile"));

    const passwordInput = screen.getByLabelText(
      "Password (Leave blank if no change)"
    );
    fireEvent.change(passwordInput, { target: { value: "new-password" } });

    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    fireEvent.change(confirmPasswordInput, {
      target: { value: "mismatched-password" },
    });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password and password confirmation do not match.")
      ).toBeInTheDocument();
    });
  });

  it("should reset form when 'Cancel' is clicked", async () => {
    render(<DisplayInfo />);

    fireEvent.click(screen.getByText("Edit Profile"));

    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "newemail@example.com" } });

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText("TestUser")).toBeInTheDocument();
      expect(screen.getByText("Sincere@april.biz")).toBeInTheDocument();
    });
  });
});

describe("Profile", () => {
  it("should render the Profile component", () => {
    const { container } = render(<Profile />);
    const profileContainer = container.querySelector(".profile-container");
    expect(profileContainer).toBeInTheDocument();
  });

  it("should render the NavBar component", () => {
    render(<Profile />);

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("should render the UserProfilePhoto component", () => {
    render(<Profile />);

    expect(screen.getByTestId("user-profile-photo")).toBeInTheDocument();
  });

  it("should render the DisplayInfo component", () => {
    render(<Profile />);

    expect(screen.getByTestId("display-info")).toBeInTheDocument();
  });
});

describe("UserProfilePhoto", () => {
  beforeAll(() => {
    global.URL.createObjectURL = jest.fn();
    global.URL.createObjectURL.mockReturnValue(
      "blob:http://localhost:3000/123456"
    );
  });

  afterAll(() => {
    global.URL.createObjectURL.mockRestore();
  });

  it("should render default photo", () => {
    const { getByAltText } = render(<UserProfilePhoto />);
    const img = getByAltText("User");
    expect(img).toHaveAttribute("src", "https://rb.gy/ckdw1");
  });

  it("should open file input when edit button is clicked", () => {
    const { getByTestId } = render(<UserProfilePhoto />);

    const fileInput = getByTestId("file-input");
    const handleClick = jest.fn();
    fileInput.addEventListener("click", handleClick);

    const editButton = getByTestId("edit-btn");
    fireEvent.click(editButton);

    expect(handleClick).toHaveBeenCalledTimes(1);

    fileInput.removeEventListener("click", handleClick);
  });

  it("should handle file change", async () => {
    const { getByTestId } = render(<UserProfilePhoto />);
    const fileInput = getByTestId("file-input");

    const file = new File(["hello"], "hello.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const img = getByTestId("user-profile-photo").querySelector("img");
      expect(img).toHaveAttribute("src", expect.stringContaining("blob:"));
    });
  });

  it("should handle upload", async () => {
    const { getByTestId } = render(<UserProfilePhoto />);
    const fileInput = getByTestId("file-input");

    const file = new File(["hello"], "hello.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const uploadBtn = getByTestId("upload-btn");
      fireEvent.click(uploadBtn);
      expect(localStorage.getItem("userPhoto")).toEqual(
        expect.stringContaining("blob:")
      );
    });
  });

  it("should handle cancel", async () => {
    const { getByTestId } = render(<UserProfilePhoto />);
    const fileInput = getByTestId("file-input");

    const file = new File(["hello"], "hello.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const cancelBtn = getByTestId("cancel-btn");
      fireEvent.click(cancelBtn);
      const img = getByTestId("user-profile-photo").querySelector("img");
      expect(img).toHaveAttribute("src", "https://rb.gy/ckdw1");
    });
  });
});
