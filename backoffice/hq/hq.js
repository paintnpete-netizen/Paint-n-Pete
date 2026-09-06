(function () {
  var BOOKING_URL = "https://www.paintnpete.com/contact";
  var BOOKING_SMS =
    "Here's the link to pick a time for your Paint'n Pete estimate: " + BOOKING_URL;

  var d = new Date();
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var hour = d.getHours();

  var dateEl = document.getElementById("hq-date");
  if (dateEl) {
    dateEl.textContent = days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate();
  }

  var greetEl = document.getElementById("hq-greeting");
  if (greetEl) {
    var timeWord = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    greetEl.textContent = timeWord + ", Noah.";
  }

  function flash(btn, label) {
    var prev = btn.textContent;
    btn.textContent = label || "Copied";
    btn.classList.add("copied");
    setTimeout(function () {
      btn.textContent = prev;
      btn.classList.remove("copied");
    }, 1600);
  }

  function copyText(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { flash(btn); });
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      flash(btn);
    }
  }

  function bindCopy(id) {
    var btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", function () {
        copyText(BOOKING_URL, btn);
      });
    }
  }

  bindCopy("copy-booking-link");
  bindCopy("copy-booking-quick");

  var smsBtn = document.getElementById("sms-booking-link");
  if (smsBtn) {
    smsBtn.addEventListener("click", function () {
      location.href = "sms:?&body=" + encodeURIComponent(BOOKING_SMS);
    });
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-copy");
      var el = document.getElementById(id);
      if (!el) return;
      copyText(el.innerText.trim(), btn);
    });
  });
})();
