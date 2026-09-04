var CONFIG = {
  SERVICES: [
    {
      id: "haircut",
      name: "Standard Haircut",
      price: 33000,
      duration: 30,
      description: "Classic men's haircut with scissors and comb for a clean, tailored look."
    },
    {
      id: "beard",
      name: "Beard Trim",
      price: 20000,
      duration: 15,
      description: "Precision beard shaping and trimming for a sharp, well-groomed appearance."
    },
    {
      id: "combo",
      name: "Haircut + Beard",
      price: 46500,
      duration: 45,
      description: "Complete grooming package — full haircut followed by detailed beard care."
    }
  ],
  SCHEDULE: {
    days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    dayNames: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    openHour: 9,
    closeHour: 18,
    slotIntervalMinutes: 30,
    weeksAhead: 2
  },
  CONTACT: {
    businessName: "Imran's Barber Shop",
    phone: "(555) 123-4567",
    email: "imran@barbershop.com",
    address: "123 Main Street, Your City, ST 12345"
  },
  FORM_SUBMIT_URL: "https://formsubmit.com/imran@barbershop.com"
};
