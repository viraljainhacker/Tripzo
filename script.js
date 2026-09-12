/* =========================
   STEP 1: GO TO SEATS
========================= */

function goToSeats() {
  let name = document.getElementById("name").value;
  let mobile = document.getElementById("mobile").value;
  let routeSelect = document.getElementById("route");

  if (!name || !mobile || !routeSelect.value) {
    alert("Fill all details");
    return;
  }

  let route = routeSelect.value;
  let fare = routeSelect.options[routeSelect.selectedIndex].dataset.fare;

  localStorage.setItem("name", name);
  localStorage.setItem("mobile", mobile);
  localStorage.setItem("route", route);
  localStorage.setItem("fare", fare);

  // reset old data
  localStorage.removeItem("selectedSeats");
  localStorage.removeItem("finalSeat");
  localStorage.removeItem("totalFare");

  window.location.href = "seats.html";
}

/* =========================
   STEP 2: SEAT GENERATION
========================= */

let busLayout = document.getElementById("busLayout");

if (busLayout) {
  let route = localStorage.getItem("route");

  if (!route) {
    alert("No route selected!");
    window.location.href = "booking.html";
  }

  let selectedSeats = JSON.parse(localStorage.getItem("selectedSeats") || "[]");

  // GLOBAL CLEANUP TIMER (ONLY ONCE)
  setInterval(() => {
    let now = Date.now();

    for (let i = 1; i <= 30; i++) {
      let key = route + "_lock_" + i;
      let time = localStorage.getItem(key);

      if (time && now - time > 10 * 60 * 1000) {
        localStorage.removeItem(key);
      }
    }
  }, 30000);

  for (let i = 1; i <= 30; i++) {
    let seat = document.createElement("div");
    seat.classList.add("seat");
    seat.innerText = i;

    // booked seats
    if (localStorage.getItem(route + "_seat" + i) === "booked") {
      seat.classList.add("booked");
    }

    // already selected highlight
    if (selectedSeats.includes(i)) {
      seat.classList.add("selected");
    }

    seat.addEventListener("click", function () {
      let seatNo = i;
      let lockKey = route + "_lock_" + seatNo;

      if (localStorage.getItem(lockKey)) {
        alert("Seat temporarily locked!");
        return;
      }

      if (seat.classList.contains("booked")) {
        alert("Seat already booked!");
        return;
      }

      // lock seat
      localStorage.setItem(lockKey, Date.now());

      if (seat.classList.contains("selected")) {
        seat.classList.remove("selected");

        selectedSeats = selectedSeats.filter((s) => s != seatNo);
      } else {
        seat.classList.add("selected");

        selectedSeats.push(seatNo);
      }

      localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
    });

    busLayout.appendChild(seat);
  }
}

/* =========================
   STEP 3: CONFIRM BOOKING
========================= */

function confirmBooking() {
  let seats = JSON.parse(localStorage.getItem("selectedSeats") || "[]");

  if (seats.length === 0) {
    alert("Select seats first");
    return;
  }

  let route = localStorage.getItem("route");
  let fare = Number(localStorage.getItem("fare"));

  let totalFare = fare * seats.length;

  localStorage.setItem("totalFare", totalFare);
  localStorage.setItem("finalSeat", seats.join(", "));

  // mark booked seats
  seats.forEach((seat) => {
    localStorage.setItem(route + "_seat" + seat, "booked");
  });

  window.location.href = "payment.html";
}

/* =========================
   STEP 4: TICKET DISPLAY
========================= */

if (document.getElementById("tName")) {
  // booking id generate
  if (!localStorage.getItem("bookingId")) {
    localStorage.setItem(
      "bookingId",
      "TRP" + Math.floor(Math.random() * 1000000),
    );
  }

  let qrText =
    "TRIPZO|" +
    localStorage.getItem("bookingId") +
    "|" +
    localStorage.getItem("finalSeat");

  let qr = document.getElementById("ticketQR");
  if (qr) {
    qr.src =
      "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" +
      encodeURIComponent(qrText);
  }

  document.getElementById("tName").innerText = localStorage.getItem("name");

  document.getElementById("tMobile").innerText = localStorage.getItem("mobile");

  document.getElementById("tRoute").innerText = localStorage.getItem("route");

  document.getElementById("tSeat").innerText =
    localStorage.getItem("finalSeat");

  document.getElementById("tFare").innerText =
    "₹" + localStorage.getItem("totalFare");

  document.getElementById("bookingId").innerText =
    localStorage.getItem("bookingId");
}

/* =========================
   DOWNLOAD TICKET
========================= */

function downloadTicket() {
  window.print();
}

/* =========================
   SHARE TICKET
========================= */

async function shareTicket() {
  const ticket = document.getElementById("ticketCard");

  if (!ticket) return;

  try {
    const canvas = await html2canvas(ticket);

    const image = canvas.toDataURL("image/png");

    if (navigator.share) {
      canvas.toBlob(async (blob) => {
        const file = new File([blob], "TRIPZO-Ticket.png", {
          type: "image/png",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "TRIPZO Ticket",
          });
        } else {
          downloadImage(image);
        }
      });
    } else {
      downloadImage(image);
    }
  } catch (err) {
    console.log(err);
    alert("Sharing failed");
  }
}

/* helper */
function downloadImage(image) {
  const link = document.createElement("a");
  link.href = image;
  link.download = "TRIPZO-Ticket.png";
  link.click();
}

/* =========================
   PAYMENT SUCCESS (FAKE FLOW)
========================= */

function paid() {
  let success = document.getElementById("success");

  if (success) {
    success.style.display = "block";
  }

  setTimeout(() => {
    window.location.href = "ticket.html";
  }, 2000);
}

/* =========================
   CLEANUP AFTER TICKET
========================= */

window.addEventListener("load", () => {
  if (window.location.pathname.includes("ticket.html")) {
    setTimeout(() => {
      localStorage.removeItem("selectedSeats");
      localStorage.removeItem("finalSeat");
      localStorage.removeItem("totalFare");
    }, 5000);
  }
});

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    const icon = menuBtn.querySelector("i");

    if (icon) {
      if (navLinks.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");
      } else {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      }
    }
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");

      const icon = menuBtn.querySelector("i");

      if (icon) {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      }
    });
  });
}
