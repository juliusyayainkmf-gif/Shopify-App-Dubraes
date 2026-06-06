(function () {
  function setupContactForm(container) {
    var form = container.querySelector("form");
    var status = container.querySelector("[data-dubraes-contact-status]");
    var apiUrl = container.getAttribute("data-api-url");

    if (!form || !status || !apiUrl || form.dataset.dubraesReady === "true") {
      return;
    }

    form.dataset.dubraesReady = "true";

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var button = form.querySelector("button[type='submit']");
      var image = form.querySelector("input[name='image']");

      if (image && image.files.length && image.files[0].size > 5 * 1024 * 1024) {
        status.textContent = "Image must be 5MB or smaller.";
        status.dataset.state = "error";
        return;
      }

      status.textContent = "Sending...";
      status.dataset.state = "loading";

      if (button) {
        button.disabled = true;
      }

      fetch(apiUrl, {
        method: "POST",
        body: new FormData(form),
      })
        .then(function (response) {
          return response.json().then(function (body) {
            if (!response.ok) {
              throw new Error(body.error || "Unable to send message.");
            }

            return body;
          });
        })
        .then(function () {
          form.reset();
          status.textContent = "Thanks. Your message was sent.";
          status.dataset.state = "success";
        })
        .catch(function (error) {
          status.textContent = error.message;
          status.dataset.state = "error";
        })
        .finally(function () {
          if (button) {
            button.disabled = false;
          }
        });
    });
  }

  function init() {
    document
      .querySelectorAll("[data-dubraes-contact-form]")
      .forEach(setupContactForm);
  }

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("shopify:section:load", init);
})();
