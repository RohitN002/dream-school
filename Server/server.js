const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const dotenv = require('dotenv')
const app = express();
dotenv.config()
const port = process.env.PORT;
app.use(cors());
app.use(bodyParser.json());

app.use('./uploads', express.static(path.join(__dirname, 'uploads')),(err)=>{
    console.log("image ",err)
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '_' + uniqueSuffix);
    }
});

const storageExcel = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '_' + uniqueSuffix + extension);
    }
});

const upload = multer({ storage: storage });
const uploadExcel = multer({storage: storageExcel});

const db = mysql.createPool({
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    user: process.env.DBUSER,
    password:process.env.DBPWD,
    database: process.env.DBDB
});

(async () => {
    try {
        const connection = await db.getConnection();
        console.log("Database is connected successfully.");
        connection.release();
    } catch (err) {
        console.log("Database is not connected.", err.message);
    }
})();

const departmentController = require('./Controllers/departmentController')(db);
app.use('/department', departmentController);

const roleController = require('./Controllers/roleController')(db);
app.use('/role', roleController);

const classAndSecController = require('./Controllers/classAndSecController')(db);
app.use('/clsAndSec', classAndSecController);

const staffsMasterController = require('./Controllers/staffsMasterController')(db, upload);
app.use('/staffs', staffsMasterController);

const studentsMasterController = require('./Controllers/studentsMasterController')(db, upload);
app.use('/students', studentsMasterController);

const studentsAllocationController = require('./Controllers/studentsAllocationController')(db, upload);
app.use('/stuAllocation', studentsAllocationController);

const feesAllocationController = require('./Controllers/feesAllocationController')(db, upload);
app.use('/feeAllocation', feesAllocationController);

const feesLogsController = require('./Controllers/feesLogsController')(db, upload);
app.use('/feeLogs', feesLogsController);

const discountController = require('./Controllers/discountController')(db, upload);
app.use('/discount', discountController);

const classTeacherAndAttenance = require('./Controllers/classTeacherAndAttenance')(db);
app.use('/attenance', classTeacherAndAttenance);

const subjectController = require('./Controllers/subjectController')(db);
app.use('/subject', subjectController);

const staffAllocationController = require('./Controllers/staffAllocationController')(db);
app.use('/staffAllocation', staffAllocationController);

const classTeacherController = require('./Controllers/classTeacherController')(db);
app.use('/clsTeach', classTeacherController);

const dashboardController = require('./Controllers/dashboardController')(db);
app.use('/dashboard', dashboardController);

const timeTableController = require('./Controllers/timeTableController')(db,upload);
app.use('/timeTable', timeTableController);

const studentsUploadExcelController = require('./Controllers/studentsUploadExcelController')(db,uploadExcel);
app.use('/upload', studentsUploadExcelController);

app.listen(port, () => {
    console.log(`Server is running on ${port}...`);
});
