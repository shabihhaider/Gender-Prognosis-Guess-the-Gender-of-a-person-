let limit = 0;
        const countLimit = 3;
        const coolDownTime = 10 * 60 * 1000; //10 mins in milliseconds

        //Variables to store data
        let fullName = "";
        let gender = "";
        let count = "";
        let probability = "";

        function performSearch() {

            // @todo: you should get the flag from local storage for the limit.

            if (limit < countLimit) {
                limit++;

                    let popup = document.querySelector(".popup");
                    let overlay = document.querySelector(".overlay");

                    var name = $('#name').val().trim();

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
                            success: function(data) {

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
                                }
                                else {
                                    $(".popup").html(`<span>Gender could not recognize</span>`);
                                }

                                overlay.classList.add("overlay-active");
                                popup.classList.add("popup-active");
                            },
                            error: function(xhr) {
                                alert("Status: " + xhr.status + "  " + xhr.statusText);
                            }

                        });
            } else {
                alert(`Search limit reached. Now wait for 10 minutes.`);
                $(".btn").disabled = true;
                $("#name").disabled = true;
                setTimeout(resetSearchCount, coolDownTime);
            }
        }

        function setItem(fullName, gender, count, probability) {

            if (fullName && gender && count && probability) {
                // Get existing users from LocalStorage or initialize an empty array if none exist
                let users = JSON.parse(localStorage.getItem('users')) || [];

                // Create a new user object
                const user = { fullName, gender, count, probability };

                // Add the new user to the array
                users.push(user);

                // Save the updated array back to LocalStorage
                localStorage.setItem('users', JSON.stringify(users));

                // @todo: you should save a flag that has the time. So, you can check if 10 minutes passed or not.
                // And base on that flag user can performSearch or not.
                // Example: You can save the flag in LocalStorage with a key "searchTime" and value as current time in milliseconds.
                // Example: localStorage.setItem("searchTime", new Date().getTime());

                let searchTime = new Date().getTime() == (10 * 60 * 1000); // new is a keyword to create an object of Date class and getTime() is a method to get the current time in milliseconds
                console.log(localStorage.setItem("searchTime", searchTime));

                if (searchTime) {
                    limit = 0;
                    alert(`Search limit reset. You can search again.`);
                    resetSearchCount();
                }

            } else {
                alert(`Data didn't added to LocalStorage`);
            }
        }

        function resetSearchCount() {
            $(".popup").text(`You can now search again!`);
            $(".overlay").classList.remove("overlay-active");
            $(".popup").classList.remove("popup-active");
            $(".btn").disabled = false;
            $("#name").disabled = false;
        }

            $(document).ready(function() {
                $("#genderPredictionForm").on('submit', function(e){
                    e.preventDefault();
                    performSearch();
                });

                $(document).on('click', '.overlay', function() {
                    $(".popup").removeClass("popup-active");
                    $(this).removeClass("overlay-active");
                });
            });

            function showInHistory() {
                const users = JSON.parse(localStorage.getItem('users'));
                const tbody = document.querySelector(".table tbody");


                if (users && users.length > 0) {

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

                        tbody.append(row);
                    });
                }
                else {
                    tbody.innerHTML = `<tr>
                    <td colspan='5'>No users found</td>
                    </tr>`;
                }
            }

            document.addEventListener("DOMContentLoaded", function(){
                showInHistory();
            });
