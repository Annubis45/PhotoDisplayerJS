const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config.js');

var db;
exports.db = db

module.exports = {
    logVersion() {
        db.serialize(() => {
            db.each(`SELECT Name as Name,
                        Version as Version
                        FROM Applications`, (err, row) => {
                if (err) {
                    console.error(err.message);
                }
                console.log((new Date()).toUTCString()+' - ' +row.Name + "\t" + row.Version);
            });
            });
    },

    initDatabase() {
        db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS "Applications" ( "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE, "date_created" DATETIME DEFAULT CURRENT_TIMESTAMP, "Name" VARCHAR UNIQUE, "Version" VARCHAR );');
            db.run('CREATE TABLE IF NOT EXISTS "Photos" ( "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE, "date_created" DATETIME DEFAULT CURRENT_TIMESTAMP, "Name" VARCHAR, "Path" VARCHAR UNIQUE, "MD5" VARCHAR, "Note" INTEGER DEFAULT 10, "last_run" DATETIME DEFAULT CURRENT_TIMESTAMP);');
            db.run(`INSERT INTO Applications(name, version) VALUES('PhotoDisplayer','`+config.version+`') ON CONFLICT(name) DO UPDATE SET version='`+config.version+`';`);  
        });
    },

    connect(){
        db = new sqlite3.Database(config.database, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log((new Date()).toUTCString()+' - ' +'Connected to the database.');
        });
    },

    disconnect(){
        db.close();
    },

    getRandomImage(){
        return new Promise(function(resolve, reject) {
            db.serialize(() => {
                db.each(`SELECT Name as Name,
                            Path as Path, MD5 as MD5
                        FROM Photos ORDER BY RANDOM()*Note limit 1`, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err.message);
                    }else{
                        console.log((new Date()).toUTCString()+' - ' + JSON.stringify(row) )
                        resolve(row);
                    }
                });
            });
        });
    },

    getImage(idphoto)
    {
        return new Promise(function(resolve, reject) {
        let sql = `SELECT Name as Name, Path as Path FROM Photos where MD5 = ?`;

        // first row only
        db.get(sql, [idphoto], (err, row) => {
        if (err) {
            reject(err.message);
        }else{
            resolve(row);
        }
        });
    })
    },

    upsertImage(Name,Path,MD5)
    {
        db.serialize(() => {
            db.run(`INSERT INTO Photos(Name,Path,MD5) VALUES("`+Name+`","`+Path+`","`+MD5+`") ON CONFLICT(Path) DO UPDATE SET last_run=CURRENT_TIMESTAMP;`,function(err){
            if (err) {
                return console.log((new Date()).toUTCString()+' - ' +err.message + ' - Name = '+Name+ ' - Path = '+Path);
            }
            // get the last insert id
            console.log((new Date()).toUTCString()+' - ' +`A row has been inserted with rowid ${this.lastID}`);
            });
        });
    },

    cleanDb(shouldKeepImage)
    {
        db.serialize(() => {
            db.each(`SELECT id as Id, Name as Name,
                        Path as Path
                    FROM Photos`, (err, row) => {
            if (!err) {
                if(!shouldKeepImage(row.Path))
                {
                    console.log((new Date()).toUTCString()+' - ' +'Removing :' +row.Id + ' ' + row.Path)
                    db.run(`DELETE FROM Photos WHERE id=`+row.Id);
                }
            }
            });
        });
    },

    setNote(idPhoto,note)
    {
        db.serialize(() => {
            
            db.run(`UPDATE Photos SET Note=${note} where MD5=${idPhoto}`,function(err){
            if (err) {
                return console.log((new Date()).toUTCString()+' - ' +err.message + ' - Name = '+Name+ ' - Path = '+Path);
            }
            // get the last insert id
            console.log((new Date()).toUTCString()+' - ' +`Note of ${idPhoto} set to  ${note}`);
            });
        });
    },
    
    addToNote(idPhoto,num)
    {
        db.serialize(() => {
            
            db.run(`UPDATE Photos SET Note=Note+${num} where MD5=${idPhoto}`,function(err){
            if (err) {
                return console.log((new Date()).toUTCString()+' - ' +err.message + ' - Name = '+Name+ ' - Path = '+Path);
            }
            // get the last insert id
            console.log((new Date()).toUTCString()+' - ' +`Note of ${idPhoto} incremented by  ${num}`);
            });
        });
    }



    
}