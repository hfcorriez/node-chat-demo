/*
 * GET home page.
 */

exports.index = function (req, res) {
    var data = {
        title:'sleeping',
        cookie:req.cookies.test,
        session: req.session.test
    };
    res.render('index', data);
};