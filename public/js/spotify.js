document.querySelectorAll(".mood").forEach((mood) => {
  mood.addEventListener("click", () => {
    const moodName = mood.querySelector("p").innerText.toLowerCase();

    window.location.href = `/moodpage?mood=${moodName}`;
  });
});
