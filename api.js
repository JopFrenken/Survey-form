const session = require("express-session");
const db = require("./utils/Database.js");

// api endpoints
module.exports = (app) => {
    // gets data from session
    app.get(['/api/step'], async (req, res) => {
        const { session } = req;
        let step = session.step || 1;

        res.json({
            step,
            questionAmount: session.question_amount,
            allQuestions: session.questions,
            currentQuestion: session.current_question,
            questionIndex: session.question_index
        })
    });

    // saves question amount in session
    app.post(['/api/question-amount'], async (req, res) => {
        const { body, session } = req;
        session.question_amount = body.questions;
        session.step = 2;
        let questionAmount = session.question_amount;
        res.json({ message: "Question session set.", questionAmount: questionAmount });
    })

    // saves question in session
    app.post(['/api/question-text'], async (req, res) => {
        const { body, session } = req;
        session.step = 3;
        session.questions = [];

        body.questions.forEach((question) => {
            session.questions.push(question);
        })

        res.json({ message: "Question session set.", questions: session.questions });
    })

    // puts question & answer in database
    app.post(['/api/question-answer'], async (req, res) => {
        const { body, session } = req;
        session.question_index = body.index;
        session.current_question = body.current_question;
        session.answers.push(body.answer);

        db.$.SURVEY.SEND({
            token: session.token,
            question: session.current_question,
            answer: body.answer
        });

        res.json({
            message: "Question answered.",
            index: session.question_index,
            currentQuestion: session.current_question,
            answers: session.answers
        });
    })

    // destroys current session
    app.get(['/api/destroy-session'], async (req, res) => {
        const { session } = req;
        session.destroy();
        res.json({ message: "Session Destroyed" });
    })

    // truncates table
    app.get(['/api/truncate'], async (req, res) => {
        db.$.SURVEY.TRUNCATE();
        res.json({ message: "Truncated" });
    })

    // sets step to 4
    app.get(['/api/submitButton'], async (req, res) => {
        session.step = 4;
        res.json({ message: "Step 4 set" });
    })

    // display session table
    app.get(['/api/session-table'], async (req, res) => {
        const { session } = req;
        let allQuestionsAndAnswers = {
            questions: session.questions || [],
            answers: session.answers || []
        }
        // console.log(allQuestionsAndAnswers);

        res.render('components/sessionTable', {
            questionsAnswers: allQuestionsAndAnswers
        });
    })
}