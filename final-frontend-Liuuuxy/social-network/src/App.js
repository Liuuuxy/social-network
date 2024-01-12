import Navigation from "./Navigation";
import { UserProvider } from "./UserContext";
import "./index.css";

function App() {
  return (
    <UserProvider>
      <Navigation />
    </UserProvider>
  );
}

export default App;