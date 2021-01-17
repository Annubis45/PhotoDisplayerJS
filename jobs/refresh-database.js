const fs = require('fs'); 
const database = require('../data/sqlite');
const md5File = require('md5-file');
const schedule = require('node-schedule');     
const config = require('../config/config.js');

module.exports = {
    updateDatabase : updateDatabase

}
function isAllowed(path)
{
    if(path.toLowerCase().includes('private'))
        return false;
    return true;
}

async function treatFile(path,file)
{
    const hash = md5File.sync(path+'/'+file);
    //console.log((new Date()).toUTCString()+' - ' +'treatFile : '+ path+'/'+file);
    if(/.jpeg|.jpg$/i.test(file) )
    {
        console.log((new Date()).toUTCString()+' - ' +'Inserting/Updating : '+ path+'/'+file);
        database.upsertImage(file.replace(/[^a-z0-9.]/gmi,'_'),path+'/'+file,hash);
    }
}

async function treatDir(path) {
    // list all files in the directory
    /*fs.readdir(path, (err, files) => {
        if (err)
            throw err;
        
        files.forEach(file => {
            try{
            if(isAllowed(path + "/" + file))
            {
                if (fs.statSync(path + "/" + file).isDirectory())
                    await treatDir(path + "/" + file);
                else
                    treatFile(path, file);
            }
            }catch( e)
            {
                console.log((new Date()).toUTCString()+' - ' +'ERROR : '+ e.message);
            }
        });
    });*/
    console.log((new Date()).toUTCString()+' - ' +'treatDir : '+ path);
    let folders =[];
    fs.readdirSync(path).forEach(function(file)
    {
        if (fs.statSync(path + "/" + file).isDirectory())
            folders.push(path + "/" + file);
        else
            treatFile(path, file);  
    });
    setTimeout(() => {
        folders.forEach(x => treatDir(x));
    }, 30*1000); 
    
}

function updateDatabase(){
    database.connect();
    database.initDatabase();
    //database.populate(db);
    database.logVersion();
    console.log((new Date()).toUTCString()+' - ' +'Cleaning Database');
    database.cleanDb(fs.existsSync);
    console.log((new Date()).toUTCString()+' - ' +'Updating Database');
    
    treatDir(config.databaseFolder);
    //database.disconnect();
}

schedule.scheduleJob(config.refreshdbCron, function(){
    
    updateDatabase();

});
