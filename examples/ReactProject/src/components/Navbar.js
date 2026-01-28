import React from 'react';

// STANDARD NAVBAR COMPONENT
// Arabify should find the <nav> here and inject <LanguageToggle />

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="logo">MyBrand</div>
            <ul className="nav-links">
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
                {/* Arabify should inject toggle here */}
            </ul>
        </nav>
    );
};

export default Navbar;
