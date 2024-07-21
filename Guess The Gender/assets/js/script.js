let limit = 0;
        const countLimit = 3;
        const coolDownTime = 10 * 60 * 1000; //10 mins in milliseconds
        
        //Variables to store data
        let fullName = "";
        let gender = "";
        let count = "";
        let probability = "";

        function performSearch() {

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