import React from "react";
import { ReactComponent as CustomIcon } from "./cctech_icon.svg";

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <CustomIcon className="header-icon" width="40" height="40" />
        <h1>Centre for Computational Technologies</h1>
      </div>
    </header>
  );
};

export default Header;
