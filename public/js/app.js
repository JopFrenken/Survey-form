let quizContainer = document.querySelector('.quiz-container');
let questionButton = document.querySelector('.btn-question');
let questionInput = document.querySelector("#questions");
let resetButton = document.querySelector(".reset-btn");
let truncateButton = document.querySelector(".truncate-btn");

// creates submit button
const submitButton = document.createElement('button');
submitButton.textContent = "End survey";
submitButton.classList.add("btn", "btn-primary", "mt-5");

let questionAmount = 0;
let questionText = "";
let questionArr = [];
let allQuestionsFilledIn = false;
let questionIndex = 0;

//#region question logic

const sendQuestionAmount = () => {
    questionButton.addEventListener('click', () => {
        let questionContent = questionInput.value;

        // checks if input is number
        if (!isNaN(questionContent) && questionContent.trim() !== '') {
            questionContent = Number(questionContent);

            // stops function when amount is not correct
            if (questionContent < 3 || questionContent > 10) {
                toastr.error("The question amount must be between 3 and 10.", { timeOut: 2000 });
                return;
            }

            let obj = {
                questions: questionContent,
                step: 2
            };

            // sets session
            fetch("api/question-amount", {
                method: "POST",
                body: JSON.stringify(obj),
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    questionAmount = data.questionAmount;
                    toastr.success(data.message, "Questions saved", { timeOut: 2000 });
                    displayQuestionBoxes();
                })
                .catch(error => {
                    console.error(error);
                    toastr.error("Failed to set question session.", "Error", { timeOut: 3000 });
                });

        } else {
            console.log("not a number");
        }
    })
}

const displayQuestionBoxes = () => {
    // removes any children in the quizcontainer
    while (quizContainer.firstChild) {
        quizContainer.removeChild(quizContainer.firstChild)
    }

    for (let i = 0; i < questionAmount; i++) {
        // adds new html when question amount is submitted
        const questionLabel = document.createElement('label');
        const questionTextBox = document.createElement("input");

        questionLabel.textContent = `Question: ${i + 1}`;
        questionLabel.classList.add("mt-4");
        questionTextBox.classList.add("form-control", "question-input", "mt-4");

        quizContainer.appendChild(questionLabel);
        quizContainer.appendChild(questionTextBox);
    }

    // adds submit button html
    const submitQuestionButton = document.createElement('button');
    submitQuestionButton.textContent = "Submit questions";
    submitQuestionButton.classList.add("btn", "btn-primary", "mt-5");
    quizContainer.appendChild(submitQuestionButton);
    const allQuestions = document.querySelectorAll('.question-input');

    submitQuestionButton.addEventListener(('click'), () => {
        sendQuestions(allQuestions);
    })
}

const sendQuestions = (arr) => {
    arr.forEach((element, index) => {
        if (element.value === "") {
            // goes out of the function when there's an empty question input
            toastr.error(`Please fill in question ${index + 1}.`, { timeOut: 1500 })
            return;
        }
        questionArr.push(element.value);
        allQuestionsFilledIn = true;
    })

    if (allQuestionsFilledIn) {
        let obj = {
            questions: questionArr,
            step: 3
        }

        // sets session
        fetch("api/question-text", {
            method: "POST",
            body: JSON.stringify(obj),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                toastr.success(data.message, "Success", { timeOut: 2000 });
                displayQuestions(data.questions);
            })
            .catch(error => {
                console.error(error);
                toastr.error("Failed to set question session.", "Error", { timeOut: 3000 });
            });
    }
}

const displayQuestions = (questions) => {
    // removes any children in the quizcontainer
    while (quizContainer.firstChild) {
        quizContainer.removeChild(quizContainer.firstChild)
    }

    const displayNextQuestion = (index) => {
        getSessionTable();
        const question = questions[index];

        // display question and the html for the question
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question', "d-flex", "align-items-center", "flex-column");
        questionDiv.innerHTML = `
        <h2>Question ${index + 1}</h2>
        <p>${question}</p>
        <input type="text" id="answer" class='answer form-control' name="answer">
        `;
        quizContainer.appendChild(questionDiv);

        // display "next" button
        const nextButton = document.createElement('button');
        nextButton.textContent = "Next";
        nextButton.classList.add("btn", "btn-primary", "mt-5");
        quizContainer.appendChild(nextButton);

        // go to next question on button click
        nextButton.addEventListener('click', () => {
            let answer = document.querySelector('.answer').value;
            if (answer == "") {
                toastr.error("Please answer the question.", { timeOut: 2000 })
                return;
            }
            let obj = {
                answer,
                index: index + 1,
                current_question: question
            }

            // sends question and answer to database
            submitQuestions(obj);

            // removes so it can add another one
            quizContainer.removeChild(questionDiv);
            quizContainer.removeChild(nextButton);

            if (index < questions.length - 1) {
                displayNextQuestion(index + 1);
            } else {
                // reached the end of the questions
                toastr.success("You've reached the end of the questions.", "Success", { timeOut: 2000 });
                // removes any children in the quizcontainer
                while (quizContainer.firstChild) {
                    quizContainer.removeChild(quizContainer.firstChild)
                }
                quizContainer.appendChild(submitButton);
                submitButton.addEventListener(('click'), () => {
                    destroySession();
                })

                fetch("api/submitButton", {
                    method: "GET"
                })
            }
        });
    };

    displayNextQuestion(questionIndex);
};

const submitQuestions = (obj) => {
    // set session
    fetch("api/question-answer", {
        method: "POST",
        body: JSON.stringify(obj),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            questionAmount = data.questionAmount;
            toastr.success(data.message, { timeOut: 2000 });
            getSessionTable();
        })
        .catch(error => {
            console.error(error);
            toastr.error("Failed to set question session.", "Error", { timeOut: 3000 });
        });
}

//#endregion

//#region step logic

const getCurrentStep = () => {
    // request for step data from session
    fetch("api/step", {
        method: "GET"
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            displayPageByStep(data);
        })
        .catch(error => {
            console.error(error);
            toastr.error("Failed to set question session.", "Error", { timeOut: 2000 });
        });
}

const displayPageByStep = (data) => {
    // knows what to display based on step gotten from session
    switch (data.step) {
        case 1: // base view
            console.log("Do nothing");
            break;
        case 2: // question boxes
            questionAmount = data.questionAmount;
            displayQuestionBoxes();
            break;
        case 3: // individual question
            if ("questionIndex" in data) {
                questionIndex = data.questionIndex;
            } else questionIndex = 0
            displayQuestions(data.allQuestions);
        case 4:
            // removes any children in the quizcontainer
            while (quizContainer.firstChild) {
                quizContainer.removeChild(quizContainer.firstChild)
            }
            quizContainer.appendChild(submitButton);
            submitButton.addEventListener(('click'), () => {
                destroySession();
            })
    }
}

//#endregion

//#region session functions
const destroySession = () => {
    // request to destroy the session
    fetch("api/destroy-session", {
        method: "GET"
    })
        .then(data => {
            window.location.reload();
        })
        .catch(error => {
            console.error(error);
        });
}

const getSessionTable = async () => {
    // dynamically updates session table without reloading
    const response = await fetch('api/session-table');
    const html = await response.text();
    document.querySelector('.session-table-container').innerHTML = html;
}
//#endregion

//#region button events

const reset = () => {
    resetButton.addEventListener(('click'), () => {
        destroySession();
    })
}

const truncate = () => {
    truncateButton.addEventListener(('click'), () => {
        // request to truncate table
        fetch("api/truncate", {
            method: "GET"
        })
            .then(data => {
                window.location.reload();
            })
            .catch(error => {
                console.error(error);
            });
    })
}

//#endregion

sendQuestionAmount();
getCurrentStep();
reset();
truncate();