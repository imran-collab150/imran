(function () {
  "use strict";

  // ============================================================
  // Utilities
  // ============================================================

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

  // ============================================================
  // State
  // ============================================================

  var state = {
    service: null,
    date: null,
    slot: null
  };

  // ============================================================
  // Initialize
  // ============================================================

  function init() {
    // Set FormSubmit endpoint on the booking form
    var form = document.getElementById("booking-form");
    if (form) {
      form.setAttribute("action", CONFIG.FORM_SUBMIT_URL);
      setupBookingPage();
    }

    // Render services preview on the landing page
    if (document.getElementById("services-grid")) {
      renderServicesPreview();
    }
  }

  // ============================================================
  // Landing Page (index.html)
  // ============================================================

  function renderServicesPreview() {
    var container = document.getElementById("services-grid");
    if (!container) return;

    var html = "";
    CONFIG.SERVICES.forEach(function (s) {
      html +=
        '<div class="service-card">' +
          '<div class="service-header">' +
            '<span class="service-name">' + s.name + "</span>" +
            '<span class="service-price">$' + s.price + "</span>" +
          "</div>" +
          '<div class="service-duration">' + s.duration + " min</div>" +
          '<div class="service-description text-muted">' + s.description + "</div>" +
        "</div>";
    });
    container.innerHTML = html;
  }

  // ============================================================
  // Booking Page (book.html)
  // ============================================================

  function setupBookingPage() {
    renderServiceCards();
    renderDateOptions();

    // Date dropdown change
    var dateSelect = document.getElementById("date-select");
    if (dateSelect) {
      dateSelect.addEventListener("change", handleDateChange);
    }

    // Slot selection (event delegation)
    var slotsContainer = document.getElementById("slots-container");
    if (slotsContainer) {
      slotsContainer.addEventListener("change", handleSlotChange);
    }

    // Back buttons
    var backBtns = document.querySelectorAll("[data-back]");
    for (var i = 0; i < backBtns.length; i++) {
      backBtns[i].addEventListener("click", function (e) {
        var target = e.currentTarget.getAttribute("data-back");
        goToStep(target);
      });
    }

    // Form submit
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
        '<div class="service-card" data-service-id="' + s.id + '">' +
          '<div class="service-header">' +
            '<span class="service-name">' + s.name + "</span>" +
            '<span class="service-price">$' + s.price + "</span>" +
          "</div>" +
          '<div class="service-duration">' + s.duration + " min</div>" +
          '<div class="service-description text-muted">' + s.description + "</div>" +
        "</div>";
    });
    container.innerHTML = html;

    // Attach click handlers via event delegation on container
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
  }

  function selectService(service) {
    state.service = service;
    state.date = null;
    state.slot = null;

    // Highlight selected card
    var cards = document.querySelectorAll("#services-container .service-card");
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.remove("selected");
    }
    var selectedCard = document.querySelector(
      '#services-container .service-card[data-service-id="' + service.id + '"]'
    );
    if (selectedCard) {
      selectedCard.classList.add("selected");
    }

    // Populate hidden field
    document.getElementById("form-service-name").value = service.name;

    // Show step 2 and update summary
    updateServiceSummary();
    goToStep(2);

    // Regenerate date options (fresh from today) and clear slots
    renderDateOptions();
    renderSlotsPlaceholder();
  }

  function updateServiceSummary() {
    var el = document.getElementById("selected-service-summary");
    if (el && state.service) {
      el.innerHTML =
        '<span class="summary-label">Selected:</span> ' +
        state.service.name +
        " ($" + state.service.price + " · " + state.service.duration + " min)";
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
      html += '<option value="' + val + '">' + formatDate(dates[i]) + "</option>";
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

    // Auto-select the first slot and advance
    var firstInput = container.querySelector("input[type='radio']");
    if (firstInput) {
      state.slot = {
        value: firstInput.value,
        display: firstInput.value
      };
      document.getElementById("form-time-slot").value = firstInput.value;
      updateSlotSummary();
      goToStep(3);
    }
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
      document.getElementById("form-time-slot").value = selected.value;
      updateSlotSummary();
      goToStep(3);
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

  // ============================================================
  // Step Navigation
  // ============================================================

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

    // Hide all steps
    for (var i = 0; i < steps.length; i++) {
      if (steps[i]) {
        steps[i].classList.add("hidden");
      }
    }

    // Show the requested step
    if (steps[step - 1]) {
      steps[step - 1].classList.remove("hidden");
    }

    // Update step indicator
    for (var j = 0; j < indicators.length; j++) {
      if (indicators[j]) {
        indicators[j].classList.remove("active");
      }
    }
    if (indicators[step - 1]) {
      indicators[step - 1].classList.add("active");
    }
  }

  // ============================================================
  // Form Submission
  // ============================================================

  function handleFormSubmit(e) {
    // Final check: ensure service and slot are set
    if (!state.service || !state.slot) {
      e.preventDefault();
      alert("Please select a service and time slot.");
      return;
    }

    // Populate hidden fields (belt and suspenders)
    document.getElementById("form-service-name").value = state.service.name;
    document.getElementById("form-time-slot").value = state.slot.display;

    // Form will submit natively to FormSubmit endpoint
    // FormSubmit will redirect to thank-you.html via _next hidden field
  }

  // ============================================================
  // Init
  // ============================================================

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
