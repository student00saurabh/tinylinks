// Counter Animation
const counters = document.querySelectorAll(".counter");
counters.forEach((counter) => {
  const updateCount = () => {
    const target = +counter.getAttribute("data-target");
    const count = +counter.innerText;
    const speed = 50;

    if (count < target) {
      counter.innerText = Math.ceil(count + target / speed);
      setTimeout(updateCount, 30);
    } else {
      counter.innerText = target;
    }
  };
  updateCount();
});

// Feature Card Hover Effect
const cards = document.querySelectorAll(".feature-card");

cards.forEach((card) => {
  card.addEventListener("mouseover", () => {
    card.classList.add("bg-green-600", "text-white", "scale-105");
  });

  card.addEventListener("mouseout", () => {
    card.classList.remove("bg-green-600", "text-white", "scale-105");
  });
});

// ------------------------------
// THEME TOGGLE
// ------------------------------
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

const mobileThemeToggle = document.getElementById("mobile-theme-toggle");
const mobileThemeIcon = document.getElementById("mobile-theme-icon");
const mobileThemeText = document.getElementById("mobile-theme-text");

// Detect saved theme
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
  if (themeIcon) themeIcon.classList.replace("fa-moon", "fa-sun");
  if (mobileThemeIcon) mobileThemeIcon.classList.replace("fa-moon", "fa-sun");
  if (mobileThemeText) mobileThemeText.textContent = "Light Mode";
}

// Desktop Theme Toggle
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");

    const isDark = document.documentElement.classList.contains("dark");

    if (isDark) {
      themeIcon.classList.replace("fa-moon", "fa-sun");
      localStorage.setItem("theme", "dark");
    } else {
      themeIcon.classList.replace("fa-sun", "fa-moon");
      localStorage.setItem("theme", "light");
    }
  });
}

// Mobile Theme Toggle
if (mobileThemeToggle) {
  mobileThemeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");

    const isDark = document.documentElement.classList.contains("dark");

    if (isDark) {
      mobileThemeIcon.classList.replace("fa-moon", "fa-sun");
      mobileThemeText.textContent = "Light Mode";
      localStorage.setItem("theme", "dark");
    } else {
      mobileThemeIcon.classList.replace("fa-sun", "fa-moon");
      mobileThemeText.textContent = "Dark Mode";
      localStorage.setItem("theme", "light");
    }
  });
}

// ------------------------------
// MOBILE MENU
// ------------------------------
const mobileMenuBtn = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");
const mobileMenuClose = document.getElementById("mobile-menu-close");

// Open mobile menu
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.remove("translate-x-full");
  });
}

// Close mobile menu
if (mobileMenuClose) {
  mobileMenuClose.addEventListener("click", () => {
    mobileMenu.classList.add("translate-x-full");
  });
}

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (
    mobileMenu &&
    !mobileMenu.contains(e.target) &&
    !mobileMenuBtn.contains(e.target)
  ) {
    mobileMenu.classList.add("translate-x-full");
  }
});
