document.addEventListener("DOMContentLoaded", function() {
    const section = document.getElementById("dynamicBackground");
    const numberOfSpans = 150; // Adjust the number of spans you want to generate

    for (let i = 0; i < numberOfSpans; i++) {
        const span = document.createElement("span");
        section.appendChild(span);

        span.addEventListener("mouseover", () => {
            span.style.transition = "0s";
            span.style.background = "#3c0568";
        });

        span.addEventListener("mouseout", () => {
            span.style.transition = "1.5s";
            span.style.background = "#181818";
        });
    }
});
