import React from "react";
import { Routes, Route } from "react-router-dom";
import RegistrationForm from "./components/landing/Registration";
import Login from "./components/landing/Login";
import MainView from "./components/main/Main";
import Profile from "./components/Profile/Profile";

function Navigation() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<RegistrationForm />} />
      <Route path="/main" element={<MainView />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default Navigation;