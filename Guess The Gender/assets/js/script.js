let popup = document.querySelector(".popup");
let overlay = document.querySelector(".overlay");
const deleteAll = document.getElementById("delete-all");
const deleteIndividual = document.getElementsByClassName("delete-individually");
let userLoggedIn = false;

let limit = 0;
const countLimit = 3;
const coolDownTime = 1 * 60 * 1000; //1 mins in milliseconds

//Variables to store data
let fullName = "";
let gender = "";
let count = "";
let probability = "";

function performSearch() {
  console.log("performSearch called");

  // @todo: you should get the flag from local storage for the limit.

  let name = $("#name").val().trim();

  // Check if name is empty
  if (name == "") {
    $(".popup").html(`
                            <div class="icons">
                                <i class="fa-solid fa-venus-mars"></i>
                            </div>
                            <p>Please enter a name.</p>`);
    overlay.classList.add("overlay-active");
    popup.classList.add("popup-active");
    return;
  }

  $.ajax({
    url: `https://api.genderize.io?name=${name}`,
    method: "GET",
    success: function (data) {
      if (data.gender) {
        fullName = data.name;
        gender = data.gender;
        count = data.count;
        probability = data.probability;

        // @todo: You should check if gender is null or empty (based on the API response), then display error.
        // Example: Enter "testnamenamename" as name and you will see gender is null in API response. Screenshot https://share.cleanshot.com/CnDMrB9BJ4CYklmJXfnj

        $(".popup").html(`
                                        <div class="icons">
                                            <i class="fa-solid fa-venus-mars"></i>
                                        </div>

                                        <div class="display-data">
                                            <p>
                                                <strong>Name: </strong> ${data.name}
                                            </p>
                                            
                                            <p>
                                                <strong>Gender: </strong> ${data.gender} 
                                            </p> 
                                            
                                            <p>
                                                <strong>Count: </strong> ${data.count} 
                                            </p> 
                                            
                                            <p>
                                                <strong>Probability: </strong> ${data.probability}
                                            </p>
                                        </div>
                                        `);
        // Store data in LocalStorage
        setItem(fullName, gender, count, probability);

        console.log(`Items Set`);
      } else {
        $(".popup").html(`<span>Gender could not recognize</span>`);
      }

      overlay.classList.add("overlay-active");
      popup.classList.add("popup-active");
    },
    error: function (xhr) {
      alert("Status: " + xhr.status + "  " + xhr.statusText);
      $(".popup").html(`<span>Failed to fetch data. Please try again later.</span>`);
      overlay.classList.add("overlay-active");
      popup.classList.add("popup-active");
    },
  });
}

// Function to set item in local storage
function setItem(fullName, gender, count, probability) {
  if (fullName && gender && count && probability) {
    // Get existing users from LocalStorage or initialize an empty array if none exist
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Create a new user object
    const user = { fullName, gender, count, probability };

    // Add the new user to the array
    users.push(user);

    // Save the updated array back to LocalStorage
    localStorage.setItem("users", JSON.stringify(users));

    // Save a flag with the current time in milliseconds
    localStorage.setItem("searchTime", Date.now());

    // @todo: you should save a flag that has the time. So, you can check if 10 minutes passed or not.
    // And base on that flag user can performSearch or not.
    // Example: You can save the flag in LocalStorage with a key "searchTime" and value as current time in milliseconds.
  } else {
    alert(`Data didn't added to LocalStorage`);
  }
}

// Function to reset search count
function resetSearchCount() {
  limit = 0; // Reset the limit counter
  console.log(`Search limit reset`);
  $(".popup").text(`You can now search again!`);
  overlay.classList.add("overlay-active");
  popup.classList.add("popup-active");
  $(".btn").prop("disabled", false);
  $("#name").prop("disabled", false);
}

// Function to show history
function showInHistory() {
  console.log("showInHistory called");

  const users = JSON.parse(localStorage.getItem("users")) || [];
  console.log(users);
  const tbody = document.querySelector(".table tbody");

  if (users && users.length > 0) {
    console.log("showInHistory called");
    users.forEach((user, index) => {
      const row = document.createElement("tr");

      const indexCell = document.createElement("td");
      indexCell.textContent = index + 1;
      row.appendChild(indexCell);

      const nameCell = document.createElement("td");
      nameCell.textContent = user.fullName;
      row.appendChild(nameCell);

      const genderCell = document.createElement("td");
      genderCell.textContent = user.gender;
      row.appendChild(genderCell);

      const countCell = document.createElement("td");
      countCell.textContent = user.count;
      row.appendChild(countCell);

      const probabilityCell = document.createElement("td");
      probabilityCell.textContent = user.probability;
      row.appendChild(probabilityCell);

      const deleteCell = document.createElement("td");
      deleteCell.textContent = `Delete`;
      deleteCell.classList.add("delete-individually");
      row.appendChild(deleteCell);

      tbody.append(row);
    });
  } else {
    console.log("showInHistory called");
    tbody.innerHTML = `<tr>
        <td colspan='6'>No users found</td>
        </tr>`;
  }
}

function handleUserLogin() {
  const userLogIn = localStorage.getItem("userLoggedIn") === "true";
  if (userLogIn) {
    showInHistory();
  } else {
    // Redirect to login page or handle accordingly
    const tbody = document.querySelector(".table tbody");
    tbody.innerHTML = `<tr>
    <td colspan='6'>Please LogIn to View History. <button>Click Here</button></td></tr>`;

    $(".table tbody tr button").on("click", function () {
      window.location.href = "login.html";
    });
  }
}


// Start the script
$(document).ready(function () {
  userLoggedIn = localStorage.getItem("userLoggedIn") === "true";

  $("#genderPredictionForm").on("submit", function (e) {
    e.preventDefault();

    console.log(`user logged in Check: ${userLoggedIn}`);

    if (userLoggedIn) {

      //User is logged in
      console.log(`User is logged in`);

      //Perform Search without any limit
      performSearch();
    } else {
      
      //User is not logged in
      console.log(`User is not logged in And Limit is: ${limit}`);

      //Perform Search with limit
      if (limit < countLimit) {
        limit++;
        performSearch();
      } else {
        console.log(`Search limit reached. Now wait for 1 minutes.`);

        //If limit reached then show alert and disable the search button
        alert(`Search limit reached. Now wait for 1 minutes.`);
        $(".btn").prop("disabled", true);
        $("#name").prop("disabled", true);
        setTimeout(resetSearchCount, coolDownTime);
      }
    }
  });

  $(document).on("click", ".overlay", function () {
    $(".popup").removeClass("popup-active");
    $(this).removeClass("overlay-active");
  });

  // Call handleUserLogin to check user login status and display history
  handleUserLogin();
});


//When user click on this then remove all rows (localStorage clear)
deleteAll.addEventListener("click", clearStorage);

function clearStorage() {
  localStorage.removeItem("users");
  // popup.innerHTML = `<p>All records cleared!`;

  // //Diplay the message
  // overlay.classList.add("overlay-active");
  // popup.classList.add("popup-active");

  document.querySelector(".table tbody").innerHTML = `<tr>
  <td colspan='6'>No users found</td>
  </tr>`;

  //Debugging
  console.log(`All records cleared!`);

  if (localStorage.getItem("users") == "" || localStorage.getItem("users") == null) {
    alert(`All records are already cleared!`);
  }
  else {
    alert(`All records cleared!`);
  }
  console.log(`All records cleared!`);
}

//When user click on individual row then remove only that row ()
document.querySelectorAll(".delete-individual").forEach(button => {
  button.addEventListener("click", clearStorageForIndividualRow);
});

function clearStorageForIndividualRow() {

}

/* SignUp and LogIn */
const form = document.getElementById("form");
const firstNameInput = document.getElementById("firstname-input");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const repeatPasswordInput = document.getElementById("repeat-password-input");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent the form from submitting the traditional way
  let errors = [];

  let allUsersList = JSON.parse(localStorage.getItem("usersList")) || [];

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

  remove10MinsOrNot(userLoggedIn);
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


// Function to handle 10 mins wait period
function remove10MinsOrNot(isuserLoggedIn) {
  if (isuserLoggedIn) {
    // Now user has unlimited search limit
  } else {
    // User can only search 3 times then wait for 10 mins and then search again
  }
}

function addLogoutButton() {
  const nav = document.querySelector("nav");
  let logout = document.querySelector("#logout");

  if (!logout) {
    logout = document.createElement("a");
    logout.href = "#";
    logout.id = "logout";
    logout.textContent = "Logout";
    nav.appendChild(logout);

    logout.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("userLoggedIn");
      userLoggedIn = false;
      window.location.href = "login.html";
    });
  }
}
