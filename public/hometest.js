// script.js file

document.addEventListener('scroll', function() {
    var line = document.getElementById('animated-line');
    line.style.transform = 'translateY(' + window.pageYOffset + 'px)';
  });
  
  document.querySelectorAll('.info-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
  
      // Calculate deltas for tilt with a dead zone near edges
      const edgeDeadZone = 20; // Pixels from the edge which are less sensitive
      let deltaX = (x - centerX) / 50; // Adjust the divisor to control the tilt sensitivity
      let deltaY = (y - centerY) / 50; // Adjust the divisor to control the tilt sensitivity
  
      // Apply a dead zone
      if (Math.abs(x - centerX) < edgeDeadZone) deltaX = 0;
      if (Math.abs(y - centerY) < edgeDeadZone) deltaY = 0;
  
      this.style.transform = `rotateX(${deltaY * -1}deg) rotateY(${deltaX}deg)`;
  
      // Highlight effect adjustments
      const highlight = this.querySelector('.highlight-effect');
      highlight.style.opacity = 1;
      highlight.style.transform = `translate(-50%, -50%) scale(1)`;
      highlight.style.left = `${x}px`;
      highlight.style.top = `${y}px`;
    });
  
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'rotateX(0) rotateY(0)';
      const highlight = this.querySelector('.highlight-effect');
      highlight.style.opacity = 0;
      highlight.style.transform = 'translate(-50%, -50%) scale(0)';
    });
  });
  