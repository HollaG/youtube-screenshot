import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Theme, ThemePanel } from "@radix-ui/themes";
import Body from "./components/Body";

function App() {
    return (
        <Theme appearance="dark" accentColor="purple" grayColor="mauve">
            <Body />
            {/* <ThemePanel /> */}
        </Theme>
    );
}

export default App;
