(function () {
  "use strict";

  var STORAGE_KEY = "barber_booking";

  var DAY_NAMES = [
    "sunday", "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday"
  ];

  function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours || 12;
    var minutesStr = minutes.toString().padStart(2, "0");
    return hours + ":" + minutesStr + " " + ampm;
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  }

  function dateToDateInputString(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, "0");
    var d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function parseDateInput(dateStr) {
    var parts = dateStr.split("-");
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }

  function getDayName(date) {
    return DAY_NAMES[date.getDay()];
  }

  function generateAvailableDates(weeksAhead) {
    var dates = [];
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var totalDays = weeksAhead * 7;

    for (var i = 0; i < totalDays; i++) {
      var d = new Date(today);
      d.setDate(d.getDate() + i);
      if (CONFIG.SCHEDULE.days.indexOf(getDayName(d)) !== -1) {
        dates.push(d);
      }
    }
    return dates;
  }

  function generateTimeSlots(date, durationMinutes) {
    var slots = [];
    var open = new Date(date);
    open.setHours(CONFIG.SCHEDULE.openHour, 0, 0, 0);

    var close = new Date(date);
    close.setHours(CONFIG.SCHEDULE.closeHour, 0, 0, 0);

    var interval = CONFIG.SCHEDULE.slotIntervalMinutes;
    var current = new Date(open);

    while (current < close) {
      var end = new Date(current);
      end.setMinutes(end.getMinutes() + durationMinutes);

      if (end <= close) {
        var startStr = formatTime(current);
        var endStr = formatTime(end);
        slots.push({
          value: startStr + " - " + endStr,
          display: startStr + " - " + endStr
        });
      }

      current.setMinutes(current.getMinutes() + interval);
    }
    return slots;
  }

  function loadState() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to load booking state:", e);
    }
    return null;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save booking state:", e);
    }
  }

  function clearState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear booking state:", e);
    }
  }

  var state = loadState() || {
    service: null,
    date: null,
    slot: null
  };

  function init() {
    var form = document.getElementById("booking-form");
    if (form) {
      setupBookingPage();
    }

    if (document.getElementById("services-grid")) {
      renderServicesPreview();
    }

    renderContactInfo();
    populateThankYouPage();

    if (state.service && state.date && state.slot) {
      restoreBookingUI();
    }
  }

  function renderContactInfo() {
    var phoneEl = document.getElementById("contact-phone");
    var addressEl = document.getElementById("contact-address");
    if (phoneEl && CONFIG.CONTACT) {
      phoneEl.textContent = CONFIG.CONTACT.phone || "";
    }
    if (addressEl && CONFIG.CONTACT) {
      addressEl.textContent = CONFIG.CONTACT.address || "";
    }
  }

  function populateThankYouPage() {
    var serviceEl = document.getElementById("thank-you-service");
    var datetimeEl = document.getElementById("thank-you-datetime");
    var phoneEl = document.getElementById("thank-you-phone");

    if (serviceEl && state.service) {
      serviceEl.innerHTML = "<strong>Service:</strong> " + state.service.name + " (₦" + state.service.price + ")";
    } else if (serviceEl) {
      serviceEl.textContent = "";
    }

    if (datetimeEl && state.date && state.slot) {
      datetimeEl.innerHTML = "<strong>Date:</strong> " + formatDate(state.date) + " | <strong>Time:</strong> " + state.slot.display;
    } else if (datetimeEl) {
      datetimeEl.textContent = "";
    }

    if (phoneEl && CONFIG.CONTACT) {
      phoneEl.textContent = CONFIG.CONTACT.phone || "";
    }
  }

  function restoreBookingUI() {
    if (state.service) {
      var cards = document.querySelectorAll("#services-container .service-card");
      for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove("selected");
      }
      var selectedCard = document.querySelector(
        '#services-container .service-card[data-service-id="' + state.service.id + '"]'
      );
      if (selectedCard) {
        selectedCard.classList.add("selected");
      }
      var serviceNameEl = document.getElementById("form-service-name");
      if (serviceNameEl) {
        serviceNameEl.value = state.service.name;
      }
      updateServiceSummary();
    }

    if (state.date) {
      var dateSelect = document.getElementById("date-select");
      if (dateSelect) {
        dateSelect.value = dateToDateInputString(state.date);
      }
      var dateSummary = document.getElementById("selected-date-summary");
      if (dateSummary) {
        dateSummary.innerHTML = '<span class="summary-label">Date:</span> ' + formatDate(state.date);
        dateSummary.style.display = "block";
      }
      generateAndRenderSlots();
    }

    if (state.slot) {
      var slotSummary = document.getElementById("selected-slot-summary");
      if (slotSummary) {
        slotSummary.innerHTML = '<span class="summary-label">Time:</span> ' + state.slot.display;
        slotSummary.style.display = "block";
      }
      var slotInputs = document.querySelectorAll("#slots-container input[type='radio']");
      for (var j = 0; j < slotInputs.length; j++) {
        if (slotInputs[j].value === state.slot.value) {
          slotInputs[j].checked = true;
        }
      }
      updateSlotSummary();
    }

    if (state.service && state.date && state.slot) {
      goToStep(3);
    } else if (state.service && state.date) {
      goToStep(2);
    } else if (state.service) {
      goToStep(2);
    }
  }

  function renderServicesPreview() {
    var container = document.getElementById("services-grid");
    if (!container) return;

    var html = "";
    CONFIG.SERVICES.forEach(function (s) {
      html +=
        '<div class="service-card">' +
          '<div class="service-header">' +
            '<span class="service-name">' + s.name + "</span>" +
            '<span class="service-price">₦' + s.price + "</span>" +
          "</div>" +
          '<div class="service-duration">' + s.duration + " min</div>" +
          '<div class="service-description text-muted">' + s.description + "</div>" +
        "</div>";
    });
    container.innerHTML = html;
  }

  function setupBookingPage() {
    renderServiceCards();
    renderDateOptions();

    var dateSelect = document.getElementById("date-select");
    if (dateSelect) {
      dateSelect.addEventListener("change", handleDateChange);
    }

    var slotsContainer = document.getElementById("slots-container");
    if (slotsContainer) {
      slotsContainer.addEventListener("change", handleSlotChange);
    }

    var backBtns = document.querySelectorAll("[data-back]");
    for (var i = 0; i < backBtns.length; i++) {
      backBtns[i].addEventListener("click", function (e) {
        var target = e.currentTarget.getAttribute("data-back");
        goToStep(parseInt(target));
      });
    }

    var form = document.getElementById("booking-form");
    if (form) {
      form.addEventListener("submit", handleFormSubmit);
    }
  }

  function renderServiceCards() {
    var container = document.getElementById("services-container");
    if (!container) return;

    var html = "";
    CONFIG.SERVICES.forEach(function (s) {
      html +=
        '<div class="service-card" data-service-id="' + s.id + '" role="radio" tabindex="0" aria-checked="false" aria-label="' + s.name + ', ₦' + s.price + ', ' + s.duration + ' minutes">' +
          '<div class="service-header">' +
            '<span class="service-name">' + s.name + "</span>" +
            '<span class="service-price">₦' + s.price + "</span>" +
          "</div>" +
          '<div class="service-duration">' + s.duration + " min</div>" +
          '<div class="service-description text-muted">' + s.description + "</div>" +
        "</div>";
    });
    container.innerHTML = html;

    container.addEventListener("click", function (e) {
      var card = e.target.closest(".service-card");
      if (!card) return;
      var id = card.getAttribute("data-service-id");
      var service = CONFIG.SERVICES.filter(function (s) {
        return s.id === id;
      })[0];
      if (service) {
        selectService(service);
      }
    });

    container.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        var card = e.target.closest(".service-card");
        if (!card) return;
        e.preventDefault();
        var id = card.getAttribute("data-service-id");
        var service = CONFIG.SERVICES.filter(function (s) {
          return s.id === id;
        })[0];
        if (service) {
          selectService(service);
        }
      }
    });
  }

  function selectService(service) {
    state.service = service;
    state.date = null;
    state.slot = null;

    var cards = document.querySelectorAll("#services-container .service-card");
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.remove("selected");
      cards[i].setAttribute("aria-checked", "false");
    }
    var selectedCard = document.querySelector(
      '#services-container .service-card[data-service-id="' + service.id + '"]'
    );
    if (selectedCard) {
      selectedCard.classList.add("selected");
      selectedCard.setAttribute("aria-checked", "true");
    }

    var serviceNameEl = document.getElementById("form-service-name");
    if (serviceNameEl) {
      serviceNameEl.value = service.name;
    }

    updateServiceSummary();
    goToStep(2);

    renderDateOptions();
    renderSlotsPlaceholder();
    saveState();
  }

  function updateServiceSummary() {
    var el = document.getElementById("selected-service-summary");
    if (el && state.service) {
      el.innerHTML =
        '<span class="summary-label">Selected:</span> ' +
        state.service.name +
        " (₦" + state.service.price + " · " + state.service.duration + " min)";
      el.style.display = "block";
    } else if (el) {
      el.style.display = "none";
    }
  }

  function renderDateOptions() {
    var select = document.getElementById("date-select");
    if (!select) return;

    select.innerHTML = "";
    var dates = generateAvailableDates(CONFIG.SCHEDULE.weeksAhead);

    if (dates.length === 0) {
      select.innerHTML = '<option value="">No dates available</option>';
      return;
    }

    var html = "";
    for (var i = 0; i < dates.length; i++) {
      var val = dateToDateInputString(dates[i]);
      var selected = state.date && dateToDateInputString(state.date) === val ? "selected" : "";
      html += '<option value="' + val + '" ' + selected + '>' + formatDate(dates[i]) + "</option>";
    }
    select.innerHTML = html;
  }

  function renderSlotsPlaceholder() {
    var container = document.getElementById("slots-container");
    if (container) {
      container.innerHTML =
        '<p class="text-muted" style="padding: 1rem 0;">Select a date to see available times.</p>';
    }
  }

  function handleDateChange() {
    var select = document.getElementById("date-select");
    var value = select.value;

    if (value) {
      state.date = parseDateInput(value);
      var dateStr = formatDate(state.date);
      var summary = document.getElementById("selected-date-summary");
      if (summary) {
        summary.innerHTML =
          '<span class="summary-label">Date:</span> ' + dateStr;
        summary.style.display = "block";
      }
      generateAndRenderSlots();
    } else {
      state.date = null;
      state.slot = null;
      renderSlotsPlaceholder();
      var dateSummary = document.getElementById("selected-date-summary");
      if (dateSummary) {
        dateSummary.style.display = "none";
      }
      var slotSummary = document.getElementById("selected-slot-summary");
      if (slotSummary) {
        slotSummary.style.display = "none";
      }
      saveState();
    }
  }

  function generateAndRenderSlots() {
    var container = document.getElementById("slots-container");
    if (!container) return;

    if (!state.date || !state.service) {
      container.innerHTML =
        '<p class="text-muted" style="padding: 1rem 0;">Select a date to see available times.</p>';
      return;
    }

    var slots = generateTimeSlots(state.date, state.service.duration);

    if (slots.length === 0) {
      container.innerHTML =
        '<p class="text-muted" style="padding: 1rem 0;">No available slots for this date.</p>';
      return;
    }

    var html = "";
    for (var i = 0; i < slots.length; i++) {
      var slotId = "slot-" + i;
      var checked = i === 0 ? "checked" : "";
      html +=
        '<div class="slot-wrapper">' +
          '<input type="radio" name="time_slot_radio" value="' +
            slots[i].value +
          '" id="' + slotId + '" ' + checked + ">" +
          '<label for="' + slotId + '">' + slots[i].display + "</label>" +
        "</div>";
    }
    container.innerHTML = html;

    var firstInput = container.querySelector("input[type='radio']");
    if (firstInput) {
      state.slot = {
        value: firstInput.value,
        display: firstInput.value
      };
      var formTimeSlot = document.getElementById("form-time-slot");
      if (formTimeSlot) {
        formTimeSlot.value = firstInput.value;
      }
      updateSlotSummary();
      goToStep(3);
    }
    saveState();
  }

  function handleSlotChange() {
    var container = document.getElementById("slots-container");
    if (!container) return;

    var selected = container.querySelector("input[name='time_slot_radio']:checked");
    if (selected) {
      state.slot = {
        value: selected.value,
        display: selected.value
      };
      var formTimeSlot = document.getElementById("form-time-slot");
      if (formTimeSlot) {
        formTimeSlot.value = selected.value;
      }
      updateSlotSummary();
      goToStep(3);
      saveState();
    }
  }

  function updateSlotSummary() {
    var el = document.getElementById("selected-slot-summary");
    if (el && state.slot) {
      el.innerHTML =
        '<span class="summary-label">Time:</span> ' + state.slot.display;
      el.style.display = "block";
    } else if (el) {
      el.style.display = "none";
    }
  }

  function goToStep(step) {
    var steps = [
      document.getElementById("step-services"),
      document.getElementById("step-datetime"),
      document.getElementById("step-contact")
    ];

    var indicators = [
      document.getElementById("step1-indicator"),
      document.getElementById("step2-indicator"),
      document.getElementById("step3-indicator")
    ];

    for (var i = 0; i < steps.length; i++) {
      if (steps[i]) {
        steps[i].classList.add("hidden");
        steps[i].removeAttribute("aria-current");
      }
    }

    if (steps[step - 1]) {
      steps[step - 1].classList.remove("hidden");
      steps[step - 1].setAttribute("aria-current", "step");
    }

    for (var j = 0; j < indicators.length; j++) {
      if (indicators[j]) {
        indicators[j].classList.remove("active");
        indicators[j].removeAttribute("aria-current");
      }
    }
    if (indicators[step - 1]) {
      indicators[step - 1].classList.add("active");
      indicators[step - 1].setAttribute("aria-current", "step");
    }
  }

  function validateForm() {
    var nameInput = document.getElementById("name");
    var phoneInput = document.getElementById("phone");
    var errorEl = document.getElementById("form-error");

    var name = nameInput.value.trim();
    var phone = phoneInput.value.trim();

    if (!name) {
      showError("Please enter your full name.");
      nameInput.focus();
      return false;
    }

    if (!phone) {
      showError("Please enter your phone number.");
      phoneInput.focus();
      return false;
    }

    if (phone.length < 7) {
      showError("Please enter a valid phone number.");
      phoneInput.focus();
      return false;
    }

    var emailInput = document.getElementById("email");
    var email = emailInput.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Please enter a valid email address.");
      emailInput.focus();
      return false;
    }

    if (errorEl) {
      errorEl.style.display = "none";
      errorEl.textContent = "";
    }
    return true;
  }

  function showError(message) {
    var errorEl = document.getElementById("form-error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = "block";
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    if (!state.service || !state.slot) {
      showError("Please select a service and time slot.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    var submitBtn = document.getElementById("submit-btn");
    var submitText = document.getElementById("submit-text");
    var submitSpinner = document.getElementById("submit-spinner");

    if (submitBtn) {
      submitBtn.disabled = true;
    }
    if (submitText) {
      submitText.style.display = "none";
    }
    if (submitSpinner) {
      submitSpinner.style.display = "inline";
    }

    var payload = {
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      service: state.service.name,
      time_slot: state.slot.display,
      notes: document.getElementById("notes").value.trim()
    };

    var timedOut = false;
    var timeoutId = setTimeout(function() { timedOut = true; }, 15000);

    fetch(CONFIG.GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    })
    .then(function(response) {
      clearTimeout(timeoutId);
      if (timedOut) throw new Error("Request timed out");
      return response.json();
    })
    .then(function(data) {
      if (data.success) {
        var params = new URLSearchParams({
          name: payload.name,
          service: payload.service,
          time_slot: payload.time_slot
        });
        window.location.href = "thank-you.html?" + params.toString();
        setTimeout(function() { clearState(); }, 1000);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    })
    .catch(function(err) {
      clearTimeout(timeoutId);
      console.error("Submission failed:", err);
      showError("Booking failed. Please try again or call " + (CONFIG.CONTACT ? CONFIG.CONTACT.phone : "") + ".");
      if (submitBtn) submitBtn.disabled = false;
      if (submitText) submitText.style.display = "";
      if (submitSpinner) submitSpinner.style.display = "none";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
