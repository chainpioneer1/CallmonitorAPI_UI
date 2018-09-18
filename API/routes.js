exports.list = function(req, res){
    
    req.getConnection(function(err, conn){
        conn.query('SELECT * FROM users ORDER BY id DESC', function(err, rows, fields){
            if(err){
                req.flash('error', err)
            }else{
                res.json(rows)
            }
        })
    })
}

exports.add = function(req, res){
    var input = JSON.parse(JSON.stringify(req.body));
   
    req.getConnection(function(err, conn){

        var data = {
            name: input.name,
            age: input.age,
            email: input.email
        };

        var query = conn.query("INSERT INTO users SET ?", data, function(err, rows){
            if(err){
                console.log('Error inserting : %s', err);
            }else{
                res.json(rows)
            }
        })
    })
}

exports.mark = function(req, res){
    var id = req.params.id;
    
    req.getConnection(function(err, conn){
        conn.query("UPDATE users SET marked=1 WHERE id = ?",[id],function(err, rows){
            if(err){
                console.log("Error updating : %s", err);
            }else{
                res.json(true)
            }
        })
    })
}

exports.deleteOne = function(req, res){
    var id = req.params.id;
    req.getConnection(function(err, conn){
        conn.query("DELETE FROM users WHERE id = ?", [id], function(err, rows){
            if(err){
                console.log("Error deleting : %s", err);
            }else{
                res.json(true)
            }
        })
    })
}


