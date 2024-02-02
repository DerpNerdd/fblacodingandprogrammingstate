// script.js file

document.addEventListener('scroll', function() {
    var line = document.getElementById('animated-line');
    line.style.transform = 'translateY(' + window.pageYOffset + 'px)';
  });
  