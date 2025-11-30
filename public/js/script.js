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
// THEME TOGGLE (FINAL CLEAN VERSION)
// ------------------------------

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

const mobileThemeToggle = document.getElementById("mobile-theme-toggle");
const mobileThemeIcon = document.getElementById("mobile-theme-icon");
const mobileThemeText = document.getElementById("mobile-theme-text");

// Function: Update UI icons + text
function applyThemeUI(isDark) {
  if (isDark) {
    themeIcon?.classList.replace("fa-moon", "fa-sun");
    mobileThemeIcon?.classList.replace("fa-moon", "fa-sun");
    mobileThemeText && (mobileThemeText.textContent = "Light Mode");
  } else {
    themeIcon?.classList.replace("fa-sun", "fa-moon");
    mobileThemeIcon?.classList.replace("fa-sun", "fa-moon");
    mobileThemeText && (mobileThemeText.textContent = "Dark Mode");
  }
}

// Function: Apply theme + save to localStorage + update UI
function setTheme(isDark) {
  if (isDark) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
  applyThemeUI(isDark);
}

// ------------------------------
// INITIAL LOAD THEME CHECK
// ------------------------------
const savedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches;

// Saved theme → apply it
if (savedTheme === "dark") {
  setTheme(true);
} else if (savedTheme === "light") {
  setTheme(false);
} else {
  // No saved theme → follow system
  setTheme(systemPrefersDark);
}

// ------------------------------
// DESKTOP TOGGLE
// ------------------------------
themeToggle?.addEventListener("click", () => {
  const isDark = !document.documentElement.classList.contains("dark");
  setTheme(isDark);
});

// ------------------------------
// MOBILE TOGGLE
// ------------------------------
mobileThemeToggle?.addEventListener("click", () => {
  const isDark = !document.documentElement.classList.contains("dark");
  setTheme(isDark);
});

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
