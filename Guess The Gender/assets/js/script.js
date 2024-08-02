
let popup = document.querySelector(".popup");
let overlay = document.querySelector(".overlay");
const deleteAll = document.getElementById("delete-all");

let userLoggedIn = localStorage.getItem("userLoggedIn") === "true";

let limit = 0;
const countLimit = 3;
const coolDownTime = 10 * 60 * 1000; // 10 mins in milliseconds

let fullName = "";
let gender = "";
let count = "";
let probability = "";

// Add Logout button if user is already logged in
if (userLoggedIn) {
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
    userLoggedIn = false;
    window.location.href = "login.html";
  });
}

// Function to perform search
function performSearch() {
  console.log("performSearch called");

  // @todo: you should get the flag from local storage for the limit.
  
  let name = $("#name").val().trim();
  
  // Check if name is empty
  if (name == "") {
    $(".popup").html(`
                            <span class="close-btn">&times;</span>
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
                                        
                                        <span class="close-btn">&times;</span>
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
        $(".popup").html(`<span class="close-btn">&times;</span>
          <span>Gender could not recognize</span>`);
      }

      overlay.classList.add("overlay-active");
      popup.classList.add("popup-active");
    },
    error: function (xhr) {
      alert("Status: " + xhr.status + "  " + xhr.statusText);
      $(".popup").html(`<span class="close-btn">&times;</span>
        <span>Failed to fetch data. Please try again later.</span>`);
      overlay.classList.add("overlay-active");
      popup.classList.add("popup-active");
    }
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
  const tbody = document.querySelector(".table tbody");
  
  //When user click on this then remove all rows (localStorage clear)
  deleteAll.addEventListener("click", clearStorage);
  
  if (users && users.length > 0) {
    tbody.innerHTML = ''; // Clear the table body before adding rows
        users.forEach((user, index) => { // 'index' is the index of the current user in the users array
          const row = document.createElement("tr");

            row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.fullName}</td>
                <td>${user.gender}</td>
                <td>${user.count}</td>
                <td>${user.probability}</td>
                <td class="delete-individually">Delete</td>
            `;

            tbody.appendChild(row);
          });

          var table = $('#example').DataTable(); // Initialize DataTable here
          
          // Add print button event listener
          $('#printButton').click(function() {
            printTable(table);
          });

          // Add event listeners to the delete buttons after adding the rows
          document.querySelectorAll(".delete-individually").forEach(button => {
            button.addEventListener("click", clearStorageForIndividualRow);
        });
      } else {
        console.log("showInHistory called");
        tbody.innerHTML = `<tr>
        <td colspan='6'>No users found</td>
            </tr>`;
      }
}

// Function to print the table
function printTable(table) {

  // Disable pagination
  var settings = table.settings()[0]; // Get the DataTable settings
  settings._iDisplayLength = settings.fnRecordsTotal(); // Set the page length to the total number of records
  table.draw(); // Redraw the table means show all records

  // Hide unwanted elements during printing
  $('#delete-all').hide(); // Hide the 'delete all' button from the header
  $('#delete-all-second').hide(); // Hide the 'delete all' button from the footer
  $('.dataTables_paginate').hide(); // Hide the pagination buttons
  $('.dataTables_info').hide(); // Hide the 'showing x to y of z entries' info
  $('.dataTables_length').hide(); // Hide the 'showing entries (10, 25, ...)' length info
  $('.dataTables_filter').hide(); // Hide the search box
  $('.delete-individually').hide(); // Hide the 'delete' buttons
  
  // Print the table
  window.print();

  // Enable pagination
  settings._iDisplayLength = 10; // or whatever default length you want
  table.draw();

  // Show the hidden elements after printing
  $('#delete-all').show();
  $('#delete-all-second').show();
  $('.dataTables_paginate').show();
  $('.dataTables_info').show();
  $('.dataTables_length').show();
  $('.dataTables_filter').show();
  $('.delete-individually').show();
  
  // Reload the page
  location.reload();
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
        console.log(`Search limit reached. Now wait for 10 minutes.`);

        //If limit reached then show alert and disable the search button
        alert(`Search limit reached. Now wait for 10 minutes.`);
        $(".btn").prop("disabled", true);
        $("#name").prop("disabled", true);
        setTimeout(resetSearchCount, coolDownTime);
      }
    }
  });

  $(document).on("click", ".overlay" , function () {
    $(".popup").removeClass("popup-active");
    $(this).removeClass("overlay-active");
  });

  $(document).on("click", ".close-btn", function () {
    $(".popup").removeClass("popup-active");
    $(".overlay").removeClass("overlay-active");
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      $(".popup").removeClass("popup-active");
      $(".overlay").removeClass("overlay-active");
    }
  });

  // Call handleUserLogin to check user login status and display history
  handleUserLogin();
});




function clearStorage() {
  let userResponse = confirm("You are deleting All records. Are you sure?");

  if (userResponse) {
  localStorage.removeItem("users");
  // popup.innerHTML = `<p>All records cleared!`;

  // //Diplay the message
  // overlay.classList.add("overlay-active");
  // popup.classList.add("popup-active");

  document.querySelector(".table tbody").innerHTML = `<tr>
  <td colspan='6'>No users found</td>
  </tr>`;

  //Display popup message
  displayPopupMessage("All records cleared!");
}
  //Debugging
  console.log(`All records cleared!`);
  
}

//When user click on individual row then remove only that row ()
function clearStorageForIndividualRow(event) {
  console.log("delete button clicked");

  if (confirm("You are deleting this record. Are you sure?")) {

  // Find the row to be deleted
  const row = event.target.closest("tr"); // Get the closest parent 'tr' element
  const rowIndex = Array.from(row.parentElement.children).indexOf(row);
  console.log(`Row index: ${rowIndex}`);
  //Get the users from LocalStorage
  let users = JSON.parse(localStorage.getItem("users")) || [];

  //Remove the user from the array
  users.splice(rowIndex, 1);
  console.log(`Users: ${users}`);
  //Save the updated array back to LocalStorage
  localStorage.setItem("users", JSON.stringify(users));

  // Remove the row from the table
  row.remove();
  console.log(`Row removed`);
  // If no users left, update the table to show 'No users found'
  if (users.length === 0) {
    document.querySelector(".table tbody").innerHTML = `<tr>
    <td colspan='6'>No users found</td>
    </tr>`;
  console.log(`No users found`);
  }

  setTimeout(() => {
    // Reload the page
    location.reload();
  }, 100);
  }
  console.log(`Alert Record deleted!`);
}

if (userLoggedIn) {
  document.addEventListener("DOMContentLoaded", function () {
    // Remove the logIn button
    $(".login").remove();
  });
}