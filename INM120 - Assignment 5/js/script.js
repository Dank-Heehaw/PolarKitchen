const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-navigation");
const navLinks = document.querySelectorAll(".nav-link");
const backToTop = document.querySelector(".back-to-top");
const dialog = document.querySelector(".reservation-dialog");
const closeDialogButton = document.querySelector(".dialog-close");
const reservationButtons = document.querySelectorAll(".open-reservation");
const reservationForm = document.querySelector("#reservation-form");
const dateInput = reservationForm.querySelector('input[type="date"]');
const formMessage = document.querySelector(".form-message");

const closeNavigation = () => {
    navigation.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector(".sr-only").textContent = "Open navigation";
};

menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    navigation.classList.toggle("open", !isOpen);
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.querySelector(".sr-only").textContent = isOpen ? "Open navigation" : "Close navigation";
});

navLinks.forEach((link) => link.addEventListener("click", closeNavigation));

document.addEventListener("click", (event) => {
    if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) {
        closeNavigation();
    }
});

const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            navLinks.forEach((link) => {
                link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
            });
        });
    },
    { rootMargin: "-35% 0px -55%", threshold: 0 }
);

document.querySelectorAll("main > section[id]").forEach((section) => sectionObserver.observe(section));

window.addEventListener(
    "scroll",
    () => {
        backToTop.classList.toggle("visible", window.scrollY > 600);
    },
    { passive: true }
);

backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

const today = new Date();
const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
dateInput.min = localDate;

reservationButtons.forEach((button) => {
    button.addEventListener("click", () => {
        formMessage.textContent = "";
        dialog.showModal();
    });
});

closeDialogButton.addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
});

reservationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(reservationForm);
    const name = formData.get("name").trim().split(" ")[0];
    formMessage.textContent = `Thanks, ${name}! Your demo reservation has been saved.`;
    reservationForm.reset();
    dateInput.min = localDate;
});

document.querySelector("#year").textContent = new Date().getFullYear();
