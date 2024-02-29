document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const closeNav = document.getElementById('close-nav');
    const sideNav = document.querySelector('.side-navbar');
    const themeToggle = document.getElementById('theme-toggle');

    menuToggle.addEventListener('click', () => {
        sideNav.classList.add('active');
    });

    closeNav.addEventListener('click', () => {
        sideNav.classList.remove('active');
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });
});
