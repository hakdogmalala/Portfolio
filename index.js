// Kuhain ang mga HTML element na gagamitin ng JavaScript.
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const header = document.querySelector(".site-header");
const resumePreviewDialog = document.querySelector("#resume-preview-dialog");
const openResumePreview = document.querySelector("#open-resume-preview");
const closeResumePreview = document.querySelector("#close-resume-preview");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

// Isara ang mobile navigation at i-reset ang accessibility state nito.
// restoreFocus=true ay inililipat ang keyboard focus pabalik sa menu button.
function closeMenu({ restoreFocus = false } = {}) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navLinks.classList.remove("open");
    document.body.classList.remove("menu-open");
    if (restoreFocus) menuToggle.focus();
}

// Buksan o isara ang mobile menu kapag pinindot ang hamburger button.
menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navLinks.classList.toggle("open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
});

// Isara ang mobile menu pagkatapos pumili ang user ng navigation link.
navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
});

// Isara rin ang mobile menu kapag nag-click sa bahagi sa labas nito.
document.addEventListener("click", (event) => {
    if (menuToggle.getAttribute("aria-expanded") === "true"
        && !navLinks.contains(event.target)
        && !menuToggle.contains(event.target)) {
        closeMenu();
    }
});

// Support para sa keyboard: isara ang menu gamit ang Escape key.
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("open")) {
        closeMenu({ restoreFocus: true });
    }
});

// I-reset ang mobile menu kapag lumipat ang screen sa desktop layout.
window.addEventListener("resize", () => {
    if (window.innerWidth > 720) closeMenu();
});

// Buksan ang resume preview dialog at gamitin ang fallback para sa lumang browsers.
openResumePreview.addEventListener("click", () => {
    if (typeof resumePreviewDialog.showModal === "function") {
        resumePreviewDialog.showModal();
    } else {
        resumePreviewDialog.setAttribute("open", "");
    }
});

// Isara ang resume modal sa close button o kapag nag-click sa labas ng dialog.
closeResumePreview.addEventListener("click", () => resumePreviewDialog.close());
resumePreviewDialog.addEventListener("click", (event) => {
    if (event.target === resumePreviewDialog) resumePreviewDialog.close();
});

// Buksan ang malaking preview ng certificate na pinili sa gallery.
// Itakda ang mga elementong magpapakita ng larawan, pamagat, at close control.
const certificatePreviewDialog = document.querySelector("#certificate-preview-dialog");
const certificatePreviewImage = document.querySelector("#certificate-preview-image");
const certificatePreviewTitle = document.querySelector("#certificate-preview-title");
const closeCertificatePreview = document.querySelector("#close-certificate-preview");

// Ikabit ang click event sa bawat thumbnail at ipakita ang katumbas nitong larawan.
document.querySelectorAll(".certificate-preview").forEach((button) => {
    button.addEventListener("click", () => {
        // Kunin ang source at pamagat mula sa data attributes ng thumbnail.
        certificatePreviewImage.src = button.dataset.certificateSrc;
        certificatePreviewImage.alt = button.dataset.certificateTitle;
        certificatePreviewTitle.textContent = button.dataset.certificateTitle;
        // Buksan ang native dialog bilang modal para sa mas malaking preview.
        certificatePreviewDialog.showModal();
    });
});

// Isara ang preview gamit ang close button.
closeCertificatePreview.addEventListener("click", () => certificatePreviewDialog.close());

// Isara rin ito kapag nag-click sa backdrop sa labas ng dialog.
certificatePreviewDialog.addEventListener("click", (event) => {
    if (event.target === certificatePreviewDialog) certificatePreviewDialog.close();
});

// I-validate at ipadala ang contact form sa FormSubmit AJAX endpoint.
contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Huwag magpatuloy kung kulang o hindi valid ang kinakailangang impormasyon.
    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(contactForm);
    formData.set("_replyto", contactForm.elements.email.value.trim());
    submitButton.disabled = true;
    contactForm.setAttribute("aria-busy", "true");
    formStatus.textContent = "Sending your message...";

    try {
        const response = await fetch(contactForm.dataset.ajaxEndpoint, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: formData
        });
        const result = await response.json();

        if (!response.ok || String(result.success).toLowerCase() !== "true") {
            throw new Error(result.message || `FormSubmit returned HTTP ${response.status}.`);
        }

        contactForm.reset();
        formStatus.textContent = "Thanks! Your message has been sent.";
    } catch (error) {
        console.error("Contact form submission failed:", error);
        formStatus.textContent = "Unable to send right now. Please email benjiep.campos@gmail.com directly.";
    } finally {
        submitButton.disabled = false;
        contactForm.removeAttribute("aria-busy");
    }
});

// I-highlight ang navigation link na tumutugma sa kasalukuyang nakikitang section.
const sections = document.querySelectorAll("main section[id]");
const navigationItems = document.querySelectorAll(".nav-links a[href^='#']");
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navigationItems.forEach((item) => {
            item.classList.toggle("active", item.getAttribute("href") === "#" + entry.target.id);
        });
    });
}, { rootMargin: "-35% 0px -55%", threshold: 0 });

sections.forEach((section) => sectionObserver.observe(section));

// Piliin ang mga elemento na lalabas nang may banayad na animation habang nag-scroll.
const revealItems = document.querySelectorAll(
    ".hero-copy, .portrait-wrap, .about-grid > *, .section-heading, .skill-card, .certificate-card, .contact-inner > *"
);

// Igalang ang "prefers-reduced-motion" setting ng device para sa accessibility.
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("reveal"));

    // Magdagdag ng revealed class lamang kapag nakikita na ang elemento.
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
}

// Gumawa at ipakita ang progress bar na nagsasabi kung gaano kalayo ang scroll.
const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
progressBar.setAttribute("aria-hidden", "true");
document.body.prepend(progressBar);

// I-update ang header shadow at lapad ng scroll progress bar.
function updateScrollState() {
    header.classList.toggle("scrolled", window.scrollY > 12);
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
}

updateScrollState();
window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);

// Gawing smooth ang pag-scroll kapag pumindot sa anumang anchor link.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (history.pushState) history.pushState(null, "", link.getAttribute("href"));
    });
});

// Ipakita ang kasalukuyang taon sa copyright text.
document.querySelector("#current-year").textContent = new Date().getFullYear();

// Kunin ang lalagyan ng portrait na gagalawin kapag naka-hover ang cursor.
const portrait = document.querySelector(".portrait");

// Patakbuhin lang ang effect kung may mouse/trackpad at pinapayagan ang animation.
if (portrait && window.matchMedia("(hover: hover) and (pointer: fine)").matches
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Kalkulahin ang layo ng cursor sa gitna at gawing maliit na 3D tilt.
    portrait.addEventListener("mousemove", (event) => {
        const bounds = portrait.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        const tiltY = (x - 0.5) * 10;
        const tiltX = (0.5 - y) * 10;

        // Ibigay ang anggulo sa CSS custom properties para ma-animate ang larawan.
        portrait.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
        portrait.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
        // I-activate ang CSS hover style para sa kaunting paglaki at anino.
        portrait.classList.add("is-hovered");
    });

    // Ibalik sa gitna ang larawan at alisin ang hover style kapag umalis ang cursor.
    portrait.addEventListener("mouseleave", () => {
        portrait.style.setProperty("--tilt-x", "0deg");
        portrait.style.setProperty("--tilt-y", "0deg");
        portrait.classList.remove("is-hovered");
    });
}
