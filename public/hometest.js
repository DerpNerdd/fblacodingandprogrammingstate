// script.js file

document.addEventListener('scroll', function() {
    var line = document.getElementById('animated-line');
    line.style.transform = 'translateY(' + window.pageYOffset + 'px)';
  });
  
  document.querySelector('.info-card').addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = (x - centerX) / 50; // More subtle tilt
    const deltaY = (y - centerY) / 50; // More subtle tilt

    this.style.transform = `rotateX(${deltaY * -1}deg) rotateY(${deltaX}deg)`;

    // Correctly target the highlight effect element
    const highlight = this.querySelector('.highlight-effect');
    highlight.style.opacity = 1;
    highlight.style.left = `${x}px`;
    highlight.style.top = `${y}px`;
    highlight.style.transform = 'translate(-50%, -50%) scale(1)';
});

document.querySelector('.info-card').addEventListener('mouseleave', function(e) {
    this.style.transform = 'rotateX(0) rotateY(0)';
    // Hide the highlight effect correctly
    const highlight = this.querySelector('.highlight-effect');
    highlight.style.opacity = 0;
    highlight.style.transform = 'translate(-50%, -50%) scale(0)';
});
