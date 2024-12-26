console.log("Starting script...");

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed.");

    const intro = document.getElementById("intro");
    if (intro) {
        console.log("Intro section found. Initiating fade-out sequence.");
        setTimeout(() => {
            console.log("Fading out the intro...");
            intro.style.animation = "fadeOut 1.5s ease-out forwards";
            setTimeout(() => {
                console.log("Removing intro from DOM.");
                intro.remove();
            }, 1500); // Remove intro completely after fade-out
        }, 3000); // Keep intro visible for 3 seconds
    } else {
        console.warn("Intro section not found. Skipping fade-out.");
    }

    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    console.log("All DOM element references established.");

    // Return true or false based on regex
    function validateUsername(username) {
        console.log("Validating username:", username);
        if (username.trim() === "") {
            alert("Username should not be empty.");
            console.error("Validation failed: Username is empty.");
            return false;
        }

        const regex = /^(?![-_])(?!.*[-_]{2})[a-zA-Z0-9_-]{4,15}(?<![-_])$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid username.");
            console.error("Validation failed: Username does not match regex.");
        } else {
            console.log("Validation passed for username:", username);
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {
        console.log("Fetching user details for username:", username);
        try {
            // Update button state while fetching
            console.log("Disabling search button and updating text...");
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            // Define URLs
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://leetcode.com/graphql/';
            const concatenatedUrl = proxyUrl + targetUrl;
            console.log("API URL constructed:", concatenatedUrl);

            // Set headers
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            console.log("Headers set for API request.");

            // GraphQL query
            const graphql = JSON.stringify({
                query: `
                  query userSessionProgress($username: String!) {
                    allQuestionsCount {
                      difficulty
                      count
                    }
                    matchedUser(username: $username) {
                      submitStats {
                        acSubmissionNum {
                          difficulty
                          count
                          submissions
                        }
                        totalSubmissionNum {
                          difficulty
                          count
                          submissions
                        }
                      }
                    }
                  }
                `,
                variables: { "username": username }
            });
            console.log("GraphQL query prepared.");

            // Request options
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow"
            };
            console.log("Sending API request...");
            
            // Fetch data
            const response = await fetch(concatenatedUrl, requestOptions);

            // Handle errors
            if (!response.ok) {
                console.error("API request failed with status:", response.status);
                throw new Error("Unable to fetch user details.");
            }

            console.log("API request successful. Parsing response...");
            const parsedData = await response.json();
            console.log("Parsed data:", parsedData);

            displayUserData(parsedData);

        } catch (error) {
            // Handle errors (e.g., network issues, API errors)
            console.error("Error occurred while fetching user details:", error);
        } finally {
            console.log("Re-enabling search button and resetting text.");
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        console.log(`Updating progress: Solved=${solved}, Total=${total}`);
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.innerHTML += `<p>${solved}/${total}</p>`;
        console.log(`Progress updated for circle and label.`);
    }

    function displayUserData(parsedData) {
        console.log("Displaying user data...");
        const totalQues = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count;
        console.log("Total questions fetched: Easy:", totalEasyQues, "Medium:", totalMediumQues, "Hard:", totalHardQues);

        const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;
        console.log("Solved questions fetched: Easy:", solvedTotalEasyQues, "Medium:", solvedTotalMediumQues, "Hard:", solvedTotalHardQues);

        updateProgress(solvedTotalEasyQues, solvedTotalQues, easyLabel, easyProgressCircle);
        updateProgress(solvedTotalMediumQues, solvedTotalQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedTotalHardQues, solvedTotalQues, hardLabel, hardProgressCircle);
    }

    searchButton.addEventListener("click", function () {
        const username = usernameInput.value;
        console.log("Search button clicked. Username entered:", username);
        if (validateUsername(username)) {
            console.log("Username validation passed. Initiating fetch...");
            fetchUserDetails(username);
        } else {
            console.log("Username validation failed.");
        }
    });
});
