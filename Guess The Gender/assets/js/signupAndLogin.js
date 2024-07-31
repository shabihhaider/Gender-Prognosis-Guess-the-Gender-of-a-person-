/* SignUp and LogIn */
const form = document.getElementById("form");
const firstNameInput = document.getElementById("firstname-input");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const repeatPasswordInput = document.getElementById("repeat-password-input");
const errorMessage = document.getElementById("error-message");

// Add Logout button if user is already logged in
if (localStorage.getItem("userLoggedIn") === "true") {
  addLogoutButton();
}

function addLogoutButton() {
  const nav = document.querySelector("nav");
  
  const logout = document.createElement("a");
  logout.href = "#";
  logout.id = "logout";
  logout.textContent = "Logout";

  nav.appendChild(logout);

  logout.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("userLoggedIn");
    window.location.href = "login.html";
  });
}

form.addEventListener("submit", (e) => {
  
  e.preventDefault(); // Prevent the form from submitting the traditional way
  let errors = [];
  
  let allUsersList = JSON.parse(localStorage.getItem("usersList")) || [];

  console.log(`allUsersList: ${allUsersList}`);
  if (firstNameInput) {
    errors = getSignupFormErrors(
      firstNameInput.value,
      emailInput.value,
      passwordInput.value,
      repeatPasswordInput.value
    );


    if (errors.length === 0) {
      const firstname = firstNameInput.value;
      const email = emailInput.value;
      const password = passwordInput.value;
      const repeatPassword = repeatPasswordInput.value;

      // Check if the user already exists
      const userExists = allUsersList.some((user) => user.email === email); // allusersList.some returns true if any user exists with the same email

      if (userExists) {
        errors.push("User already exists. Please log in instead.");
        errorMessage.innerText = errors.join(". ");
      } else {
        // Save all user data in an object
        const userList = { firstname, email, password, repeatPassword };

        allUsersList.push(userList);
        localStorage.setItem("usersList", JSON.stringify(allUsersList));

        console.log(`User details saved in local storage.`);

        // Set user as logged in
        localStorage.setItem("userLoggedIn", true);

        // Redirect user to home page
        window.location.href = "index.html";
      }
    } else {
      errorMessage.innerText = errors.join(". ");
    }
  } else {
    errors = getLoginFormErrors(emailInput.value, passwordInput.value);

    if (errors.length === 0) {
      const email = emailInput.value;
      const password = passwordInput.value;

      // Check if the user exists
      const user = allUsersList.find(
        (user) => user.email === email && user.password === password
      );

      if (user) {

        if (localStorage.getItem("userLoggedIn") === "true") {
          addLogoutButton();
        }

        // If user logs in, store flag in localStorage
        localStorage.setItem("userLoggedIn", true);
        userLoggedIn = true;

        // Redirect user to home page
        window.location.href = "index.html";

      } else {
        errors.push("User does not exist. Please sign up.");
        errorMessage.innerText = errors.join(". ");
      }
    } else {
      errorMessage.innerText = errors.join(". ");
    }
  }

});

function getSignupFormErrors(firstname, email, password, repeatPassword) {
  let errors = [];

  // Clear previous error highlights
  document.querySelectorAll(".highlight").forEach((element) => {
    element.classList.remove("incorrect");
  });

  if (firstname === "" || firstname == null) {
    errors.push(`Firstname is required`);
    firstNameInput.parentElement.classList.add("incorrect");
  }
  if (email === "" || email == null) {
    errors.push(`Email is required`);
    emailInput.parentElement.classList.add("incorrect");
  }
  if (password === "" || password == null) {
    errors.push(`Password is required`);
    passwordInput.parentElement.classList.add("incorrect");
  }

  if (password.length < 8 && password !== "") {
    errors.push(`Password must have at least 8 characters`);
    passwordInput.parentElement.classList.add("incorrect");
  }

  if (password !== repeatPassword) {
    errors.push(`Password does not match repeat password`);
    passwordInput.parentElement.classList.add("incorrect");
    repeatPasswordInput.parentElement.classList.add("incorrect");
  }

  return errors;
}

function getLoginFormErrors(email, password) {
  let errors = [];

  if (email === "" || email == null) {
    errors.push(`Email is required`);
    emailInput.parentElement.classList.add("incorrect");
  }
  if (password === "" || password == null) {
    errors.push(`Password is required`);
    passwordInput.parentElement.classList.add("incorrect");
  }

  return errors;
}

const allInputs = [
  firstNameInput,
  emailInput,
  passwordInput,
  repeatPasswordInput,
].filter((input) => input != null);

allInputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.parentElement.classList.contains("incorrect")) {
      input.parentElement.classList.remove("incorrect");
      errorMessage.innerText = "";
    }
  });
});
