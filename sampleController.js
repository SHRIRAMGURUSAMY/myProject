
async function testing(req, res) {
    try {
        const body = req.body;
        const a = [];
        const b = {}
        b.FIRSTNAME = body.firstName;
        b.LASTNAME = body.SecondName;
        a.push(b);
        return res.json({
            sucess: true,
            data: a
        });
    }
    catch (e)
    {
        return e;
    }
}

module.exports = {
    testing
}