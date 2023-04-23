const apiRouter = require("./api.js");
const db = require("./utils/Database.js");
const crypto = require('crypto');

// routes for the app
module.exports = (app) => {
    // homepage route
    app.get([ '/' ], async (req, res) => {
        const { session } = req;
        
        // sets session token when page loads
        if(!session.token) {
            session.token = crypto.randomUUID();
        }

        let surveys = await db.$.SURVEY.GET_ALL();
        console.log(surveys);

        res.render('home', {
            surveys: surveys || []
        });
    });

    // starts app server
    apiRouter(app);
    app.listen(4000, () => {
        console.log("Server running on http://localhost:4000");
    });

}