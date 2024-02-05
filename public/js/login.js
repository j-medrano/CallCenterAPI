var pwd = document.getElementById("pwd");
var eye = document.getElementById("eye");
var loginBtn = document.getElementById("parseLogin");

loginBtn.addEventListener("click", verifyLogin);
eye.addEventListener("click", togglePass);

function togglePass() {
  eye.classList.toggle("active");

  pwd.type == "password" ? (pwd.type = "text") : (pwd.type = "password");
}

// Form Validation
async function verifyLogin() {
  //  window.location.href = "http://localhost:3000/api/admin";
  var email = document.form1.email;
  var password = document.form1.password;
  var msg = document.getElementById("msg");
  msg.style.display = "none";

  if (email.value == "") {
    msg.style.display = "block";
    msg.innerHTML = "Please enter your email";
    email.focus();
    return;
  } else {
    msg.innerHTML = "";
  }

  if (password.value == "") {
    msg.style.display = "block";
    msg.innerHTML = "Please enter your password";
    password.focus();
    return;
  } else {
    msg.innerHTML = "";
  }
  var re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!re.test(email.value)) {
    msg.style.display = "block";
    msg.innerHTML = "Please enter a valid email";
    email.focus();
    return;
  } else {
    msg.innerHTML = "";
  }

  try {
    const res = await fetch("/api/user/login", {
      method: "POST",
      body: JSON.stringify({ email: email.value, password: password.value }),
      headers: { "Content-Type": "application/json" },
    });

    const token = res.headers.get("auth-token");
    console.log(token);

    if (res.status === 400 || res.status === 401) {
      msg.style.display = "block";
      msg.innerHTML = "Invalid Credentials.";
      return;
    }
    if (res.status === 200) {
      await localStorage.setItem("jwt", token);
      const stored_token = localStorage.getItem("jwt");

      const res = await fetch("/api/admin", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });

      if (res.status === 200) {
        // Access the admin page
        // This could be done by rendering a React component,
        // redirecting to a different URL, or some other method
        // depending on your implementation.

        // Get the user information from the response
        console.log("logged in.");

        // Log the current URL before redirecting

        // Redirect the user to the admin page
        window.location.href = "http://localhost:3000/api/admin?token=" + token;
        // Log the new URL after redirecting
      }
    }
  } catch (err) {
    console.log(err);
    msg.style.display = "block";
    msg.innerHTML = "Error logging in.";
  }
  // return false;
}
