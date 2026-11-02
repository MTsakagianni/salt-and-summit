function handleContactSubmit(event) {
    // Capture the details locally instead of submitting the form to a server.
    event.preventDefault();

    const nameInput = document.querySelector("#contact-name");
    const emailInput = document.querySelector("#contact-email");
    const subjectInput = document.querySelector("#contact-subject");
    const messageInput = document.querySelector("#contact-message");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();

    // HTML handles required fields and email format before this submit handler runs.
    // Reject whitespace-only text, which native required validation accepts.
    if (name === "" || subject === "" || message === "") {
        alert("Please enter a name, subject and message, not just spaces.");
        return;
    }

    // Show the captured details in the confirmation popup required by the assignment.
    // No email is sent because this application has no server-side submission.
    alert(
        "Your message details:\n\n" +
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Subject: " + subject + "\n" +
        "Message: " + message
    );

    // Clear the form after the user dismisses the confirmation.
    event.currentTarget.reset();
}

function initialiseContactForm() {
    const contactForm = document.querySelector("#contact-form");

    // Listen on the form so submission works through both the button and keyboard.
    contactForm.addEventListener("submit", handleContactSubmit);
}

initialiseContactForm();