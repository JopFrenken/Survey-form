const db = require("./utils/Database.js");

// api endpoints
module.exports = (app) => {
    app.get([ '/api/step' ], async (req, res) => {
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

    app.post([ '/api/question-amount'], async (req, res) => {
        const { body, session } = req;
        session.question_amount = body.questions;
        session.step = 2;
        let questionAmount = session.question_amount;
        res.json({ message: "Question session set.", questionAmount: questionAmount}); 
    })

    app.post([ '/api/question-text'], async (req, res) => {
        const { body, session } = req;
        session.step = 3;
        session.questions = [];

        body.questions.forEach((question) => {
            session.questions.push(question);
        })

        res.json({ message: "Question session set.", questions: session.questions}); 
    })

    app.post([ '/api/question-answer'], async (req, res) => {
        const { body, session } = req;
        session.question_index = body.index;
        session.current_question = body.current_question;

        db.$.SURVEY.SEND({
            token: session.token,
            question: session.current_question,
            answer: body.answer
        });

        res.json({ 
            message: "Question answered.",
            index: session.question_index,
            currentQuestion: session.current_question
        }); 
    })

    app.get(['/api/destroy-session'], async (req,res) =>{
        const { session } = req;
        session.destroy();
        res.json({message: "Session Destroyed"});
    })

    app.get(['/api/truncate'], async (req,res) =>{
        db.$.SURVEY.TRUNCATE();
        res.json({message: "Truncated"});
    })
}