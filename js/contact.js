function handleContactSubmit(event) {
    event.preventDefault();

    const nameInput = document.querySelector("#contact-name");
    const emailInput = document.querySelector("#contact-email");
    const subjectInput = document.querySelector("#contact-subject");
    const messageInput = document.querySelector("#contact-message");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();

    if (name === "" || subject === "" || message === "") {
        alert("Please enter a name, subject and message, not just spaces.");
        return;
    }

    alert(
        "Your message details:\n\n" +
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Subject: " + subject + "\n" +
        "Message: " + message
    );

    event.currentTarget.reset();
}

function initialiseContactForm() {
    const contactForm = document.querySelector("#contact-form");

    contactForm.addEventListener("submit", handleContactSubmit);
}

initialiseContactForm();