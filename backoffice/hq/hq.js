(function () {
  var d = new Date();
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var dateEl = document.getElementById("hq-date");
  if (dateEl) {
    dateEl.textContent = days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate();
  }

  if (d.getDay() === 1) document.body.classList.add("is-monday");
  if (d.getDay() === 1 && d.getDate() <= 7) document.body.classList.add("is-first-monday");

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-copy");
      var el = document.getElementById(id);
      if (!el) return;
      var text = el.innerText.trim();
      function done() {
        var prev = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = prev; }, 1400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done);
      } else {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand("copy");
        sel.removeAllRanges();
        done();
      }
    });
  });
})();
