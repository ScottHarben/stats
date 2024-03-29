import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import logo from '../assets/ptf.png'

export default function Navbar(props){
  const { user, handleUserChange } = props;
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  function handleLogout() {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    handleUserChange({});
  }

  function handleLinkClick() {
    handleNavCollapse();
  }

  function handleLogoClick() {
    if (!isNavCollapsed){
      handleNavCollapse();
    }
  }

  return(
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link to="/" className="navbar-brand" onClick={handleLogoClick}>
          <img src={logo} alt="" className="logo" />
        </Link>
        {user.username === undefined ? 
        <Fragment></Fragment> : 
        <Fragment>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded={!isNavCollapsed ? true : false} aria-label="Toggle navigation" onClick={handleNavCollapse}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`${isNavCollapsed ? 'collapse' : ''}  navbar-collapse`} id="navbarTogglerDemo02">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item active">
                <Link to="/" className="nav-link" onClick={handleLinkClick}>
                  Tournament
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/log" className="nav-link" onClick={handleLinkClick}>
                  Logs
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/player" className="nav-link" onClick={handleLinkClick}>
                  Players
                </Link>
              </li>
            </ul>
            <form className="d-flex">
              <button className="btn btn-primary" type="button" onClick={handleLogout}>Log out</button>
            </form>
          </div>
        </Fragment>}
      </div>
    </nav>  
  );
}