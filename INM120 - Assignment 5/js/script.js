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
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

const showAllContent = () => {
    const targets = document.querySelectorAll(".reveal");
    targets.forEach((element) => element.classList.add("visible"));
    if (typeof gsap !== "undefined") gsap.set(targets, { autoAlpha: 1, y: 0 });
};

const animateSection = (section) => {
    const targets = section.querySelectorAll(".reveal");

    if (prefersReducedMotion) {
        gsap.set(targets, { autoAlpha: 1, y: 0 });
        return;
    }

    gsap.killTweensOf(targets);
    gsap.fromTo(
        targets,
        { autoAlpha: 0, y: 38 },
        { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.09, ease: "power3.out" }
    );

    if (section.id === "home") {
        gsap.fromTo(
            section.querySelector(".hero-image"),
            { scale: 1.08 },
            { scale: 1, duration: 1.6, ease: "power2.out" }
        );
    }
};

const hasFullPage = typeof jQuery !== "undefined" && typeof jQuery.fn.fullpage === "function";

if (hasFullPage && typeof gsap !== "undefined") {
    gsap.set(".reveal", { autoAlpha: 0, y: 38 });

    jQuery("#main-content").fullpage({
        anchors: ["home", "menu", "reservations", "about", "contact"],
        menu: "#main-navigation",
        navigation: true,
        navigationTooltips: ["Home", "Menu", "Reservations", "About", "Contact"],
        scrollingSpeed: prefersReducedMotion ? 0 : 950,
        easingcss3: "cubic-bezier(0.76, 0, 0.24, 1)",
        scrollOverflow: true,
        verticalCentered: false,
        bigSectionsDestination: "top",
        normalScrollElements: ".reservation-dialog, #main-navigation",
        responsiveWidth: 768,
        responsiveHeight: 600,
        afterLoad(anchorLink, index) {
            const destination = document.querySelectorAll("#main-content > .section")[index - 1];
            animateSection(destination);
            backToTop.classList.toggle("visible", index > 1);
            closeNavigation();
        },
        onLeave(index, nextIndex, direction) {
            if (prefersReducedMotion) return;

            const origin = document.querySelectorAll("#main-content > .section")[index - 1];
            gsap.to(origin.querySelectorAll(".reveal"), {
                autoAlpha: 0.2,
                y: direction === "down" ? -18 : 18,
                duration: 0.35,
                ease: "power2.in"
            });
        },
        afterResponsive(isResponsive) {
            if (isResponsive) showAllContent();
        }
    });
} else {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
}

window.addEventListener(
    "scroll",
    () => backToTop.classList.toggle("visible", window.scrollY > 600),
    { passive: true }
);

backToTop.addEventListener("click", () => {
    if (hasFullPage) {
        jQuery.fn.fullpage.moveTo("home");
    } else {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
});

const today = new Date();
const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
dateInput.min = localDate;

reservationButtons.forEach((button) => {
    button.addEventListener("click", () => {
        formMessage.textContent = "";
        dialog.showModal();
        if (hasFullPage) {
            jQuery.fn.fullpage.setAllowScrolling(false);
            jQuery.fn.fullpage.setKeyboardScrolling(false);
        }
    });
});

closeDialogButton.addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
});

dialog.addEventListener("close", () => {
    if (hasFullPage) {
        jQuery.fn.fullpage.setAllowScrolling(true);
        jQuery.fn.fullpage.setKeyboardScrolling(true);
    }
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
