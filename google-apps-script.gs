function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (!data.name || !data.phone || !data.service || !data.time_slot) {
      return ContentService.createTextOutput(JSON.stringify({success: false, error: "Missing required fields"}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      new Date(),
      data.name,
      data.phone,
      data.email || "",
      data.service,
      data.time_slot,
      data.notes || ""
    ]);

    var barberEmail = "imran@barbershop.com";
    var subject = data.name + " has booked a " + data.service + " at " + data.time_slot;
    var body = "New Booking Received\n\n" +
      "Customer: " + data.name + "\n" +
      "Phone: " + data.phone + "\n" +
      "Email: " + (data.email || "N/A") + "\n" +
      "Service: " + data.service + "\n" +
      "Time Slot: " + data.time_slot + "\n" +
      "Notes: " + (data.notes || "None");

    MailApp.sendEmail({
      to: barberEmail,
      subject: subject,
      body: body
    });

    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
}
