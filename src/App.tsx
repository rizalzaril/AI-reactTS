import "./App.css";
import Home from "./pages/Home";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

function App() {
  return (
    <>
      <header>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <div className="flex float-end p-2">
            <UserButton />
          </div>
        </SignedIn>
      </header>

      <SignedIn>
        <Home /> {/* Render the Home component if the user is signed in */}
      </SignedIn>
    </>
  );
}

export default App;
